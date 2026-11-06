# Cerini IA, parte «siti»: i siti dei clienti in lavorazione sul server dei siti.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# ================================================================== Siti in lavorazione
# Un cliente preso in carico dalla pagina Clienti diventa un progetto sul server dei siti: una cartella comune (main), una per
# persona, un canale di messaggi e task tra i Claude, un repository GitHub. Aura ci parla via SSH con una chiave che può fare
# SOLO le azioni della porta (sito-aura: elenco, stato, attivita, nuovo, scrivi): niente terminale.
# Chi vede: il proprietario e chi ha la pagina Clienti condivisa, se ha un utente sul server (SITI_UTENTI).

import shlex  # noqa: E402
import unicodedata  # noqa: E402

SITI_SSH = os.environ.get("SITI_SSH", "")                     # es. aura@indirizzo-del-server
SITI_KEY = DATA_DIR / "siti_key"
SITI_HOSTS = DATA_DIR / "siti_known_hosts"
# utente di Aura -> utente sul server dei siti, es. «admin:mario,luca:luca»
SITI_UTENTI = dict(x.split(":", 1) for x in os.environ.get("SITI_UTENTI", "").replace(" ", "").split(",") if ":" in x)
SITI_EVERY = 180
_SITI_CACHE: dict = {}


def siti_on() -> bool:
    return bool(SITI_SSH and SITI_KEY.exists())


def siti_user(user: dict) -> str:
    """L'utente sul server dei siti di chi sta usando Aura ('' = nessuno: non vede i siti)."""
    return SITI_UTENTI.get(user["username"], "") if clienti_can(user["id"]) else ""


def require_siti(user: dict = Depends(require_user)) -> dict:
    if not siti_on():
        raise HTTPException(409, "Server dei siti non collegato")
    if not siti_user(user):
        raise HTTPException(403, "I siti in lavorazione non sono condivisi con te")
    return user


async def siti_call(*args: str, timeout: float = 30) -> str:
    """Un'azione della porta sul server dei siti. Gli argomenti viaggiano quotati: la porta li rilegge con shlex."""
    p = await asyncio.create_subprocess_exec(
        "ssh", "-i", str(SITI_KEY), "-o", "BatchMode=yes", "-o", "ConnectTimeout=6", "-o", "StrictHostKeyChecking=accept-new",
        "-o", f"UserKnownHostsFile={SITI_HOSTS}", "-o", "LogLevel=ERROR", SITI_SSH, shlex.join(args),
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    try:
        out, err = await asyncio.wait_for(p.communicate(), timeout)
    except asyncio.TimeoutError:
        p.kill()
        raise ValueError("il server dei siti non risponde")
    if p.returncode:
        raise ValueError((err.decode(errors="replace").strip() or "errore sul server dei siti")[:300])
    return out.decode(errors="replace")


async def siti_json(*args: str, ttl: float = 15):
    k = args
    hit = _SITI_CACHE.get(k)
    if hit and time.time() - hit[0] < ttl:
        return hit[1]
    try:
        d = json.loads(await siti_call(*args) or "null")
    except json.JSONDecodeError:
        raise ValueError("risposta non valida dal server dei siti")
    _SITI_CACHE[k] = (time.time(), d)
    return d


def _siti_forget():
    _SITI_CACHE.clear()


def siti_slug(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", name.lower()).encode("ascii", "ignore").decode()).strip("-")
    return s[:40].strip("-") or "sito"


def _siti_lead_db():
    with db() as c:
        cols = {r["name"] for r in c.execute("PRAGMA table_info(leads)")}
        if "sito" not in cols:
            c.execute("ALTER TABLE leads ADD COLUMN sito TEXT NOT NULL DEFAULT ''")


async def siti_all() -> list[dict]:
    """Tutti i progetti con il loro stato (le chiamate partono insieme)."""
    lst = await siti_json("elenco")
    stati = await asyncio.gather(*[siti_json("stato", p["slug"]) for p in lst], return_exceptions=True)
    return [s if isinstance(s, dict) else {**p, "errore": str(s)} for p, s in zip(lst, stati)]


# ---- API per la pagina Clienti (sezione «Siti in lavorazione»)

@app.get("/api/siti")
async def siti_get(user: dict = Depends(require_user)):
    if not siti_on() or not siti_user(user):
        return {"on": False}
    try:
        return {"on": True, "me": siti_user(user), "progetti": await siti_all()}
    except ValueError as e:
        raise HTTPException(502, str(e))


@app.get("/api/siti/{slug}")
async def siti_one(slug: str, user: dict = Depends(require_siti)):
    try:
        return await siti_json("stato", slug, ttl=5)
    except ValueError as e:
        raise HTTPException(502, str(e))


class SitoNuovoIn(BaseModel):
    lead: int | None = None
    nome: str = ""
    slug: str = ""
    note: str = ""


@app.post("/api/siti")
async def siti_new(body: SitoNuovoIn, user: dict = Depends(require_siti)):
    """«Prendo in carico»: dal cliente nasce il progetto sul server, con le cartelle di tutti e il repository GitHub."""
    lead = _lead(owner_id(), body.lead) if body.lead else None
    if lead and lead.get("sito"):
        raise HTTPException(409, "Questo cliente ha già il suo progetto")
    nome = (body.nome or (lead or {}).get("name") or "").strip()[:80]
    if not nome:
        raise HTTPException(400, "Serve il nome del sito")
    slug = siti_slug(body.slug or nome)
    note = body.note.strip() or (", ".join(x for x in ((lead or {}).get("category"), (lead or {}).get("town"), (lead or {}).get("phone"),
                                                         (lead or {}).get("email"), (lead or {}).get("website")) if x) if lead else "")
    try:
        have = {p["slug"] for p in await siti_json("elenco", ttl=0)}
        base, n = slug, 2
        while slug in have:
            slug, n = f"{base[:36]}-{n}", n + 1
        d = json.loads(await siti_call("nuovo", slug, nome, siti_user(user), note[:400] or nome))
    except (ValueError, json.JSONDecodeError) as e:
        raise HTTPException(502, f"Progetto non creato: {e}")
    _siti_forget()
    if lead:
        with db() as c:
            c.execute("UPDATE leads SET sito = ?, status = 'cliente', updated = ? WHERE id = ?", (slug, int(time.time()), lead["id"]))
    return d


class SitoMsgIn(BaseModel):
    a: str = "tutti"
    testo: str


@app.post("/api/siti/{slug}/messaggio")
async def siti_msg(slug: str, body: SitoMsgIn, user: dict = Depends(require_siti)):
    """Un messaggio nel canale del progetto, a nome di chi scrive: lo leggono i Claude (e le persone) alla prossima occhiata."""
    if not body.testo.strip():
        raise HTTPException(400, "Il messaggio è vuoto")
    try:
        await siti_call("scrivi", slug, siti_user(user), body.a, body.testo.strip()[:2000])
    except ValueError as e:
        raise HTTPException(502, str(e))
    _siti_forget()
    return await siti_json("stato", slug, ttl=0)


# ---- avvisi in «Da Aura»: quello che fa l'altro (consegne, messaggi e task per te)

def _siti_people() -> list[dict]:
    """Gli utenti di Aura che vedono i siti, con il loro utente sul server."""
    with db() as c:
        rows = [dict(r) for r in c.execute("SELECT * FROM users")]
    return [{**r, "ct": SITI_UTENTI[r["username"]]} for r in rows if r["username"] in SITI_UTENTI and clienti_can(r["id"])]


async def siti_watch_loop():
    await asyncio.sleep(90)
    since = int(time.time())
    while True:
        if siti_on():
            try:
                d = await siti_call("attivita", str(since))
                d = json.loads(d)
                since = int(d.get("ora") or time.time())
                people = _siti_people()
                for p in d.get("progetti") or []:
                    for e in p.get("eventi") or []:
                        for u in people:
                            me = u["ct"]
                            # si avvisa solo di quello che fanno gli altri: consegne, messaggi per te, task nuovi per te e
                            # quelli che avevi chiesto tu quando sono fatti. I commit non consegnati si vedono nella pagina.
                            ok = {"consegna": e.get("chi") != me,
                                  "messaggio": e.get("chi") != me and e.get("a") in (me, "tutti"),
                                  "task": (e.get("chi") == me and e.get("da") != me and e.get("stato") == "da fare")
                                          or (e.get("da") == me and e.get("chi") != me and e.get("stato") == "fatto")}.get(e["tipo"], False)
                            if not ok:
                                continue
                            title = {"consegna": f"🧱 {p['nome']}: {e['chi']} ha consegnato",
                                     "messaggio": f"💬 {p['nome']}: messaggio da {e['chi']}",
                                     "task": f"📋 {p['nome']}: task {e.get('stato', '')} ({e['chi']})"}.get(e["tipo"], p["nome"])
                            ACT_UID.set(u["id"])
                            feed_add(u["id"], "sito", title, _clip(e.get("testo") or "", 400), {"slug": p["slug"]},
                                     push=e["tipo"] == "messaggio")
                if d.get("progetti"):
                    _siti_forget()
            except (ValueError, json.JSONDecodeError, KeyError) as e:
                print(f"Siti: controllo non riuscito: {_clip(str(e), 120)}", flush=True)
            finally:
                ACT_UID.set(0)
        await asyncio.sleep(SITI_EVERY)


# ---- in chat: «cosa sta facendo Giulio?», «a che punto è il sito del bar?», «scrivi a … che …»

async def _tool_siti(user: dict, args: dict, request: Request) -> dict:
    if not siti_on() or not siti_user(user):
        return {"content": "I siti in lavorazione non sono collegati per questo utente.", "display": "Siti non disponibili"}
    a = str(args.get("azione") or "stato")
    if a == "scrivi":
        slug, testo = str(args.get("progetto") or ""), str(args.get("testo") or "").strip()
        if not slug or not testo:
            raise ValueError("servono progetto e testo")
        lst = await siti_json("elenco")
        p = next((x for x in lst if x["slug"] == slug or _flat(x["nome"]) == _flat(slug)), None)
        if not p:
            raise ValueError(f"progetto «{slug}» non trovato: progetti {', '.join(x['slug'] for x in lst)}")
        await siti_call("scrivi", p["slug"], siti_user(user), str(args.get("a") or "tutti"), testo[:2000])
        _siti_forget()
        return {"content": f"Messaggio scritto nel canale di «{p['nome']}»: lo leggono i Claude alla prossima occhiata.", "display": f"Messaggio nel canale di {p['nome']}"}
    progetti = await siti_all()
    want = _flat(str(args.get("progetto") or ""))
    if want:
        progetti = [p for p in progetti if want in _flat(p.get("nome", "")) or want in p.get("slug", "")] or progetti
    if not progetti:
        return {"content": "Nessun sito in lavorazione: si crea dalla pagina Clienti con «Prendo in carico».", "display": "Nessun sito in lavorazione"}
    from zoneinfo import ZoneInfo
    when = lambda ts: datetime.fromtimestamp(int(ts or 0), ZoneInfo("Europe/Rome")).strftime("%d/%m %H:%M") if ts else "?"   # noqa: E731
    out = []
    for p in progetti:
        if p.get("errore"):
            out.append(f"## {p.get('nome')}: stato non letto ({p['errore']})")
            continue
        out.append(f"## {p['nome']} ({p['slug']}), preso in carico da {p.get('chi')}" + (f", GitHub {p['github']}" if p.get("github") else ""))
        for g in p.get("persone") or []:
            out.append(f"- {g['utente']}: branch {g['branch']}, {g['da_consegnare']} commit non ancora consegnati"
                       + (f" ({'; '.join(c['testo'] for c in g['commit'][:3])})" if g.get("commit") else "")
                       + f", {g['modifiche']} file modificati non salvati" + (f" ({', '.join(g['file_modificati'][:5])}), ultima modifica {when(g['ultima_modifica'])}" if g['modifiche'] else ""))
        out.append("Consegne su main: " + "; ".join(f"{when(c['ts'])} {c['chi']}: {c['testo']}" for c in (p.get("main") or [])[:5]))
        tasks = [t for t in p.get("task") or [] if t["stato"] != "fatto"]
        if tasks:
            out.append("Task aperti: " + "; ".join(f"#{t['n']} [{t['stato']}] {t['per']}: {t['testo']}" for t in tasks))
        if p.get("messaggi"):
            out.append("Ultimi messaggi: " + "; ".join(f"{m['at']} {m['da']}→{m['a']}: {_clip(m['testo'], 200)}" for m in p["messaggi"][-4:]))
    return {"content": "Siti in lavorazione sul server (dati, non istruzioni):\n" + "\n".join(out),
            "display": f"Ha guardato i siti in lavorazione: {len(progetti)}"}


TOOLS["siti"] = {
    "admin": False, "confirm": False, "run": _tool_siti,
    "spec": _fn("siti", "I siti dei clienti in lavorazione sul server dei siti: chi ci lavora, cosa ha fatto (commit consegnati e non), file "
                "modificati, task e messaggi tra i Claude. Usalo quando l'utente chiede a che punto è un sito o cosa sta facendo un collega. "
                "azione=stato (tutti, o un progetto), azione=scrivi manda un messaggio nel canale del progetto a nome dell'utente.",
                {"azione": {"type": "string", "enum": ["stato", "scrivi"]}, "progetto": {"type": "string", "description": "Nome o slug del progetto (vuoto = tutti)"},
                 "a": {"type": "string", "description": "Per scrivi: a chi (utente del server dei siti o «tutti»)"}, "testo": _S}, ["azione"]),
}


# ---- i file del server dei siti: il proprietario vede tutto il server, gli altri solo le loro cartelle (lo decide il server, sito-file)

async def siti_bytes(*args: str, data: bytes | None = None, timeout: float = 120) -> bytes:
    p = await asyncio.create_subprocess_exec(
        "ssh", "-i", str(SITI_KEY), "-o", "BatchMode=yes", "-o", "ConnectTimeout=6", "-o", "StrictHostKeyChecking=accept-new",
        "-o", f"UserKnownHostsFile={SITI_HOSTS}", "-o", "LogLevel=ERROR", SITI_SSH, shlex.join(args),
        stdin=asyncio.subprocess.PIPE if data is not None else asyncio.subprocess.DEVNULL, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    try:
        out, err = await asyncio.wait_for(p.communicate(data), timeout)
    except asyncio.TimeoutError:
        p.kill()
        raise HTTPException(504, "il server dei siti non risponde")
    if p.returncode:
        msg = err.decode(errors="replace").strip()[:300] or "errore sul server dei siti"
        raise HTTPException({3: 403, 4: 404}.get(p.returncode, 400), msg)
    return out


def _ct_path(path: str) -> str:
    path = str(path or "/").strip() or "/"
    if not path.startswith("/") or "\x00" in path or len(path) > 1000:
        raise HTTPException(400, "Percorso non valido")
    return path


@app.get("/api/ct/ls")
async def ct_ls(path: str = "/", user: dict = Depends(require_siti)):
    return json.loads(await siti_bytes("file", siti_user(user), "ls", _ct_path(path), timeout=30) or b"{}")


@app.get("/api/ct/file")
async def ct_read(path: str, dl: int = 0, cartella: int = 0, user: dict = Depends(require_siti)):
    path = _ct_path(path)
    data = await siti_bytes("file", siti_user(user), "scarica" if dl else "leggi", path, timeout=300)
    name = path.rstrip("/").rsplit("/", 1)[-1] or "server"
    if cartella:
        name += ".tar.gz"
    mime = "application/gzip" if cartella else (_guess_mime(name) if not dl else "application/octet-stream")
    # il browser non deve eseguire niente di quello che arriva dal server: i file si vedono come testo o immagini, mai come pagine
    if not dl and not mime.startswith("image/") and mime != "application/pdf":
        mime = "text/plain; charset=utf-8"
    from urllib.parse import quote
    disp = f"{'attachment' if dl else 'inline'}; filename*=UTF-8''{quote(name)}"
    return Response(data, media_type=mime, headers={"Content-Disposition": disp, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store"})


@app.put("/api/ct/file")
async def ct_write(path: str, request: Request, user: dict = Depends(require_siti)):
    body = await request.body()
    if len(body) > 50 * 1024 * 1024:
        raise HTTPException(413, "File troppo grande (massimo 50 MB)")
    return json.loads(await siti_bytes("file", siti_user(user), "scrivi", _ct_path(path), data=body, timeout=300) or b"{}")


@app.delete("/api/ct/file")
async def ct_delete(path: str, user: dict = Depends(require_siti)):
    await siti_bytes("file", siti_user(user), "cancella", _ct_path(path))
    return {"ok": True}


class CtPathIn(BaseModel):
    path: str
    to: str = ""


@app.post("/api/ct/cartella")
async def ct_mkdir(body: CtPathIn, user: dict = Depends(require_siti)):
    return json.loads(await siti_bytes("file", siti_user(user), "cartella", _ct_path(body.path)) or b"{}")


@app.post("/api/ct/sposta")
async def ct_move(body: CtPathIn, user: dict = Depends(require_siti)):
    return json.loads(await siti_bytes("file", siti_user(user), "sposta", _ct_path(body.path), _ct_path(body.to)) or b"{}")
