# Cerini IA, parte «modelli»: il PC con Ollama: ricerca, stato, modelli da accendere e spegnere.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# ------------------------------------------------------- ricerca del PC ---

ollama_base = OLLAMA_URL
_last_discovery = 0.0
_discovery_lock = asyncio.Lock()


def _arp_table() -> dict[str, str]:
    """IP -> MAC dalla cache ARP del kernel (leggibile anche in un CT non privilegiato)."""
    try:
        lines = Path("/proc/net/arp").read_text().splitlines()[1:]
    except OSError:
        return {}
    return {cols[0]: cols[3].lower() for cols in (l.split() for l in lines) if len(cols) > 3}


async def _port_open(ip: str, sem: asyncio.Semaphore) -> str | None:
    async with sem:
        try:
            _, w = await asyncio.wait_for(asyncio.open_connection(ip, OLLAMA_PORT), 0.7)
            w.close()
            return ip
        except Exception:
            return None


async def discover() -> bool:
    """Cerca nella subnet un host con la porta di Ollama aperta; preferisce quello col MAC del PC."""
    global ollama_base, _last_discovery
    async with _discovery_lock:
        if time.time() - _last_discovery < DISCOVER_EVERY:
            return False
        _last_discovery = time.time()
        sem = asyncio.Semaphore(64)
        hosts = [str(h) for h in ipaddress.ip_network(DISCOVER_SUBNET, strict=False).hosts()]
        found = [ip for ip in await asyncio.gather(*(_port_open(h, sem) for h in hosts)) if ip]
        mac = WOL_MAC.lower().replace("-", ":")
        arp = _arp_table()
        found.sort(key=lambda ip: arp.get(ip) != mac)
        for ip in found:
            url = f"http://{ip}:{OLLAMA_PORT}"
            try:
                (await client.get(url + "/api/version", timeout=2)).raise_for_status()
            except Exception:
                continue
            ollama_base = url
            print(f"Ollama trovato su {url}", flush=True)
            return True
        return False


async def ollama(method: str, path: str, **kw) -> httpx.Response:
    """Richiesta a Ollama; se il PC non risponde all'indirizzo noto, lo cerca e riprova una volta."""
    try:
        return await client.request(method, ollama_base + path, **kw)
    except (httpx.ConnectError, httpx.ConnectTimeout):
        if not await discover():
            raise
        return await client.request(method, ollama_base + path, **kw)

# ------------------------------------------------------------------ modelli ---

class Login(BaseModel):
    username: str
    password: str


class ModelReq(BaseModel):
    model: str


class ChatReq(BaseModel):
    model: str
    messages: list[dict]
    think: bool | None = None
    chat_id: str | None = None   # la chat aperta: la memoria delle conversazioni cerca nelle ALTRE
    voice: bool = False          # modalita' conversazione: la risposta viene letta ad alta voce


class ChatDoc(BaseModel):
    title: str
    model: str | None = None
    created: int
    messages: list[dict]


class PasswordChange(BaseModel):
    old: str
    new: str


class InviteReq(BaseModel):
    username: str
    email: str = ""
    role: str = "user"


class InviteAccept(BaseModel):
    password: str


class UserPatch(BaseModel):
    active: bool | None = None
    role: str | None = None


def _version(path: Path) -> str:
    """Impronta del file: cambia a ogni aggiornamento, cosi' browser e Cloudflare non usano copie vecchie."""
    return hashlib.sha256(path.read_bytes()).hexdigest()[:10]


@app.get("/")
async def index():
    html = (STATIC / "index.html").read_text(encoding="utf-8")
    html = html.replace('src="/static/app.js"', f'src="/static/app.js?v={_version(STATIC / "app.js")}"')
    return HTMLResponse(html, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})


@app.get("/api/app/version")
async def app_version():
    """La versione dell'interfaccia: se cambia, le pagine aperte si ricaricano da sole."""
    return JSONResponse({"v": _version(STATIC / "app.js")}, headers={"Cache-Control": "no-store"})


@app.get("/privacy")
async def privacy_page():
    page = (STATIC / "privacy.html").read_text(encoding="utf-8")
    pub = os.environ.get("PUBLIC_URL", "").rstrip("/")
    for k, v in {"{{OWNER_NAME}}": os.environ.get("OWNER_NAME", "il titolare"), "{{OWNER_EMAIL}}": os.environ.get("OWNER_EMAIL", ""),
                 "{{PUBLIC_URL}}": pub, "{{PUBLIC_HOST}}": pub.split("://")[-1]}.items():
        page = page.replace(k, html.escape(v))
    return HTMLResponse(page, headers={"Cache-Control": "public, max-age=3600"})


# Icone agli indirizzi standard: browser, dashboard (es. Homepage) e telefoni le cercano qui
ICON_FILES = {"favicon.ico": "image/x-icon", "favicon.svg": "image/svg+xml", "apple-touch-icon.png": "image/png",
              "icon-192.png": "image/png", "icon-512.png": "image/png"}


def _icon_route(name: str, mime: str):
    async def icon_file():
        return FileResponse(STATIC / "icons" / name, media_type=mime, headers={"Cache-Control": "public, max-age=86400"})
    app.get("/" + name, include_in_schema=False)(icon_file)


for _n, _m in ICON_FILES.items():
    _icon_route(_n, _m)


@app.get("/site.webmanifest", include_in_schema=False)
async def webmanifest():
    return JSONResponse({"name": "Cerini IA", "short_name": "Cerini IA", "start_url": "/", "display": "standalone",
                         "background_color": "#1a1b1e", "theme_color": "#1a1b1e",
                         "icons": [{"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
                                   {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"}]},
                        media_type="application/manifest+json", headers={"Cache-Control": "public, max-age=86400"})


@app.get("/invito/{token}")
async def invite_page(token: str):
    return await index()


@app.post("/api/login")
async def login(body: Login, request: Request, response: Response):
    ip = client_ip(request)
    uname = body.username.strip()
    if too_many_failures(ip) or user_locked(uname):
        raise HTTPException(429, "Troppi tentativi, riprova tra qualche minuto")
    with db() as c:
        row = c.execute("SELECT * FROM users WHERE username = ?", (uname,)).fetchone()
    # verify_password gira anche se l'utente non esiste, cosi' i tempi di risposta non lo rivelano
    ok = verify_password(body.password, row["pw_hash"] if row else ADMIN_PASSWORD_HASH or "x$x$x")
    if not (row and ok and row["active"]):
        _failures.setdefault(ip, []).append(time.time())
        _user_failures.setdefault(uname.lower(), []).append(time.time())
        print(f"Accesso fallito per '{uname[:40]}' da {ip}", flush=True)
        await asyncio.sleep(1)   # rallenta chi prova password in serie
        raise HTTPException(401, "Credenziali errate")
    _failures.pop(ip, None)
    _user_failures.pop(uname.lower(), None)
    with db() as c:
        c.execute("UPDATE users SET last_login = ? WHERE id = ?", (int(time.time()), row["id"]))
    set_session(request, response, dict(row))
    return {"ok": True}


@app.post("/api/logout")
async def logout(response: Response):
    response.delete_cookie(COOKIE)
    return {"ok": True}


@app.post("/api/me/logout-all")
async def logout_all(response: Response, user: dict = Depends(require_user)):
    """Chiude la sessione su tutti i dispositivi, compreso questo."""
    with db() as c:
        c.execute("UPDATE users SET session_ver = session_ver + 1 WHERE id = ?", (user["id"],))
    response.delete_cookie(COOKIE)
    return {"ok": True}


@app.get("/api/me")
async def me(user: dict = Depends(require_user)):
    admin = user["role"] == "admin"
    return {"user": user["username"], "email": user["email"], "role": user["role"], "site_name": SITE_NAME,
            "wol": admin and bool(WOL_MAC), "power": admin and bool(ESP32_URL), "mail": bool(SMTP_HOST), "voice": bool(WHISPER_TOKEN or cloud_stt_model() or eleven_on()), "voice_cloud": bool(cloud_stt_model()),
            "eleven": admin and eleven_on(),
            "gmail": admin and bool(_gmail_row(user["id"])), "calendar": admin,
            "homebase": admin and homebase_on(), "crm": admin and crm_on(),
            "autonomy": autonomy(user), "autonomy_groups": [g for g, d in AUTONOMY.items() if admin or not d["admin"]], "aura_chat": aura_chat_id(user["id"]),
            "mem_display": _prefs(user).get("mem_display", "list"), "start_model": _prefs(user).get("start_model", "local")}


def _prefs(user: dict) -> dict:
    try:
        return json.loads(user.get("prefs") or "{}")
    except ValueError:
        return {}


# Autonomia: per ogni gruppo di azioni, l'utente sceglie se l'assistente chiede conferma ("ask") o fa da solo ("auto")
AUTONOMY = {
    "memoria_salva": {"default": "auto", "admin": False, "tools": ["ricorda", "aggiorna_ricordo"]},
    "memoria_cancella": {"default": "ask", "admin": False, "tools": ["dimentica"]},
    "sito_menu": {"default": "ask", "admin": True, "tools": ["prodotto_aggiungi", "prodotto_modifica", "categoria_aggiungi", "menu_giorno_imposta", "piatti_del_giorno"]},
    "sito_eventi": {"default": "ask", "admin": True, "tools": ["evento_aggiungi", "evento_modifica", "evento_duplica"]},
    "sito_elimina": {"default": "ask", "admin": True, "tools": ["prodotto_elimina", "evento_elimina", "menu_giorno_elimina"]},
    "utenti": {"default": "ask", "admin": True, "tools": ["crea_invito"]},
    "mail_pulizia": {"default": "ask", "admin": True, "tools": ["mail_cestina", "mail_spam", "mail_archivia"]},
    "calendario": {"default": "auto", "admin": True, "tools": ["promemoria", "calendario_crea", "calendario_modifica"]},
    "calendario_elimina": {"default": "ask", "admin": True, "tools": ["calendario_elimina"]},
}
TOOL_GROUP = {t: g for g, d in AUTONOMY.items() for t in d["tools"]}


def autonomy(user: dict) -> dict:
    try:
        saved = json.loads(user.get("prefs") or "{}").get("autonomy", {})
    except ValueError:
        saved = {}
    return {g: saved.get(g) if saved.get(g) in ("ask", "auto") else d["default"] for g, d in AUTONOMY.items()}


class AutonomyIn(BaseModel):
    autonomy: dict[str, str] = {}
    mem_display: str | None = None   # "list" = elenco sotto la risposta, "icon" = solo un simbolo
    start_model: str | None = None   # "local" = Gemma sul PC di casa, "cloud" = il modello nel cloud


@app.put("/api/me/autonomy")
async def set_autonomy(body: AutonomyIn, user: dict = Depends(require_user)):
    cur = autonomy(user)
    for g, v in body.autonomy.items():
        if g in AUTONOMY and v in ("ask", "auto") and (user["role"] == "admin" or not AUTONOMY[g]["admin"]):
            cur[g] = v
    prefs = _prefs(user)
    prefs["autonomy"] = cur
    if body.mem_display in ("list", "icon"):
        prefs["mem_display"] = body.mem_display
    if body.start_model in ("local", "cloud"):
        prefs["start_model"] = body.start_model
    with db() as c:
        c.execute("UPDATE users SET prefs = ? WHERE id = ?", (json.dumps(prefs), user["id"]))
    return {"autonomy": cur, "mem_display": prefs.get("mem_display", "list"), "start_model": prefs.get("start_model", "local")}


PERSONA_OPTS = {
    "tono": {"amichevole": "Tono amichevole e alla mano, come un amico competente.",
             "diretto": "Diretto e asciutto: vai subito al punto, niente convenevoli.",
             "scherzoso": "Scherzoso e ironico quando ci sta, ma sempre utile.",
             "professionale": "Professionale e cortese."},
    "lunghezza": {"brevissime": "Risposte brevissime: una o due frasi, a meno che chieda di più.",
                  "brevi": "Risposte brevi: il necessario, niente giri di parole.",
                  "normali": "Risposte di lunghezza normale.",
                  "dettagliate": "Risposte dettagliate, con spiegazioni ed esempi."},
    "spiegazioni": {"tecniche": "È un tecnico: usa pure termini tecnici, comandi e dettagli.",
                    "semplici": "Spiega in modo semplice, senza gergo tecnico."},
    "iniziativa": {"chiede": "Prima di fare qualcosa chiedi sempre, anche per le cose piccole.",
                   "equilibrata": "Le cose sicure e annullabili falle da solo; per il resto chiedi.",
                   "proattivo": "Sii proattivo: proponi idee, prossimi passi e cose che puoi fare tu."},
    "registro": {"tu": "Dagli del tu.", "lei": "Dagli del lei."},
    "emoji": {"mai": "Niente emoji.", "poche": "Emoji solo ogni tanto.", "spesso": "Usa volentieri le emoji."},
}
PERSONA_DEFAULT = {"tono": "amichevole", "lunghezza": "brevi", "spiegazioni": "tecniche", "iniziativa": "equilibrata",
                   "registro": "tu", "emoji": "poche", "nome": "", "extra": ""}


def persona(user: dict) -> dict:
    return {**PERSONA_DEFAULT, **(_prefs(user).get("persona") or {})}


def persona_lines(user: dict) -> list[str]:
    pr = persona(user)
    nick = pr["nome"].strip() or _nick(user)
    lines = [f"Chiamalo «{nick}»."] + [PERSONA_OPTS[k][pr[k]] for k in PERSONA_OPTS if pr.get(k) in PERSONA_OPTS[k]]
    if pr["extra"].strip():
        lines.append(pr["extra"].strip())
    return lines


def persona_prompt(user: dict) -> str:
    return ("\n\nCOME VUOLE CHE TI COMPORTI (l'ha deciso lui nelle impostazioni: vale più di ogni altra indicazione di stile):\n"
            + "\n".join(f"- {l}" for l in persona_lines(user)))


class PersonaIn(BaseModel):
    tono: str = "amichevole"
    lunghezza: str = "brevi"
    spiegazioni: str = "tecniche"
    iniziativa: str = "equilibrata"
    registro: str = "tu"
    emoji: str = "poche"
    nome: str = ""
    extra: str = ""


@app.get("/api/me/persona")
async def get_persona(user: dict = Depends(require_user)):
    return {"persona": {**persona(user), "nome": persona(user)["nome"] or _nick(user)},
            "opts": {k: list(v) for k, v in PERSONA_OPTS.items()}}


@app.put("/api/me/persona")
async def put_persona(body: PersonaIn, user: dict = Depends(require_user)):
    pr = {k: v for k, v in body.model_dump().items()}
    for k, opts in PERSONA_OPTS.items():
        if pr[k] not in opts:
            raise HTTPException(400, f"Valore non valido per {k}")
    pr["nome"] = clean_name(pr["nome"])[:40]
    pr["extra"] = pr["extra"].strip()[:800]
    prefs = _prefs(user)
    prefs["persona"] = pr
    with db() as c:
        c.execute("UPDATE users SET prefs = ? WHERE id = ?", (json.dumps(prefs), user["id"]))
    user = {**user, "prefs": json.dumps(prefs)}
    # anche nel cervello: boot/soul.md dice come si comporta Aura con lui (la sezione «Come parlo» la scrive l'utente)
    try:
        brain_ensure(user)
        meta, body_md = fm_split(brain_read(user, "boot/soul.md"))
        body_md = re.sub(r"assistente personale di \S+\.", f"assistente personale di {_user_display(user)}.", body_md, count=1)
        block = ["- " + l for l in persona_lines(user)] + [
            "- Niente \"hai ragione\" di riflesso: se non sono d'accordo lo dico. Mi scuso solo se l'errore è mio.",
            "- Ogni cosa che affermo ha una fonte (il cervello, una mail, una pagina) oppure dico che è un mio ragionamento; se non lo so, lo dico."]
        body_md = _section_edit(body_md if re.search(r"^## Come parlo[ \t]*$", body_md, re.M) else body_md.rstrip("\n") + "\n\n## Come parlo\n",
                                "Come parlo", block, replace=True)
        await brain_write(user, "boot/soul.md", fm_join(meta, body_md) if meta else body_md, "Come si comporta Aura: deciso dall'utente", reindex=False)
    except Exception as e:
        print(f"soul.md: {e}", flush=True)
    return {"persona": pr, "lines": persona_lines(user)}


@app.post("/api/me/password")
async def change_password(body: PasswordChange, request: Request, response: Response,
                          user: dict = Depends(require_user)):
    if not verify_password(body.old, user["pw_hash"]):
        raise HTTPException(400, "La password attuale non è corretta")
    check_new_password(body.new, user["username"])
    with db() as c:
        c.execute("UPDATE users SET pw_hash = ?, session_ver = session_ver + 1 WHERE id = ?",
                  (hash_password(body.new), user["id"]))
    # Le altre sessioni (altri dispositivi) decadono; questa resta valida col nuovo token
    user["session_ver"] += 1
    set_session(request, response, user)
    return {"ok": True}


@app.get("/api/status")
async def status(_: dict = Depends(require_user)):
    try:
        version = (await ollama("GET", "/api/version", timeout=2.5)).json()["version"]
        ps, tags = await ollama("GET", "/api/ps"), await ollama("GET", "/api/tags")
    except Exception:
        return {"online": False, "loaded": [], "models": [], "cloud": cloud_name()}
    loaded = [
        {
            "name": m["name"],
            "size": m.get("size", 0),
            "size_vram": m.get("size_vram", 0),
            "expires_at": m.get("expires_at"),
            "context_length": m.get("context_length"),
        }
        for m in ps.json().get("models", [])
    ]
    models = [
        {
            "name": m["name"],
            "size": m.get("size", 0),
            "params": m.get("details", {}).get("parameter_size"),
            "quant": m.get("details", {}).get("quantization_level"),
        }
        for m in tags.json().get("models", [])
    ]
    host = httpx.URL(ollama_base).host
    # I modelli di embedding (la memoria) non sanno chattare: fuori dalla scelta, mostrati a parte come servizio
    caps = {m["name"]: await model_caps(m["name"]) for m in models}
    helper = {n for n, c in caps.items() if "embedding" in c and "completion" not in c}
    helpers = [{"name": n, "loaded": any(l["name"] == n for l in loaded),
                "size_vram": next((l["size_vram"] for l in loaded if l["name"] == n), 0)} for n in sorted(helper)]
    return {"online": True, "version": version, "host": host, "helpers": helpers, "cloud": cloud_name(), "default_model": DEFAULT_MODEL,
            "loaded": [l for l in loaded if l["name"] not in helper], "models": [m for m in models if m["name"] not in helper]}


@app.get("/api/model-info")
async def model_info(name: str, _: dict = Depends(require_user)):
    """Capacita' del modello (vision, thinking, ...) per mostrare solo i comandi che supporta."""
    try:
        r = await ollama("POST", "/api/show", json={"model": name})
    except httpx.HTTPError as e:
        raise HTTPException(502, f"PC non raggiungibile: {e}")
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)
    d = r.json()
    ctx = next((v for k, v in d.get("model_info", {}).items() if k.endswith(".context_length")), None)
    return {"capabilities": d.get("capabilities", []), "context_length": ctx}


async def _generate(model: str, keep_alive):
    try:
        r = await ollama("POST", "/api/generate", json={"model": model, "keep_alive": keep_alive})
    except httpx.HTTPError as e:
        raise HTTPException(502, f"PC non raggiungibile: {e}")
    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)
    return {"ok": True}


@app.post("/api/load")
async def load(body: ModelReq, _: dict = Depends(require_admin)):
    # Con OLLAMA_MAX_LOADED_MODELS=1 il modello precedente viene scaricato da Ollama
    return await _generate(body.model, KEEP_ALIVE)


@app.post("/api/unload")
async def unload(body: ModelReq, _: dict = Depends(require_admin)):
    return await _generate(body.model, 0)
