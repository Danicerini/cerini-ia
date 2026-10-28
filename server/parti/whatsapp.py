# Cerini IA, parte «whatsapp»: Aura scrive su WhatsApp col numero dell'utente.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# ================================================================== WhatsApp
# Il collegamento vero lo fa un piccolo servizio a parte (server/whatsapp, Node + Baileys) che si collega al WhatsApp
# dell'utente come «dispositivo collegato» (QR nelle impostazioni). Aura gli chiede la rubrica e gli fa inviare messaggi
# e file. Ogni invio passa sempre dalla conferma dell'utente; i messaggi ricevuti non si leggono.

WA_URL = os.environ.get("WA_URL", "http://127.0.0.1:8091").rstrip("/")
WA_TOKEN = os.environ.get("WA_TOKEN", "")
_WA = {"linked": False, "at": 0.0}


async def wa(method: str, path: str, **kw) -> dict:
    if not WA_TOKEN:
        raise HTTPException(409, "WhatsApp non è installato su questo server")
    try:
        r = await client.request(method, WA_URL + path, headers={"X-Token": WA_TOKEN}, timeout=kw.pop("timeout", 20), **kw)
    except httpx.HTTPError:
        raise HTTPException(502, "Il servizio WhatsApp non risponde")
    d = r.json() if r.content else {}
    if r.status_code >= 400:
        raise ValueError(d.get("error") or f"errore {r.status_code}")
    if path == "/status":
        _WA.update(linked=d.get("status") == "connected", at=time.time())
    return d


def wa_linked() -> bool:
    """Per l'elenco degli strumenti: lo stato visto da poco (si aggiorna da solo ogni mezzo minuto)."""
    return bool(WA_TOKEN) and _WA["linked"]


async def wa_status_loop():
    await asyncio.sleep(5)
    while True:
        if WA_TOKEN:
            try:
                await wa("GET", "/status")
            except Exception:
                _WA["linked"] = False
        await asyncio.sleep(30)


@app.get("/api/whatsapp")
async def wa_get(_: dict = Depends(require_admin)):
    if not WA_TOKEN:
        return {"installed": False}
    try:
        return {"installed": True, **await wa("GET", "/status")}
    except HTTPException as e:
        return {"installed": True, "status": "down", "error": e.detail}


@app.post("/api/whatsapp/link")
async def wa_link(_: dict = Depends(require_admin)):
    return await wa("POST", "/link", timeout=40)


@app.post("/api/whatsapp/logout")
async def wa_logout(_: dict = Depends(require_admin)):
    d = await wa("POST", "/logout", timeout=30)
    _WA["linked"] = False
    return d


async def _wa_target(who) -> dict:
    """Il destinatario dalla rubrica di WhatsApp (nome come salvato sul telefono) oppure un numero scritto per intero."""
    s = str(who or "").strip()
    if not s:
        raise ValueError("a chi lo mando? (nome come in rubrica o numero)")
    found = (await wa("GET", "/contacts", params={"q": s})).get("contacts") or []
    digits = re.sub(r"\D", "", s)
    if not found and len(digits) >= 8:
        return {"name": "", "number": s, "jid": s}   # un numero scritto per intero: il prefisso lo sistema il servizio
    if not found:
        raise ValueError(f"nella rubrica di WhatsApp non trovo «{s}»: chiedi all'utente come l'ha salvato o il numero")
    best = [c for c in found if c["score"] == found[0]["score"]]
    if len(best) > 1:
        raise ValueError(f"in rubrica ci sono più contatti per «{s}»: " + "; ".join(f"{c['name']} ({c['number'] or 'senza numero'})" for c in best[:6])
                         + ". Chiedi all'utente quale")
    return found[0]


async def _summary_wa(args: dict):
    t = await _wa_target(args.get("a"))
    args["_to"] = t
    files = _mail_attachments(args["_uid"], {**args, "allegati": args.get("file") or []}) if args.get("file") or args.get("_files") else []
    args["_send_files"] = files
    text = str(args.get("testo") or "").strip()
    if not text and not files:
        raise ValueError("serve il testo del messaggio o un file da mandare")
    who = f"{t['name']} ({t['number']})" if t.get("name") else t["number"]
    head = f"**WhatsApp a {who}**"
    body = f"\n{text}" if text else ""
    att = ("\n**File:** " + ", ".join(f["name"] for f in files)) if files else ""
    return f"{head}{body}{att}\n_Parte dal tuo numero quando premi Conferma._"


async def _tool_wa_send(user: dict, args: dict, request: Request) -> dict:
    t = args.get("_to") or await _wa_target(args.get("a"))
    files = args.get("_send_files")
    if files is None:
        files = _mail_attachments(user["id"], {**args, "allegati": args.get("file") or []}) if args.get("file") or args.get("_files") else []
    payload = {"to": t["jid"], "text": str(args.get("testo") or "").strip(),
               "files": [{**file_row(user["id"], f["id"]), "path": str(FILES_DIR / str(user["id"]) / str(f["id"]))} for f in files]}
    payload["files"] = [{"path": f["path"], "name": f["name"], "mime": f["mime"]} for f in payload["files"]]
    d = await wa("POST", "/send", json=payload, timeout=180)
    who = t.get("name") or t.get("number")
    if not d.get("ok"):
        return {"content": f"NON inviato su WhatsApp a {who}: il servizio non ha confermato l'invio.", "display": f"WhatsApp a {who}: non inviato"}
    what = " e ".join(x for x in (["il messaggio"] if payload["text"] else []) + ([f"{len(files)} file"] if files else []))
    brain_log_soon(user["id"], f"💬 WhatsApp a {who}: {_clip(payload['text'] or ', '.join(f['name'] for f in files), 120)}")
    return {"content": f"Inviato su WhatsApp a {who}: {what}.", "display": f"Inviato su WhatsApp a {who}"}


async def _tool_wa_contacts(user: dict, args: dict, request: Request) -> dict:
    found = (await wa("GET", "/contacts", params={"q": str(args.get("nome") or "")})).get("contacts") or []
    if not found:
        return {"content": "Nessun contatto con quel nome nella rubrica di WhatsApp.", "display": "Rubrica WhatsApp: nessuno"}
    return {"content": "Contatti WhatsApp trovati (nome come salvato sul telefono, numero):\n" + "\n".join(f"- {c['name'] or '?'}: {c['number'] or 'numero nascosto'}" for c in found),
            "display": f"Ha guardato la rubrica di WhatsApp: {len(found)}"}


TOOLS.update({
    "whatsapp_invia": {"admin": True, "whatsapp": True, "confirm": True, "always_confirm": True, "run": _tool_wa_send, "summary": _summary_wa,
        "spec": _fn("whatsapp_invia", "Manda un messaggio WhatsApp dal numero dell'utente a una persona della sua rubrica (nome come l'ha "
                    "salvato sul telefono) o a un numero. Può mandare anche i file e le foto allegati in chat («mandalo a…»). "
                    "Prima dell'invio l'utente vede il messaggio e preme Conferma: chiamalo direttamente.",
                    {"a": {"type": "string", "description": "Nome come in rubrica (es. Marco, Mamma) oppure numero"},
                     "testo": {"type": "string", "description": "Il messaggio, scritto come lo scriverebbe l'utente"},
                     "file": {"type": "array", "items": {"type": "integer"}, "description": "Numeri dei file allegati in chat da mandare (vuoto = quelli appena allegati)"}},
                    ["a"])},
    "whatsapp_rubrica": {"admin": True, "whatsapp": True, "confirm": False, "run": _tool_wa_contacts,
        "spec": _fn("whatsapp_rubrica", "Cerca nella rubrica di WhatsApp dell'utente (nome e numero).", {"nome": _S}, ["nome"])},
})
