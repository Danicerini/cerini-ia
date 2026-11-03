# Cerini IA, parte «riservato»: la modalità riservata della chat. Con lo scudo acceso i dati personali partono verso il cloud come etichette
# ([PERSONA_1], [TEL_1]…) e tornano veri nella risposta e negli strumenti: il modello non li vede, l'utente non vede le etichette.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima. Deve restare dopo «cloud» e «account».
# ruff: noqa: F821

# Due livelli, tutti e due velocissimi: regole per i dati che hanno una forma (mail, telefono…) e dizionario per i nomi che Aura conosce già
# (schede del cervello, clienti e contatti del CRM). Un nome che non è da nessuna parte passa: non è una garanzia e l'interfaccia dice cosa ha coperto.

ACT_MASK = contextvars.ContextVar("act_mask", default=None)
_MASK_LABEL = re.compile(r"\[?\b(PERSONA|AZIENDA|TEL|EMAIL|IBAN|CF|PIVA|IP)_(\d+)\b\]?")
_MASK_HOLD = re.compile(r"\[?[A-Z]+_?\d*$")   # la fine del testo potrebbe essere un'etichetta a metà
_MASK_RULES = [
    ("EMAIL", re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")),
    ("IBAN", re.compile(r"\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b")),
    ("CF", re.compile(r"\b[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]\b", re.I)),
    ("PIVA", re.compile(r"\b(?:IT[ ]?)?\d{11}\b")),
    ("IP", re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
    ("TEL", re.compile(r"(?<![\w.+-])(?:(?:\+|00)\d{2}[ .-]?)?(?:3\d{2}|0\d{1,3})[ .-]?\d{2,4}[ .-]?\d{2,4}(?:[ .-]?\d{1,4})?(?![\w-])")),
]
_MASK_LEGAL = set("srl s r l spa p a snc sas sa coop societa società cooperativa unipersonale socio unico ditta".split())
_MASK_SKIP = {"aura", "root", "admin"}   # l'assistente e i nomi dell'account non sono persone
# parole di tutti i giorni che sono anche cognomi o ditte: da sole contano solo con la maiuscola
_MASK_COMMON = set("""conti sole mare casa lago hotel studio centro via nuovo nuova grande piccolo bianco nero rosso verde rosa fiore fiori monte valle ponte porta
    piazza corso costa riva bosco pace fortuna amore bello bella buono santo santa tecnico tecnica servizi service sistemi rete dati ufficio lavoro ferro pane vino
    gallo leone lupo volpe martini moro neri bianchi serra sala villa mancini parisi marino""".split())


def init_mask_db():
    with db() as c:
        c.execute("CREATE TABLE IF NOT EXISTS chat_masks (chat_id TEXT, user_id INTEGER, data TEXT, PRIMARY KEY (chat_id, user_id))")


def _mask_card_name(f: Path) -> str:
    """Il nome di una scheda del cervello: il titolo se c'è, altrimenti dal nome del file."""
    try:
        meta, body = fm_split(f.read_text(encoding="utf-8"))
    except OSError:
        return ""
    m = re.search(r"^# (.+)$", body, re.M)
    return str(meta.get("title") or meta.get("name") or (m.group(1) if m else "") or f.stem.replace("-", " ").title()).strip()


_MASK_NAMES = {}


def _mask_names(user: dict) -> dict:
    """Il dizionario: forma scritta (in minuscolo, parole separate da uno spazio) -> (tipo, nome intero). Rifatto ogni 5 minuti o se il CRM ha imparato nomi nuovi."""
    uid = user["id"]
    crm = crm_on()
    size = (len(_CRM_NAMES) + len(_CRM_CONTACTS)) if crm else 0
    saved = _MASK_NAMES.get(uid)
    if saved and saved[1] == size and time.time() - saved[0] < 300:
        return saved[2]
    root = brain_dir(user) / "wiki"
    cards = lambda folder: {n for n in (_mask_card_name(f) for f in (root / folder).glob("*.md") if f.name != "index.md") if n}   # index.md è l'elenco, non una scheda
    people, firms = cards("people"), cards("companies")
    people |= {n.title() for n in _user_names(user)}
    if crm:
        firms |= {str(n) for n in _crm_accounts().values() if n}
        people |= {c["name"] for c in _CRM_CONTACTS.values() if c.get("name")}
        people |= {str(n) for n in _CRM_NAMES.values() if n and n not in firms}
    words = lambda s: re.findall(r"\w+", s.casefold())
    out = {}
    for name in firms:
        w = words(name)
        short = list(w)
        while short and short[-1] in _MASK_LEGAL:
            short.pop()
        if w:
            out.setdefault(" ".join(w), ("AZIENDA", name))
        if short:
            out.setdefault(" ".join(short), ("AZIENDA", name))
    # una parola di un solo nome vale tutto il nome («gianluca» è Bonzani Gianluca); se è di più persone resta com'è: quale delle due lo sa il cervello
    owners = {}
    for name in people:
        for t in set(words(name)):
            if len(t) >= 3:
                owners.setdefault(t, set()).add(name)
    for name in people:
        w = words(name)
        if len(w) > 1:
            out.setdefault(" ".join(w), ("PERSONA", name))
            out.setdefault(" ".join(reversed(w)), ("PERSONA", name))
    for t, names in owners.items():
        if t not in _MASK_SKIP and t not in _MASK_LEGAL:
            out.setdefault(t, ("PERSONA", next(iter(names)) if len(names) == 1 else t.title()))
    for t in _MASK_SKIP:
        out.pop(t, None)
    _MASK_NAMES[uid] = (time.time(), size, out)
    return out


def _mask_walk(v, f):
    if isinstance(v, str):
        return f(v)
    if isinstance(v, list):
        return [_mask_walk(x, f) for x in v]
    if isinstance(v, dict):
        return {k: _mask_walk(x, f) for k, x in v.items()}
    return v


class Mask:
    """Le etichette di una chat: restano le stesse a ogni giro, così il modello capisce che si parla sempre della stessa persona."""

    def __init__(self, user: dict, chat_id: str | None):
        self.uid, self.chat_id = user["id"], chat_id or ""
        self.names = _mask_names(user)
        self.longest = max((k.count(" ") + 1 for k in self.names), default=1)
        self.real, self.keys, self.counts, self.used, self.memo, self.tail, self.dirty = {}, {}, {}, set(), {}, "", False
        if self.chat_id:
            with db() as c:
                row = c.execute("SELECT data FROM chat_masks WHERE chat_id = ? AND user_id = ?", (self.chat_id, self.uid)).fetchone()
            d = json.loads(row["data"]) if row else {}
            self.real, self.keys, self.counts = d.get("real", {}), d.get("keys", {}), d.get("counts", {})

    def save(self):
        if self.dirty and self.chat_id:
            with db() as c:
                c.execute("INSERT OR REPLACE INTO chat_masks (chat_id, user_id, data) VALUES (?,?,?)",
                          (self.chat_id, self.uid, json.dumps({"real": self.real, "keys": self.keys, "counts": self.counts}, ensure_ascii=False)))
        self.dirty = False

    def label(self, kind: str, real: str) -> str:
        key = re.sub(r"\D", "", real) if kind in ("TEL", "PIVA") else re.sub(r"\s+", "", real).casefold() if kind == "IBAN" else real.casefold()
        key = f"{kind}:{key}"
        if key not in self.keys:
            self.counts[kind] = self.counts.get(kind, 0) + 1
            self.keys[key] = f"[{kind}_{self.counts[kind]}]"
            self.real[self.keys[key]] = real
            self.dirty = True
        self.used.add(self.keys[key])
        return self.keys[key]

    def text(self, s: str) -> str:
        if not s:
            return s
        if s in self.memo:
            self.used |= self.memo[s][1]
            return self.memo[s][0]
        before = set(self.used)
        self.used = set()
        t = s
        for kind, rx in _MASK_RULES:
            t = rx.sub(lambda m, k=kind: self._rule(k, m.group(0)), t)
        t = self._names(t)
        self.memo[s] = (t, set(self.used))
        self.used |= before
        return t

    def _rule(self, kind: str, found: str) -> str:
        if kind == "TEL" and not 8 <= len(re.sub(r"\D", "", found)) <= 13:
            return found
        return self.label(kind, found)

    def _names(self, t: str) -> str:
        toks = list(re.finditer(r"\w+", t))
        low = [m.group(0).casefold() for m in toks]
        out, at, i = [], 0, 0
        while i < len(toks):
            hit = None
            for n in range(min(self.longest, len(toks) - i), 0, -1):
                # le parole di un nome stanno vicine: spazio, virgola, punto; mai a capo
                if n > 1 and any(not re.fullmatch(r"[ ,.'&-]{1,3}", t[toks[k].end():toks[k + 1].start()]) for k in range(i, i + n - 1)):
                    continue
                key = " ".join(low[i:i + n])
                if key in self.names:
                    if n == 1 and key in _MASK_COMMON and not toks[i].group(0)[0].isupper():
                        continue
                    hit = n
                    break
            if hit:
                kind, real = self.names[" ".join(low[i:i + hit])]
                if kind == "AZIENDA":   # «Acme srl», «Acme S.r.l.»: la forma societaria è già nel nome
                    while i + hit < len(toks) and low[i + hit] in _MASK_LEGAL and re.fullmatch(r"[ .,]{0,2}", t[toks[i + hit - 1].end():toks[i + hit].start()]):
                        hit += 1
                out += [t[at:toks[i].start()], self.label(kind, real)]
                at = toks[i + hit - 1].end()
                i += hit
            else:
                i += 1
        return "".join(out) + t[at:]

    def out(self, messages: list[dict]) -> list[dict]:
        """I messaggi come partono verso il cloud. Le foto non si possono coprire: restano qui."""
        res = []
        for m in messages:
            m = dict(m)
            if isinstance(m.get("content"), str):
                m["content"] = self.text(m["content"])
            if isinstance(m.get("thinking"), str):
                m["thinking"] = self.text(m["thinking"])
            if m.get("tool_calls"):
                m["tool_calls"] = _mask_walk(m["tool_calls"], self.text)
            if m.pop("images", None):
                m["content"] = (m.get("content") or "") + "\n[Le foto allegate qui non sono state mandate: modalità riservata.]"
            res.append(m)
        self.save()
        return res

    def back(self, s: str, quote: bool = False) -> str:
        def put(m):
            real = self.real.get(f"[{m.group(1)}_{m.group(2)}]")
            return m.group(0) if real is None else json.dumps(real, ensure_ascii=False)[1:-1] if quote else real
        return _MASK_LABEL.sub(put, s or "")

    def feed(self, chunk: str) -> str:
        """Il testo che arriva a pezzi: un'etichetta tagliata a metà aspetta il pezzo dopo."""
        s = self.tail + chunk
        m = _MASK_HOLD.search(s[-30:])
        cut = len(s) - len(m.group(0)) if m else len(s)
        self.tail = s[cut:]
        return self.back(s[:cut])

    def flush(self) -> str:
        s, self.tail = self.tail, ""
        return self.back(s)

    def shown(self) -> list[dict]:
        return [{"label": k, "real": self.real.get(k, "")} for k in sorted(self.used)]


def mask_for(user: dict, chat_id: str | None) -> Mask:
    return Mask(user, chat_id)


# Quello che riceve il modello in più: le etichette vanno trattate come nomi veri
MASK_PROMPT = ("\n\nMODALITÀ RISERVATA: i dati personali ti arrivano come etichette ([PERSONA_1], [AZIENDA_1], [TEL_1], [EMAIL_1]…). Sono segnaposto: nella risposta e negli strumenti "
               "scrivili identici, con le parentesi, l'app li sostituisce con quelli veri e l'utente vede i nomi. Non dire mai che sono nascosti, non chiedere chi sono, non provare a indovinarli. "
               "La stessa etichetta è sempre la stessa persona. Per cercare in memoria, nei ticket o in agenda passa l'etichetta allo strumento: funziona. "
               "Le ricerche su internet invece vedono solo l'etichetta, quindi non cercare lì nomi di persone o aziende: dillo. In questa modalità non vedi le foto e non puoi creare immagini: "
               "se servono, digli di spegnere lo scudo «Riservato».")
# dove finirebbe il dato vero fuori da Aura: qui l'etichetta resta com'è
_MASK_KEEP_TOOLS = {"web_cerca", "web_leggi"}

_llm_stream_plain, _llm_once_plain = llm_stream, llm_once


async def llm_stream(payload: dict):   # sostituisce quella di cloud.py: tutto quello che parte per il cloud passa di qui
    mask = ACT_MASK.get()
    if not mask or not is_cloud(payload.get("model")):
        async for d in _llm_stream_plain(payload):
            yield d
        return
    try:
        payload = {**payload, "messages": mask.out(payload.get("messages") or [])}
    except Exception as e:   # meglio un errore che dati in chiaro
        print(f"Riservato: filtro non riuscito: {type(e).__name__}", flush=True)
        yield {"error": "Modalità riservata: il filtro non ha funzionato e non ho mandato niente al modello. Riprova o spegni lo scudo."}
        return
    async for d in _llm_stream_plain(payload):
        m = d.get("message")
        if m:
            m = dict(m)
            if m.get("content"):
                m["content"] = mask.feed(m["content"])
            if m.get("thinking"):
                m["thinking"] = mask.back(m["thinking"])
            if m.get("tool_calls"):
                calls = []
                for c in m["tool_calls"]:
                    f = dict(c.get("function") or {})
                    if f.get("name") not in _MASK_KEEP_TOOLS:
                        f["arguments"] = _mask_walk(_parse_args(f.get("arguments")), mask.back)
                    calls.append({**c, "function": f})
                m["tool_calls"] = calls
            d = {**d, "message": m}
        if d.get("done"):
            d["message"] = {**(d.get("message") or {"role": "assistant"}), "content": mask.flush() + ((d.get("message") or {}).get("content") or "")}
            d["masked"] = mask.shown()
        yield d


async def llm_once(messages: list[dict], *args, **kw) -> str:   # anche i lavori fatti durante il turno (smistare un ricordo, capire cosa salvare)
    mask = ACT_MASK.get()
    if not mask:
        return await _llm_once_plain(messages, *args, **kw)
    return mask.back(await _llm_once_plain(mask.out(messages), *args, **kw), quote=bool(kw.get("json_mode")))
