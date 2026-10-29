# Cerini IA, parte «voce»: la voce di Aura e la dettatura con ElevenLabs, con i crediti sotto controllo.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# ================================================================== ElevenLabs
# La chiave sta nel .env (ELEVEN_KEY). Voce scelta, modello e stato dei crediti in data/voce.json.
# Se ElevenLabs non risponde o i crediti sono finiti, la voce torna quella di Microsoft (edge-tts) e la dettatura al
# Whisper del cloud o del PC: Aura avvisa una volta sola, nella pagina «Da Aura».

ELEVEN_KEY = os.environ.get("ELEVEN_KEY", "")
ELEVEN_API = "https://api.elevenlabs.io/v1"
ELEVEN_MODELS = {"eleven_multilingual_v2": "Qualità massima", "eleven_flash_v2_5": "Veloce, metà crediti"}
ELEVEN_FALLBACK_VOICE = os.environ.get("ELEVEN_VOICE", "JBFqnCBsd6RMkjVDRZzb")
ELEVEN_LOW = 0.10   # sotto il 10% dei crediti Aura avvisa


def eleven_on() -> bool:
    return bool(ELEVEN_KEY)


def _voce_file() -> dict:
    try:
        return json.loads((DATA_DIR / "voce.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _voce_save(d: dict):
    f = DATA_DIR / "voce.json"
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    tmp.replace(f)


def _eleven_h() -> dict:
    return {"xi-api-key": ELEVEN_KEY}


def eleven_usable() -> bool:
    """ElevenLabs si usa se c'è la chiave e i crediti non risultano finiti (dopo il rinnovo si riprova da solo)."""
    if not ELEVEN_KEY:
        return False
    d = _voce_file()
    return not (d.get("exhausted") and time.time() < (d.get("credits") or {}).get("reset", 0))


def _eleven_alert(kind: str, title: str, body: str):
    """Un avviso nella pagina «Da Aura» (e sul telefono), una volta sola per periodo di crediti."""
    d = _voce_file()
    key = f"{kind}:{(d.get('credits') or {}).get('reset', 0)}"
    if key in (d.get("alerted") or []):
        return
    d["alerted"] = ((d.get("alerted") or []) + [key])[-10:]
    _voce_save(d)
    with db() as c:
        admins = [r["id"] for r in c.execute("SELECT id FROM users WHERE role = 'admin'").fetchall()]
    for uid in admins:
        try:
            feed_add(uid, "voce", title, body)
        except Exception as e:
            print(f"voce: avviso non mandato: {e}", flush=True)


async def eleven_credits(force: bool = False) -> dict:
    """Crediti del piano (caratteri usati e totali, data del rinnovo); tenuti per 10 minuti."""
    d = _voce_file()
    cr = d.get("credits") or {}
    if not ELEVEN_KEY or (not force and time.time() - cr.get("at", 0) < 600):
        return cr
    try:
        r = await client.get(f"{ELEVEN_API}/user/subscription", headers=_eleven_h(), timeout=15)
        if r.status_code != 200:
            return {**cr, "err": _eleven_err(r)}
        s = r.json()
        cr = {"used": int(s.get("character_count") or 0), "limit": int(s.get("character_limit") or 0),
              "reset": int(s.get("next_character_count_reset_unix") or 0), "tier": s.get("tier", ""), "at": time.time()}
    except (httpx.HTTPError, ValueError) as e:
        return {**cr, "err": str(e)}
    d = _voce_file()
    if d.get("credits", {}).get("reset") and cr["reset"] > d["credits"]["reset"]:
        d["exhausted"] = False   # piano rinnovato
    d["credits"] = cr
    _voce_save(d)
    left = cr["limit"] - cr["used"]
    if cr["limit"] and left <= 0:
        _eleven_out()
    elif cr["limit"] and left < cr["limit"] * ELEVEN_LOW:
        _eleven_alert("low", "🔈 Crediti ElevenLabs quasi finiti",
                      f"Restano {left:,} caratteri su {cr['limit']:,} ({left * 100 // cr['limit']}%)".replace(",", ".")
                      + (f": si rinnovano il {datetime.fromtimestamp(cr['reset'], _rome()).strftime('%d/%m')}." if cr["reset"] else "."))
    return cr


def _eleven_out():
    d = _voce_file()
    d["exhausted"] = True
    d.setdefault("credits", {})
    if not d["credits"].get("reset"):
        d["credits"]["reset"] = time.time() + 86400   # data del rinnovo sconosciuta: si riprova domani
    _voce_save(d)
    when = datetime.fromtimestamp(d["credits"]["reset"], _rome()).strftime("%d/%m")
    _eleven_alert("out", "🔇 Crediti ElevenLabs finiti",
                  f"Fino al rinnovo ({when}) parlo con la voce di Microsoft e la dettatura torna a Whisper. "
                  "Se vuoi la voce bella prima, ricarica il piano su ElevenLabs.")


def _eleven_err(r: httpx.Response) -> str:
    try:
        det = r.json().get("detail")
        msg = det.get("message") if isinstance(det, dict) else str(det)
        status = det.get("status", "") if isinstance(det, dict) else ""
    except ValueError:
        msg, status = r.text[:200], ""
    if r.status_code in (401, 402, 429) and re.search(r"quota|credit|exceed", f"{status} {msg}", re.I):
        _eleven_out()
    return f"{r.status_code}: {msg}"


def eleven_cfg() -> dict:
    d = _voce_file()
    return {"voice_id": d.get("voice_id") or ELEVEN_FALLBACK_VOICE, "voice_name": d.get("voice_name") or "",
            "model": d.get("model") if d.get("model") in ELEVEN_MODELS else "eleven_multilingual_v2"}


async def eleven_tts_stream(job: dict, text: str) -> bool:
    """Sintesi con ElevenLabs, a pezzi nel job mentre arriva. False se non è partita (si passa a Microsoft)."""
    c = eleven_cfg()
    try:
        async with client.stream("POST", f"{ELEVEN_API}/text-to-speech/{c['voice_id']}/stream",
                                 params={"output_format": "mp3_44100_128"}, headers=_eleven_h(),
                                 json={"text": text, "model_id": c["model"], "language_code": "it"} if c["model"] == "eleven_flash_v2_5"
                                 else {"text": text, "model_id": c["model"]},
                                 timeout=httpx.Timeout(60.0, connect=5.0)) as r:
            if r.status_code != 200:
                await r.aread()
                print(f"voce: ElevenLabs non ha risposto ({_eleven_err(r)}), uso Microsoft", flush=True)
                return False
            async for chunk in r.aiter_bytes():
                if chunk:
                    job["chunks"].append(chunk)
                    job["ev"].set()
    except httpx.HTTPError as e:
        print(f"voce: ElevenLabs non raggiungibile ({e})", flush=True)
        return bool(job["chunks"])
    d = _voce_file()
    if time.time() - (d.get("credits") or {}).get("at", 0) > 600:
        asyncio.create_task(eleven_credits(True))
    return True


async def eleven_transcribe(data: bytes, ctype: str, lang: str) -> dict:
    ext = {"audio/mp4": "m4a", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/wav": "wav"}.get(ctype.split(";")[0], "webm")
    r = await client.post(f"{ELEVEN_API}/speech-to-text", headers=_eleven_h(),
                          files={"file": (f"voce.{ext}", data, ctype)},
                          data={"model_id": "scribe_v1", "language_code": {"it": "ita", "en": "eng"}.get(lang, lang), "tag_audio_events": "false"},
                          timeout=httpx.Timeout(120.0, connect=5.0))
    if r.status_code != 200:
        raise ValueError(_eleven_err(r))
    return {"text": str(r.json().get("text") or "").strip(), "engine": "elevenlabs"}


async def eleven_voices() -> list[dict]:
    r = await client.get(f"{ELEVEN_API}/voices", headers=_eleven_h(), timeout=20)
    if r.status_code != 200:
        raise ValueError(_eleven_err(r))
    out = []
    for v in r.json().get("voices") or []:
        lab = v.get("labels") or {}
        langs = {str(x.get("language") or "") for x in v.get("verified_languages") or []} | {str(lab.get("language") or "")}
        out.append({"id": v["voice_id"], "name": v.get("name", ""), "preview": v.get("preview_url") or "",
                    "it": "it" in langs or "italian" in str(lab).lower(), "mine": v.get("category") != "premade",
                    "desc": ", ".join(x for x in (lab.get("gender"), lab.get("age"), lab.get("accent"), lab.get("description") or lab.get("descriptive")) if x)})
    return sorted(out, key=lambda v: (not v["it"], not v["mine"], v["name"].lower()))


async def eleven_loop():
    await asyncio.sleep(40)
    while True:
        if ELEVEN_KEY:
            try:
                await eleven_credits(True)
            except Exception as e:
                print(f"voce: crediti non letti: {e}", flush=True)
        await asyncio.sleep(3600)


class ElevenIn(BaseModel):
    voice_id: str | None = None
    voice_name: str | None = None
    model: str | None = None


@app.get("/api/voice/eleven")
async def eleven_get(_: dict = Depends(require_admin)):
    if not ELEVEN_KEY:
        return {"on": False}
    out = {"on": True, **eleven_cfg(), "models": ELEVEN_MODELS, "credits": await eleven_credits(True), "usable": eleven_usable()}
    try:
        out["voices"] = await eleven_voices()
    except (httpx.HTTPError, ValueError) as e:
        out["voices_err"] = str(e)
    return out


@app.put("/api/voice/eleven")
async def eleven_put(body: ElevenIn, _: dict = Depends(require_admin)):
    d = _voce_file()
    if body.voice_id and re.fullmatch(r"[A-Za-z0-9]{8,40}", body.voice_id):
        d["voice_id"], d["voice_name"] = body.voice_id, _clip(body.voice_name or "", 60)
    if body.model in ELEVEN_MODELS:
        d["model"] = body.model
    _voce_save(d)
    return eleven_cfg()
