# Cerini IA, parte «cloud»: modello nel cloud e consumi.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# ================================================================== modello nel cloud (facoltativo)
# Un modello grande a pagamento, via API compatibile OpenAI (DeepSeek, Gemini, OpenAI, OpenRouter, Anthropic…): basta la chiave.
# Si sceglie nel menu dei modelli come «☁ nome»; se il PC e' spento fa anche i lavori di sottofondo (posta, diario).
# La chiave sta in data/cloud.json (solo il server la legge) e non torna mai al browser.

CLOUD_FILE = DATA_DIR / "cloud.json"
CLOUD_PRESETS = {
    # Regolo (Seeweb): azienda italiana, server in Europa, non conserva i messaggi (zero data retention)
    "regolo": {"name": "Regolo (Italia)", "base": "https://api.regolo.ai/v1", "model": "qwen3.5-122b",
               "note": "Azienda italiana (Seeweb), dati in Europa, non conserva i messaggi.",
               "models": [["qwen3.5-122b", "consigliato"], ["glm5.2", "il più forte"], ["mistral-small-4-119b", "costa la metà"],
                          ["gemma4-31b", "Gemma grande"], ["gpt-oss-120b", ""]],
               "prices": {"gpt-oss-120b": [1.0, 4.2], "glm5.2": [2.0, 5.2], "mistral-small-4-119b": [0.5, 2.1]}},   # euro per milione di token (entrata, uscita), dal listino pubblico
    "deepseek": {"name": "DeepSeek", "base": "https://api.deepseek.com/v1", "model": "deepseek-chat"},
    "gemini": {"name": "Google Gemini", "base": "https://generativelanguage.googleapis.com/v1beta/openai", "model": "gemini-2.5-flash"},
    "openai": {"name": "OpenAI", "base": "https://api.openai.com/v1", "model": "gpt-4o-mini"},
    "openrouter": {"name": "OpenRouter", "base": "https://openrouter.ai/api/v1", "model": "deepseek/deepseek-chat"},
    "anthropic": {"name": "Anthropic (Claude)", "base": "https://api.anthropic.com/v1", "model": "claude-haiku-5-5"},
    "custom": {"name": "Altro (compatibile OpenAI)", "base": "", "model": ""},
}
CLOUD_CTX = int(os.environ.get("CLOUD_CTX", "64000"))
CLOUD_MAX_TOKENS = int(os.environ.get("CLOUD_MAX_TOKENS", "8192"))   # lunghezza massima di una risposta


def cloud_cfg() -> dict:
    try:
        return json.loads(CLOUD_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def cloud_ready() -> bool:
    c = cloud_cfg()
    return bool(c.get("enabled") and c.get("api_key") and c.get("base") and c.get("model"))


def cloud_bg_ready() -> bool:
    return cloud_ready() and cloud_cfg().get("background", True)


def is_cloud(model: str | None) -> bool:
    return str(model or "").startswith("cloud:")


def cloud_name() -> str:
    return "cloud:" + cloud_cfg().get("model", "") if cloud_ready() else ""


def _oa_messages(msgs: list[dict]) -> list[dict]:
    """Messaggi in formato Ollama -> formato OpenAI (le chiamate agli strumenti hanno bisogno di un id)."""
    out, pending, n, first = [], [], 0, True

    def flush():
        while pending:   # chiamate senza risultato (es. in attesa di conferma): OpenAI vuole comunque una risposta
            out.append({"role": "tool", "tool_call_id": pending.pop(0), "content": "(nessun risultato)"})
    for m in msgs:
        role = m.get("role")
        if role == "tool":
            if pending:
                out.append({"role": "tool", "tool_call_id": pending.pop(0), "content": str(m.get("content") or "")})
            else:
                out.append({"role": "user", "content": f"[risultato di {m.get('tool_name') or 'uno strumento'}]\n{m.get('content') or ''}"})
            continue
        flush()
        if role == "assistant" and m.get("tool_calls"):
            calls = []
            for tc in m["tool_calls"]:
                n += 1
                f = tc.get("function") or {}
                a = f.get("arguments")
                calls.append({"id": f"call_{n}", "type": "function",
                              "function": {"name": f.get("name"), "arguments": a if isinstance(a, str) else json.dumps(a or {}, ensure_ascii=False)}})
                pending.append(f"call_{n}")
            out.append({"role": "assistant", "content": m.get("content") or None, "tool_calls": calls})
        elif role == "system":
            # il primo e' il prompt di sistema; quelli a meta' conversazione (avvisi del server) diventano note
            out.append({"role": "system", "content": m.get("content") or ""} if first else {"role": "user", "content": f"[nota del sistema] {m.get('content') or ''}"})
        elif role == "user" and m.get("images"):
            out.append({"role": "user", "content": [{"type": "text", "text": m.get("content") or ""}] +
                        [{"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + b}} for b in m["images"]]})
        else:
            out.append({"role": role if role in ("user", "assistant") else "user", "content": m.get("content") or ""})
        first = False
    flush()
    return out


def _cloud_body(payload: dict, stream: bool) -> dict:
    c = cloud_cfg()
    # max_tokens sempre: senza, alcuni fornitori (Regolo) riservano tutto il contesto alla risposta e rifiutano la richiesta
    body = {"model": c["model"], "messages": _oa_messages(payload.get("messages") or []), "stream": stream, "max_tokens": CLOUD_MAX_TOKENS}
    if payload.get("tools"):
        body["tools"] = payload["tools"]
    t = (payload.get("options") or {}).get("temperature")
    if t is not None:
        body["temperature"] = t
    if payload.get("format") == "json":
        body["response_format"] = {"type": "json_object"}
    if stream:
        body["stream_options"] = {"include_usage": True}   # l'ultimo pezzo porta i token usati (per i consumi)
    return body


def _cloud_headers() -> dict:
    return {"Authorization": f"Bearer {cloud_cfg()['api_key']}", "Content-Type": "application/json"}


_NO_STREAM_USAGE: set = set()   # fornitori che rifiutano stream_options


async def cloud_stream(payload: dict):
    """Come lo stream di Ollama (righe {"message": …}, poi done), ma da un'API compatibile OpenAI."""
    c = cloud_cfg()
    t0 = time.monotonic()
    calls: dict[int, dict] = {}
    tokens, usage = 0, {}
    body = _cloud_body(payload, True)
    if c.get("base") in _NO_STREAM_USAGE:
        body.pop("stream_options", None)
    async with client.stream("POST", c["base"].rstrip("/") + "/chat/completions", json=body, headers=_cloud_headers(),
                             timeout=httpx.Timeout(300.0, connect=10.0)) as r:
        if r.status_code != 200:
            err = (await r.aread()).decode(errors="replace")[:400]
            if "stream_options" in err and c.get("base") not in _NO_STREAM_USAGE:
                # il fornitore non conosce il conto dei token in streaming: si riprova senza (e i token si stimano)
                _NO_STREAM_USAGE.add(c.get("base"))
                async for d in cloud_stream(payload):
                    yield d
                return
            yield {"error": f"Modello nel cloud: errore {r.status_code} {err}"}
            return
        async for line in r.aiter_lines():
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                break
            try:
                d = json.loads(data)
            except ValueError:
                continue
            if d.get("usage"):
                tokens = d["usage"].get("completion_tokens") or tokens
                usage = d["usage"]
            for ch in d.get("choices") or []:
                delta = ch.get("delta") or {}
                if delta.get("reasoning_content"):
                    yield {"message": {"role": "assistant", "content": "", "thinking": delta["reasoning_content"]}, "done": False}
                if delta.get("content"):
                    tokens += 1
                    yield {"message": {"role": "assistant", "content": delta["content"]}, "done": False}
                for tc in delta.get("tool_calls") or []:
                    slot = calls.setdefault(tc.get("index", 0), {"name": "", "args": ""})
                    f = tc.get("function") or {}
                    slot["name"] += f.get("name") or ""
                    slot["args"] += f.get("arguments") or ""
    if calls:
        out = []
        for k in sorted(calls):
            try:
                args = json.loads(calls[k]["args"] or "{}")
            except ValueError:
                args = {}
            out.append({"function": {"name": calls[k]["name"], "arguments": args}})
        yield {"message": {"role": "assistant", "content": "", "tool_calls": out}, "done": False}
    secs = max(0.001, time.monotonic() - t0)
    # se il fornitore non manda il conto, si stima: ~4 caratteri per token
    tin = usage.get("prompt_tokens") or len(json.dumps(payload.get("messages") or [], ensure_ascii=False)) // 4
    usage_add("cloud:" + c.get("model", ""), "chat",   # il modello chiamato davvero, non il nome rimasto nella chat
              tin, usage.get("completion_tokens") or tokens)
    yield {"message": {"role": "assistant", "content": ""}, "done": True, "eval_count": tokens, "eval_duration": int(secs * 1e9)}


async def llm_stream(payload: dict):
    """Lo stream della chat: Ollama sul PC oppure il modello nel cloud, stesso formato per il resto del codice."""
    if is_cloud(payload.get("model")):
        if not cloud_ready():
            yield {"error": "Il modello nel cloud non è configurato: inserisci la chiave in Impostazioni → Collegamenti"}
            return
        async for d in cloud_stream(payload):
            yield d
        return
    async with client.stream("POST", ollama_base + "/api/chat", json=payload) as r:
        if r.status_code != 200:
            yield {"error": (await r.aread()).decode(errors="replace") or f"HTTP {r.status_code}"}
            return
        async for line in r.aiter_lines():
            if line:
                d = json.loads(line)
                if d.get("done"):
                    usage_add(payload.get("model"), "chat", d.get("prompt_eval_count") or 0, d.get("eval_count") or 0)
                yield d


async def llm_once(messages: list[dict], json_mode: bool = False, temperature: float = 0.2, model: str | None = None,
                   num_ctx: int = 8192, timeout: float = 180) -> str:
    """Una risposta sola (lavori di sottofondo): Gemma sul PC se e' acceso, altrimenti il modello nel cloud se c'e'."""
    use_cloud = is_cloud(model) or (not model and not await _pc_on() and cloud_bg_ready())
    payload = {"messages": messages, "stream": False, "options": {"temperature": temperature}}
    if json_mode:
        payload["format"] = "json"
    if use_cloud:
        if not cloud_ready():
            raise HTTPException(503, "Il modello nel cloud non è configurato")
        r = await client.post(cloud_cfg()["base"].rstrip("/") + "/chat/completions", json=_cloud_body(payload, False), headers=_cloud_headers(),
                              timeout=httpx.Timeout(timeout, connect=10.0))
        if r.status_code != 200:
            raise HTTPException(502, f"Modello nel cloud: errore {r.status_code} {r.text[:200]}")
        u = r.json().get("usage") or {}
        usage_add(cloud_name(), "sfondo", u.get("prompt_tokens") or 0, u.get("completion_tokens") or 0)
        return (r.json()["choices"][0]["message"].get("content") or "").strip()
    payload.update(model=model or await _chat_model(), think=False, keep_alive=KEEP_ALIVE)
    payload["options"]["num_ctx"] = num_ctx
    r = await ollama("POST", "/api/chat", json=payload, timeout=timeout)
    usage_ollama(payload["model"], r)
    return (r.json().get("message") or {}).get("content", "").strip()


# ---- consumi: i token di ogni modello (sul PC e nel cloud), quanto costano e quanto credito resta.
# Si salvano solo i numeri, niente testo dei messaggi. Il costo si calcola quando lo guardi, con i prezzi di adesso.

def init_usage_db():
    with db() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS usage (day TEXT NOT NULL, model TEXT NOT NULL, kind TEXT NOT NULL,
                     calls INTEGER NOT NULL DEFAULT 0, tin INTEGER NOT NULL DEFAULT 0, tout INTEGER NOT NULL DEFAULT 0,
                     PRIMARY KEY (day, model, kind))""")


def usage_add(model: str | None, kind: str, tin: int, tout: int):
    if not model:
        return
    try:
        with db() as c:
            c.execute("""INSERT INTO usage (day, model, kind, calls, tin, tout) VALUES (?, ?, ?, 1, ?, ?)
                         ON CONFLICT (day, model, kind) DO UPDATE SET calls = calls + 1, tin = tin + excluded.tin, tout = tout + excluded.tout""",
                      (local_now().strftime("%Y-%m-%d"), model, kind, int(tin or 0), int(tout or 0)))
    except sqlite3.Error:
        pass   # il contatore non deve mai rompere una risposta


def usage_ollama(model: str, r: httpx.Response):
    try:
        d = r.json()
        usage_add(model, "sfondo", d.get("prompt_eval_count") or 0, d.get("eval_count") or 0)
    except ValueError:
        pass


def _price(model: str) -> list | None:
    """Prezzo in euro per milione di token [entrata, uscita]: quello scritto nelle impostazioni o quello noto del fornitore."""
    c = cloud_cfg()
    name = model.removeprefix("cloud:")
    p = (c.get("prices") or {}).get(name)
    if p and any(p):
        return [float(p[0] or 0), float(p[1] or 0)]
    return (CLOUD_PRESETS.get(c.get("provider", ""), {}).get("prices") or {}).get(name)


async def _provider_balance() -> dict | None:
    """Il credito vero, per i fornitori che lo dicono via API (DeepSeek, OpenRouter). Per gli altri vale quello scritto a mano."""
    c = cloud_cfg()
    if not (c.get("api_key") and c.get("provider") in ("deepseek", "openrouter")):
        return None
    try:
        if c["provider"] == "deepseek":
            r = await client.get("https://api.deepseek.com/user/balance", headers=_cloud_headers(), timeout=8)
            b = (r.json().get("balance_infos") or [{}])[0]
            return {"amount": float(b.get("total_balance") or 0), "currency": b.get("currency", "USD")}
        r = await client.get("https://openrouter.ai/api/v1/credits", headers=_cloud_headers(), timeout=8)
        d = r.json().get("data") or {}
        return {"amount": float(d.get("total_credits") or 0) - float(d.get("total_usage") or 0), "currency": "USD"}
    except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
        return None


@app.get("/api/usage")
async def usage_get(user: dict = Depends(require_user)):
    today = local_now().strftime("%Y-%m-%d")
    month = today[:7]
    with db() as c:
        rows = c.execute("SELECT day, model, kind, calls, tin, tout FROM usage WHERE day >= ? ORDER BY day",
                         ((local_now() - timedelta(days=90)).strftime("%Y-%m-%d"),)).fetchall()
    cfg = cloud_cfg()
    since = cfg.get("credit_since") or ""
    models: dict[str, dict] = {}
    spent_since = 0.0
    for r in rows:
        m = models.setdefault(r["model"], {"name": r["model"], "cloud": is_cloud(r["model"]), "today": [0, 0, 0], "month": [0, 0, 0],
                                           "chat": 0, "sfondo": 0, "days": {}})
        if r["day"] == today:
            m["today"] = [m["today"][0] + r["calls"], m["today"][1] + r["tin"], m["today"][2] + r["tout"]]
        if r["day"][:7] == month:
            m["month"] = [m["month"][0] + r["calls"], m["month"][1] + r["tin"], m["month"][2] + r["tout"]]
            m[r["kind"]] = m.get(r["kind"], 0) + r["calls"]
        m["days"][r["day"]] = m["days"].get(r["day"], 0) + r["tin"] + r["tout"]
        p = _price(r["model"]) if m["cloud"] else None
        if p and r["day"] >= since:
            spent_since += (r["tin"] * p[0] + r["tout"] * p[1]) / 1e6
    for m in models.values():
        p = _price(m["name"]) if m["cloud"] else [0, 0]
        m["price"] = p
        m["today_cost"] = round((m["today"][1] * p[0] + m["today"][2] * p[1]) / 1e6, 4) if p else None
        m["month_cost"] = round((m["month"][1] * p[0] + m["month"][2] * p[1]) / 1e6, 4) if p else None
        m["days"] = [[d, m["days"][d]] for d in sorted(m["days"])[-30:]]
    credit = None
    real = await _provider_balance() if user["role"] == "admin" else None
    if real:
        credit = {"left": round(real["amount"], 2), "currency": real["currency"], "real": True}
    elif cfg.get("credit"):
        credit = {"total": float(cfg["credit"]), "since": since, "spent": round(spent_since, 4),
                  "left": round(float(cfg["credit"]) - spent_since, 2), "currency": "EUR", "real": False}
    cloud = cloud_name()
    return {"models": sorted(models.values(), key=lambda m: -(m["month"][1] + m["month"][2])), "credit": credit,
            "cloud": cloud, "cloud_price": _price(cloud) if cloud else None, "cfg_credit": cfg.get("credit"), "cfg_since": since,
            "provider": CLOUD_PRESETS.get(cfg.get("provider", ""), {}).get("name", "")}


class UsageCfgIn(BaseModel):
    prices: dict[str, list[float | None]] = {}
    credit: float | None = None
    credit_since: str = ""


@app.put("/api/usage/config")
async def usage_cfg(body: UsageCfgIn, _: dict = Depends(require_admin)):
    cfg = cloud_cfg()
    prices = cfg.get("prices") or {}
    for name, p in body.prices.items():
        if len(p) == 2 and all(x is None or 0 <= x < 1000 for x in p):
            prices[name.removeprefix("cloud:")[:100]] = [x or 0 for x in p]
    if body.credit_since and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", body.credit_since):
        raise HTTPException(400, "Data non valida")
    cfg["prices"] = prices
    cfg["credit"] = body.credit if body.credit and body.credit > 0 else None
    cfg["credit_since"] = body.credit_since or local_now().strftime("%Y-%m-%d")
    CLOUD_FILE.write_text(json.dumps(cfg), encoding="utf-8")
    os.chmod(CLOUD_FILE, 0o600)
    return {"ok": True}


class CloudIn(BaseModel):
    provider: str = "deepseek"
    base: str = ""
    model: str = ""
    api_key: str = ""           # vuota = tieni quella gia' salvata
    enabled: bool = True
    background: bool = True


def _cloud_public() -> dict:
    c = cloud_cfg()
    k = c.get("api_key") or ""
    return {"provider": c.get("provider", "deepseek"), "base": c.get("base", ""), "model": c.get("model", ""), "enabled": bool(c.get("enabled")),
            "background": c.get("background", True), "has_key": bool(k), "key_hint": ("…" + k[-4:]) if len(k) > 8 else "",
            "ready": cloud_ready(), "presets": CLOUD_PRESETS}


@app.get("/api/cloud")
async def cloud_get(_: dict = Depends(require_admin)):
    return _cloud_public()


@app.put("/api/cloud")
async def cloud_put(body: CloudIn, _: dict = Depends(require_admin)):
    old = cloud_cfg()
    preset = CLOUD_PRESETS.get(body.provider, CLOUD_PRESETS["custom"])
    base = (body.base or preset["base"]).strip().rstrip("/")
    if base and not base.startswith("https://"):
        raise HTTPException(400, "L'indirizzo dell'API deve iniziare con https://")
    cfg = {"provider": body.provider, "base": base, "model": (body.model or preset["model"]).strip(),
           "api_key": body.api_key.strip() or old.get("api_key", ""), "enabled": body.enabled, "background": body.background,
           **{k: old[k] for k in ("prices", "credit", "credit_since") if k in old}}
    CLOUD_FILE.write_text(json.dumps(cfg), encoding="utf-8")
    os.chmod(CLOUD_FILE, 0o600)
    return _cloud_public()


@app.post("/api/cloud/test")
async def cloud_test(_: dict = Depends(require_admin)):
    c = cloud_cfg()
    if not (c.get("api_key") and c.get("base")):
        raise HTTPException(400, "Prima inserisci la chiave e salva")
    models = []
    try:
        r = await client.get(c["base"].rstrip("/") + "/models", headers=_cloud_headers(), timeout=15)
        if r.status_code == 200:
            models = sorted({m.get("id", "") for m in (r.json().get("data") or []) if m.get("id")})
        elif r.status_code in (401, 403):
            raise HTTPException(400, "La chiave non è valida (il fornitore l'ha rifiutata)")
    except httpx.HTTPError as e:
        raise HTTPException(502, f"Non riesco a raggiungere il fornitore: {e}")
    reply = ""
    if c.get("model"):
        try:
            reply = await llm_once([{"role": "user", "content": "Rispondi solo: ok"}], model="cloud:" + c["model"], timeout=40)
        except HTTPException as e:
            raise HTTPException(400, f"La chiave funziona ma il modello «{c['model']}» no: {e.detail}")
    return {"ok": True, "models": models[:300], "reply": reply[:80]}
