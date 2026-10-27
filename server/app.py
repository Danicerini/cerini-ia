"""Pannello web per Ollama remoto: account, chat salvate, stato e gestione modelli, chat in streaming, Wake-on-LAN.

Avvio:  uvicorn app:app --host 0.0.0.0 --port 8080 --proxy-headers --forwarded-allow-ips='*'
Hash password:  python app.py hash-password
"""
import asyncio
import base64
import hashlib
import hmac
import html
import ipaddress
import json
import os
import re
import secrets
import smtplib
import socket
import sqlite3
import sys
import time
from contextlib import asynccontextmanager, contextmanager
from datetime import datetime, timedelta
from email.message import EmailMessage
from pathlib import Path

import httpx
import numpy as np
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# OLLAMA_URL e' solo il primo tentativo: il PC ha IP dinamico, se non risponde lo cerchiamo nella subnet
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_PORT = int(os.environ.get("OLLAMA_PORT", "11434"))
DISCOVER_SUBNET = os.environ.get("DISCOVER_SUBNET", "192.168.1.0/24")
DISCOVER_EVERY = 30  # secondi minimi tra due scansioni
KEEP_ALIVE = os.environ.get("KEEP_ALIVE", "15m")
# Memoria di lavoro del modello (token). 4096 di Ollama e' poco con strumenti e menu lunghi.
NUM_CTX = int(os.environ.get("NUM_CTX", "8192"))
# Modelli da usare solo per chiacchierare (es. le versioni abliterated): niente strumenti, niente memoria, contesto ridotto
FREE_MODEL_RE = re.compile(os.environ.get("FREE_MODELS", r"abliterat|uncensor|heretic"), re.I)
FREE_CTX = int(os.environ.get("FREE_CTX", "8192"))   # 12b su 8 GB di VRAM: 14,5 token/s a 8k, 10,5 a 16k
# Usati solo al primo avvio, per creare l'account admin nel database
ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASSWORD_HASH = os.environ.get("ADMIN_PASSWORD_HASH", "")
SECRET_KEY = os.environ.get("SECRET_KEY", "").encode()
SESSION_HOURS = int(os.environ.get("SESSION_HOURS", "168"))
WOL_MAC = os.environ.get("WOL_MAC", "")
WOL_BROADCAST = os.environ.get("WOL_BROADCAST", "192.168.1.255")
DATA_DIR = Path(os.environ.get("DATA_DIR", Path(__file__).parent / "data"))
PUBLIC_URL = os.environ.get("PUBLIC_URL", "").rstrip("/")
INVITE_HOURS = int(os.environ.get("INVITE_HOURS", "72"))
# Posta in uscita (facoltativa): senza SMTP_HOST il link d'invito si copia a mano
SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM = os.environ.get("SMTP_FROM", SMTP_USER)

# Dettatura vocale: servizio Whisper sul PC (stesso indirizzo di Ollama, porta diversa)
WHISPER_PORT = int(os.environ.get("WHISPER_PORT", "8765"))
WHISPER_TOKEN = os.environ.get("WHISPER_TOKEN", "")
MAX_AUDIO = 25 * 1024 * 1024

# Sicurezza della rete: solo cloudflared (Home Assistant) puo' dichiarare l'IP vero del visitatore;
# le richieste dirette sono accettate solo dalla LAN.
TRUSTED_PROXIES = {ip.strip() for ip in os.environ.get("TRUSTED_PROXIES", "").split(",") if ip.strip()}
DIRECT_NETS = [ipaddress.ip_network(n.strip()) for n in os.environ.get("DIRECT_NETS", "192.168.1.0/24,127.0.0.0/8").split(",") if n.strip()]
MAX_BODY = 32 * 1024 * 1024
# Origine del sito del locale (es. https://pizzeriadamario.example): le foto dei piatti nelle schede vengono da li'
SITE_ORIGIN = str(httpx.URL(os.environ["SITE_API_URL"]).copy_with(path="/", query=None)).rstrip("/") if os.environ.get("SITE_API_URL") else ""
MIN_PASSWORD = 10

COOKIE = "ollama_session"
STATIC = Path(__file__).parent / "static"
USERNAME_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{1,31}$")

# ---------------------------------------------------------------- password ---

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, salt_b64, dk_b64 = stored.split("$")
        if algo != "scrypt":
            return False
        dk = hashlib.scrypt(password.encode(), salt=base64.b64decode(salt_b64), n=2**14, r=8, p=1)
        return hmac.compare_digest(dk, base64.b64decode(dk_b64))
    except Exception:
        return False


COMMON_PASSWORDS = {"password", "password1", "password123", "1234567890", "12345678910", "qwertyuiop", "qwerty1234",
                    "iloveyou12", "ceriniia123", "ciaociao12", "amoremio12", "passw0rd12", "0123456789", "1111111111"}


def check_new_password(pw: str, username: str = ""):
    if len(pw) < MIN_PASSWORD:
        raise HTTPException(400, f"La password deve avere almeno {MIN_PASSWORD} caratteri")
    low = pw.lower()
    if low in COMMON_PASSWORDS or len(set(pw)) < 4 or (username and username.lower() in low):
        raise HTTPException(400, "Password troppo facile da indovinare: usa una frase o più parole")

# ---------------------------------------------------------------- database ---

@contextmanager
def db():
    """Connessione breve: commit all'uscita (rollback se c'e' un errore) e chiusura."""
    conn = sqlite3.connect(DATA_DIR / "app.db", timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def init_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with db() as c:
        c.executescript("""
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE COLLATE NOCASE,
            email TEXT NOT NULL DEFAULT '',
            pw_hash TEXT NOT NULL DEFAULT '',
            role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
            active INTEGER NOT NULL DEFAULT 1,
            session_ver INTEGER NOT NULL DEFAULT 0,
            created INTEGER NOT NULL,
            last_login INTEGER
        );
        -- Inviti per nuovi account (user_id NULL) o link per reimpostare la password (user_id valorizzato)
        CREATE TABLE IF NOT EXISTS invites (
            token TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT NOT NULL DEFAULT '',
            role TEXT NOT NULL DEFAULT 'user',
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_by INTEGER,
            created INTEGER NOT NULL,
            expires INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            model TEXT,
            created INTEGER NOT NULL,
            updated INTEGER NOT NULL,
            messages TEXT NOT NULL DEFAULT '[]'
        );
        CREATE INDEX IF NOT EXISTS chats_user ON chats(user_id, updated DESC);
        """)
        # Chat fissate in cima alla barra laterale (colonna aggiunta dopo: i database vecchi la ricevono qui)
        if "pinned" not in [r["name"] for r in c.execute("PRAGMA table_info(chats)")]:
            c.execute("ALTER TABLE chats ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0")
        # Preferenze dell'utente (es. quali azioni l'assistente puo' fare senza chiedere)
        if "prefs" not in [r["name"] for r in c.execute("PRAGMA table_info(users)")]:
            c.execute("ALTER TABLE users ADD COLUMN prefs TEXT NOT NULL DEFAULT '{}'")
        if not c.execute("SELECT 1 FROM users LIMIT 1").fetchone():
            c.execute("INSERT INTO users (username, pw_hash, role, created) VALUES (?, ?, 'admin', ?)",
                      (ADMIN_USER, ADMIN_PASSWORD_HASH, int(time.time())))
            print(f"Creato l'account admin '{ADMIN_USER}'", flush=True)


def local_now() -> datetime:
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("Europe/Rome"))
    except Exception:
        return datetime.now()


def fmt_ts(ts) -> str:
    """Data leggibile (ora italiana) da un timestamp in secondi, per il modello e per le mail."""
    if not ts:
        return "mai"
    try:
        from zoneinfo import ZoneInfo
        d = datetime.fromtimestamp(ts, ZoneInfo("Europe/Rome"))
    except Exception:
        d = datetime.fromtimestamp(ts)
    return d.strftime("%d/%m/%Y alle %H:%M")


def public_user(row) -> dict:
    return {k: row[k] for k in ("id", "username", "email", "role", "active", "created", "last_login")}

# ----------------------------------------------------------------- session ---

def make_token(uid: int, ver: int) -> str:
    payload = base64.urlsafe_b64encode(
        json.dumps({"uid": uid, "v": ver, "exp": int(time.time()) + SESSION_HOURS * 3600}).encode()
    ).decode()
    sig = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def read_token(token: str) -> dict | None:
    try:
        payload, sig = token.rsplit(".", 1)
        expected = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(base64.urlsafe_b64decode(payload))
        return data if data["exp"] > time.time() else None
    except Exception:
        return None


def require_user(request: Request) -> dict:
    data = read_token(request.cookies.get(COOKIE, ""))
    if not data or "uid" not in data:
        raise HTTPException(401, "Non autenticato")
    with db() as c:
        row = c.execute("SELECT * FROM users WHERE id = ?", (data["uid"],)).fetchone()
    # session_ver cambia quando si cambia password o si disattiva l'account: le vecchie sessioni decadono
    if not row or not row["active"] or row["session_ver"] != data["v"]:
        raise HTTPException(401, "Non autenticato")
    return dict(row)


def require_admin(user: dict = Depends(require_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(403, "Solo l'amministratore può farlo")
    return user


def set_session(request: Request, response: Response, user: dict):
    https = getattr(request.state, "https", False)
    response.set_cookie(COOKIE, make_token(user["id"], user["session_ver"]), max_age=SESSION_HOURS * 3600,
                        httponly=True, secure=https, samesite="strict")


def client_ip(request: Request) -> str:
    return getattr(request.state, "ip", None) or "?"


# Max 5 tentativi falliti ogni 15 minuti per IP, e max 10 all'ora sullo stesso nome utente
# (contro chi prova password da tanti indirizzi diversi)
_failures: dict[str, list[float]] = {}
_user_failures: dict[str, list[float]] = {}


def _recent(store: dict, key: str, window: int) -> list:
    now = time.time()
    store[key] = [t for t in store.get(key, []) if now - t < window]
    return store[key]


def too_many_failures(ip: str) -> bool:
    return len(_recent(_failures, ip, 900)) >= 5


def user_locked(username: str) -> bool:
    return len(_recent(_user_failures, username.lower(), 3600)) >= 10

# -------------------------------------------------------------------- mail ---

def base_url(request: Request) -> str:
    if PUBLIC_URL:
        return PUBLIC_URL
    proto = request.headers.get("x-forwarded-proto") or request.url.scheme
    host = request.headers.get("x-forwarded-host") or request.headers.get("host", "")
    return f"{proto}://{host}"


def _send_mail(to: str, subject: str, text: str, html_body: str | None = None):
    msg = EmailMessage()
    msg["From"], msg["To"], msg["Subject"] = SMTP_FROM, to, subject
    msg.set_content(text)
    if html_body:
        msg.add_alternative(html_body, subtype="html")
    if SMTP_PORT == 465:
        smtp = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=20)
    else:
        smtp = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20)
        smtp.starttls()
    with smtp:
        if SMTP_USER:
            smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(msg)


def mail_html(preheader: str, title: str, paragraphs: list[str], detail: tuple[str, str] | None,
              button: str, link: str, note: str) -> str:
    """Mail con layout a tabelle e stili in linea: e' l'unico modo che Gmail, Outlook e Apple Mail mostrano uguale."""
    e = html.escape
    font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
    paras = "".join(f'<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a3f47;">{p}</p>' for p in paragraphs)
    det = ""
    if detail:
        det = (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 28px;">'
               f'<tr><td style="background:#f3f4f6;border-radius:12px;padding:14px 18px;">'
               f'<div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#6b7280;margin-bottom:4px;">{e(detail[0])}</div>'
               f'<div style="font-size:18px;font-weight:600;color:#17191c;font-family:ui-monospace,Menlo,Consolas,monospace;">{e(detail[1])}</div>'
               f'</td></tr></table>')
    return f"""<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>{e(title)}</title></head>
<body style="margin:0;padding:0;background:#eef0f3;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{e(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0f3;">
<tr><td align="center" style="padding:40px 16px;font-family:{font};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
    <tr><td style="padding:0 4px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:34px;height:34px;background:#17191c;border-radius:9px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:700;font-size:17px;line-height:34px;font-family:{font};">C</td>
        <td style="padding-left:10px;font-size:16px;font-weight:600;color:#17191c;font-family:{font};">Cerini IA</td>
      </tr></table>
    </td></tr>
    <tr><td style="background:#ffffff;border-radius:18px;padding:40px 36px 36px;box-shadow:0 1px 3px rgba(16,24,40,.06);">
      <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;letter-spacing:-.02em;color:#17191c;font-weight:650;">{e(title)}</h1>
      {paras}
      {det}
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="background:#17191c;border-radius:12px;">
          <a href="{e(link)}" style="display:inline-block;padding:15px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;font-family:{font};">{e(button)}</a>
        </td></tr></table>
      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#6b7280;">{note}</p>
    </td></tr>
    <tr><td style="padding:22px 8px 0;font-size:12.5px;line-height:1.6;color:#8a9099;">
      Se il pulsante non funziona, copia questo indirizzo nel browser:<br>
      <a href="{e(link)}" style="color:#4b5563;word-break:break-all;">{e(link)}</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>"""


async def send_invite_mail(to: str, username: str, link: str, reset: bool, invited_by: str = "") -> str | None:
    """Ritorna None se la mail e' partita, altrimenti il motivo per cui non e' stata inviata."""
    if not SMTP_HOST:
        return "posta non configurata"
    if not to:
        return "nessun indirizzo email"
    e = html.escape
    note = f"Il link vale {INVITE_HOURS} ore e si può usare una volta sola. Se non aspettavi questa mail, puoi ignorarla."
    if reset:
        subject = "Scegli una nuova password per Cerini IA"
        title = "Scegli una nuova password"
        paras = [f"Ciao <b>{e(username)}</b>,", "è stato richiesto un link per cambiare la password del tuo account. Premi il pulsante e scegline una nuova."]
        button, preheader, detail = "Scegli la nuova password", "Il link per cambiare la password del tuo account Cerini IA.", None
        text = (f"Ciao {username},\n\nper scegliere una nuova password apri questo link:\n{link}\n\n{note}\n")
    else:
        subject = "Ti hanno invitato su Cerini IA"
        title = "Ti hanno invitato su Cerini IA"
        by = f" da <b>{e(invited_by)}</b>" if invited_by else ""
        paras = [f"Ciao <b>{e(username)}</b>,",
                 f"sei stato invitato{by} a usare Cerini IA, l'assistente che gira sul PC di casa. "
                 "Per entrare ti basta scegliere una password."]
        button, preheader, detail = "Scegli la password ed entra", f"Il tuo accesso a Cerini IA: nome utente {username}.", ("Il tuo nome utente", username)
        text = (f"Ciao {username},\n\nsei stato invitato a usare Cerini IA. Apri questo link e scegli la tua password:\n{link}\n\n"
                f"Il tuo nome utente è: {username}\n\n{note}\n")
    body = mail_html(preheader, title, paras, detail, button, link, e(note))
    try:
        await asyncio.to_thread(_send_mail, to, subject, text, body)
        return None
    except Exception as ex:
        return f"invio non riuscito ({ex})"

# --------------------------------------------------------------------- app ---

client = httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=2.5, read=600.0))


@asynccontextmanager
async def lifespan(_app):
    if len(SECRET_KEY) < 32:
        sys.exit("Configura SECRET_KEY (>=32 caratteri) nel file .env")
    init_db()
    init_memory_db()
    init_gmail_db()
    init_files_db()
    init_conv_db()
    init_power_db()
    init_watch_db()
    init_agenda_db()
    init_brain_db()
    init_usage_db()
    init_hb_db()
    init_clienti_db()
    backfill = asyncio.create_task(conv_backfill())
    watcher = asyncio.create_task(mail_watch_loop())
    fastmail = asyncio.create_task(mail_fast_loop())
    reminders = asyncio.create_task(agenda_loop())
    hb_requests = asyncio.create_task(hb_admin_loop())
    yield
    backfill.cancel()
    watcher.cancel()
    fastmail.cancel()
    reminders.cancel()
    hb_requests.cancel()
    await client.aclose()


app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)

CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; "
       f"img-src 'self' data: blob: {SITE_ORIGIN}; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; "
       "base-uri 'none'; form-action 'self'; object-src 'none'")
SEC_HEADERS = [
    (b"content-security-policy", CSP.encode()),
    (b"x-frame-options", b"DENY"),
    (b"x-content-type-options", b"nosniff"),
    (b"referrer-policy", b"no-referrer"),
    (b"permissions-policy", b"microphone=(self), camera=(), geolocation=(), payment=(), usb=()"),
    (b"cross-origin-opener-policy", b"same-origin"),
]


def _in_direct_nets(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return any(addr in n for n in DIRECT_NETS)


class Security:
    """Prima di ogni richiesta: chi la manda (proxy fidato o LAN), dimensione, provenienza; dopo: intestazioni di sicurezza."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)
        hdr = {k.decode("latin-1").lower(): v.decode("latin-1") for k, v in scope["headers"]}
        path, query = scope.get("path", ""), scope.get("query_string", b"").decode("latin-1")
        peer = (scope.get("client") or ("", 0))[0]

        async def reject(code: int, msg: str):
            await JSONResponse({"detail": msg}, status_code=code, headers={k.decode(): v.decode() for k, v in SEC_HEADERS})(scope, receive, send)

        if peer in TRUSTED_PROXIES:
            ip = hdr.get("cf-connecting-ip") or hdr.get("x-forwarded-for", "").split(",")[0].strip() or peer
            https = hdr.get("x-forwarded-proto") == "https"
        elif _in_direct_nets(peer):
            ip, https = peer, scope.get("scheme") == "https"
        else:
            print(f"Rifiutata richiesta diretta da {peer}", flush=True)
            return await reject(403, "Accesso non consentito")
        scope.setdefault("state", {})
        scope["state"]["ip"], scope["state"]["https"] = ip, https

        try:
            if int(hdr.get("content-length") or 0) > MAX_BODY:
                return await reject(413, "Richiesta troppo grande")
        except ValueError:
            return await reject(400, "Richiesta non valida")
        # Le richieste che cambiano qualcosa devono partire da questo sito (difesa in piu' oltre al cookie SameSite)
        if scope["method"] not in ("GET", "HEAD", "OPTIONS") and hdr.get("origin"):
            allowed = {f"http://{hdr.get('host', '')}", f"https://{hdr.get('host', '')}"}
            if PUBLIC_URL:
                allowed.add(PUBLIC_URL)
            if hdr["origin"].rstrip("/") not in allowed:
                return await reject(403, "Richiesta proveniente da un altro sito")

        async def send_secure(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", [])) + SEC_HEADERS
                # Librerie (non cambiano mai nome): cache lunga. Il resto dei file statici: sempre ricontrollato.
                if path.startswith("/static/"):
                    headers = [(k, v) for k, v in headers if k.lower() != b"cache-control"]
                    headers.append((b"cache-control", b"public, max-age=31536000, immutable" if path.startswith("/static/vendor/")
                                    or "v=" in query else b"no-cache"))
                if https:
                    headers.append((b"strict-transport-security", b"max-age=31536000"))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_secure)


app.add_middleware(Security)
app.mount("/static", StaticFiles(directory=STATIC), name="static")


# ---------------------------------------------------------------- le parti ---
# Il resto dell'app sta in parti/, un file per argomento. Ogni parte viene eseguita qui dentro, nello stesso spazio
# di nomi di app.py: per il codice e' come se fosse ancora un file solo (e «import app» vede tutto, come prima).
# L'ordine conta: le rotte si registrano in quest'ordine.
PARTI = ["modelli", "strumenti", "chat", "gmail", "agenda", "web", "file", "homebase", "aura_scrive", "homebase_admin", "cloud", "cervello", "conversazioni", "procedure", "clienti"]
for _parte in PARTI:
    _f = Path(__file__).parent / "parti" / f"{_parte}.py"
    exec(compile(_f.read_text(encoding="utf-8"), str(_f), "exec"))


if __name__ == "__main__":
    import getpass

    def ask_password() -> str:
        pw = getpass.getpass("Nuova password: ")
        if pw != getpass.getpass("Ripeti: "):
            sys.exit("Le password non coincidono")
        return pw

    if sys.argv[1:] == ["hash-password"]:
        print(hash_password(ask_password()))
    elif len(sys.argv) == 3 and sys.argv[1] == "set-password":
        # Reimposta la password di un utente gia' nel database (es. se l'admin la dimentica)
        init_db()
        pw = ask_password()
        with db() as c:
            n = c.execute("UPDATE users SET pw_hash = ?, session_ver = session_ver + 1, active = 1 WHERE username = ?",
                          (hash_password(pw), sys.argv[2])).rowcount
        sys.exit(0 if n else f"Utente '{sys.argv[2]}' non trovato")
    else:
        sys.exit("Uso: python app.py hash-password | set-password <utente>")
