# Cerini IA, parte «strumenti»: gli strumenti di Aura e il sito del locale (menu, eventi).
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# --------------------------------------------------------------- strumenti ---
# Il modello non esegue nulla: chiede di usare uno strumento, il server lo esegue.
# Gli strumenti che cambiano qualcosa ("confirm") aspettano che l'utente prema Conferma nell'interfaccia;
# gli argomenti eseguiti sono quelli salvati qui sul server, non quelli rimandati dal browser.

PENDING: dict[str, dict] = {}   # id conferma -> {user_id, name, args, expires}
CONFIRM_MINUTES = 10
_caps: dict[str, list] = {}


async def model_caps(name: str) -> list:
    if is_cloud(name):
        return ["completion", "tools", "vision"]
    if name not in _caps:
        try:
            r = await ollama("POST", "/api/show", json={"model": name})
            _caps[name] = r.json().get("capabilities", []) if r.status_code == 200 else []
        except httpx.HTTPError:
            return []
    return _caps[name]


def _tool_list_users(user: dict, args: dict, request: Request) -> dict:
    now = int(time.time())
    with db() as c:
        users = [{"username": r["username"], "email": r["email"] or "nessuna", "ruolo": "amministratore" if r["role"] == "admin" else "utente",
                  "attivo": bool(r["active"]), "ultimo_accesso": fmt_ts(r["last_login"]), "creato_il": fmt_ts(r["created"])}
                 for r in c.execute("SELECT * FROM users ORDER BY created")]
        invites = [{"username": r["username"], "email": r["email"], "scade_tra_ore": round((r["expires"] - now) / 3600)}
                   for r in c.execute("SELECT * FROM invites WHERE expires > ? AND user_id IS NULL", (now,))]
    return {"content": json.dumps({"utenti": users, "inviti_in_attesa": invites}, ensure_ascii=False),
            "display": f"Ho letto l'elenco: {len(users)} account, {len(invites)} inviti in attesa"}


def _invite_args(args: dict) -> tuple[str, str, str]:
    username = str(args.get("username", "")).strip().lower()
    email = str(args.get("email", "")).strip()
    role = {"admin": "admin", "amministratore": "admin"}.get(str(args.get("ruolo", "user")).strip().lower(), "user")
    if not USERNAME_RE.fullmatch(username):
        raise ValueError("nome utente non valido: 2-32 caratteri tra lettere minuscole, numeri, punto, trattino")
    if email and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise ValueError("indirizzo email non valido")
    with db() as c:
        if c.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone():
            raise ValueError(f"esiste già un utente '{username}'")
    return username, email, role


def _summary_invite(args: dict) -> str:
    username, email, role = _invite_args(args)
    who = f"**{username}**" + (" come **amministratore**" if role == "admin" else "")
    return f"Creare un invito per {who}" + (f" e mandarlo a **{email}**?" if email else "? (nessuna email: il link lo copi tu)")


async def _tool_create_invite(user: dict, args: dict, request: Request) -> dict:
    username, email, role = _invite_args(args)
    res = await _create_invite(request, user, username, email, role)
    if res["mailed"]:
        display = f"Invito per {username} creato e inviato a {email}"
        content = f"Invito creato per '{username}' e inviato per email a {email}. Il link vale {INVITE_HOURS} ore."
    else:
        display = f"Invito per {username} creato, ma la mail non è partita ({res['mail_error']})"
        content = (f"Invito creato per '{username}', ma la mail NON è partita ({res['mail_error']}). "
                   f"Il link è nelle Impostazioni del pannello, l'utente può copiarlo da lì.")
    return {"content": content, "display": display, "link": res["link"]}


TOOLS = {
    "elenco_utenti": {
        "admin": True, "confirm": False, "run": _tool_list_users,
        "spec": {"type": "function", "function": {
            "name": "elenco_utenti",
            "description": "Elenca gli account del sito Cerini IA e gli inviti ancora in attesa.",
            "parameters": {"type": "object", "properties": {}}}},
    },
    "crea_invito": {
        "admin": True, "confirm": True, "run": _tool_create_invite, "summary": _summary_invite,
        "spec": {"type": "function", "function": {
            "name": "crea_invito",
            "description": ("Crea un invito per un nuovo account sul sito Cerini IA. Se c'è l'email, il link d'invito "
                            "viene mandato per posta: la persona apre il link e sceglie da sola la password."),
            "parameters": {"type": "object", "required": ["username"], "properties": {
                "username": {"type": "string", "description": "Nome utente, minuscolo, senza spazi (es. giulia)"},
                "email": {"type": "string", "description": "Indirizzo email a cui mandare l'invito (facoltativo)"},
                "ruolo": {"type": "string", "enum": ["user", "admin"], "description": "user (predefinito) o admin"},
            }}}},
    },
}


# --------------------------------------------------------- sito del locale ---
# Strumenti per il sito del locale (SITE_NAME, PHP): parlano con api/menu.php usando una chiave segreta.
# Attivi solo se SITE_API_URL e SITE_API_KEY sono nel .env, e solo per gli amministratori.

SITE_API_URL = os.environ.get("SITE_API_URL", "")
SITE_NAME = os.environ.get("SITE_NAME", "il locale")
SITE_DOMAIN = os.environ.get("SITE_DOMAIN", "")
SITE_API_KEY = os.environ.get("SITE_API_KEY", "")
COURSES = ["primo", "secondo", "contorno", "dolce"]


async def site(azione: str, **kw) -> dict:
    """Chiama l'API del sito; gli errori diventano ValueError con il messaggio del sito (leggibile dal modello)."""
    try:
        r = await client.post(SITE_API_URL, json={"azione": azione, **kw}, headers={"X-Api-Key": SITE_API_KEY},
                              timeout=httpx.Timeout(30.0, connect=10.0))
    except httpx.HTTPError as e:
        raise ValueError(f"il sito non risponde ({type(e).__name__})")
    try:
        d = r.json()
    except ValueError:
        raise ValueError(f"risposta non valida dal sito (HTTP {r.status_code})")
    if not d.get("ok"):
        raise ValueError(d.get("errore") or f"errore HTTP {r.status_code}")
    return d


def _eur(v) -> str:
    try:
        return f"{float(str(v).replace(',', '.').replace('€', '').strip()):.2f}".replace(".", ",") + " €"
    except ValueError:
        return str(v)


def _num(v) -> str:
    """Prezzo dato dal modello ("12", 8.5, "8,50 €") nel formato del sito ("8,50"); vuoto se manca."""
    if v in (None, ""):
        return ""
    return _eur(v).replace(" €", "")


# I 14 allergeni del sito e i modi in cui li chiama la gente (il sito accetta solo i nomi esatti)
ALLERGEN_ALIASES = {
    "glutine": "Glutine", "frumento": "Glutine", "grano": "Glutine", "farina": "Glutine", "pane": "Glutine", "orzo": "Glutine",
    "segale": "Glutine", "crostacei": "Crostacei", "gamberi": "Crostacei", "uova": "Uova", "uovo": "Uova", "pesce": "Pesce",
    "acciughe": "Pesce", "tonno": "Pesce", "arachidi": "Arachidi", "noccioline": "Arachidi", "soia": "Soia", "latte": "Latte",
    "latticini": "Latte", "lattosio": "Latte", "formaggio": "Latte", "derivati del latte": "Latte", "frutta a guscio": "Frutta a guscio",
    "frutta secca": "Frutta a guscio", "noci": "Frutta a guscio", "nocciole": "Frutta a guscio", "mandorle": "Frutta a guscio",
    "pistacchi": "Frutta a guscio", "sedano": "Sedano", "senape": "Senape", "sesamo": "Sesamo", "solfiti": "Solfiti",
    "anidride solforosa": "Solfiti", "lupini": "Lupini", "molluschi": "Molluschi", "cozze": "Molluschi", "vongole": "Molluschi",
}


def _norm_allergens(value) -> list:
    items = value if isinstance(value, list) else [value]
    # "Uova e Senape", "glutine/latte", "latte, uova": voci separate ("frutta a guscio" resta intera)
    parts = []
    for x in items:
        parts += [p for p in re.split(r"\s*(?:,|/|;|\+|\be\b|\bed\b)\s*", str(x or ""), flags=re.I) if p.strip()]
    out = []
    for x in parts:
        k = " ".join(str(x).lower().split())
        name = ALLERGEN_ALIASES.get(k, str(x).strip().capitalize())
        if name and name not in out:
            out.append(name)
    return out


def _clean_allergens(args: dict) -> dict:
    """Copia degli argomenti con gli allergeni nei nomi esatti del sito (es. 'latticini' -> 'Latte')."""
    return {**args, "allergeni": _norm_allergens(args["allergeni"])} if "allergeni" in args else args


def _preview_product(a: dict, base: dict | None = None) -> dict:
    """Prodotto come lo mostrera' il sito dopo la modifica: i campi dati dal modello sopra quelli attuali."""
    p = dict(base or {"id": None, "visibile": True, "del_giorno": False})
    for k in ("nome", "descrizione", "categoria", "etichetta"):
        if k in a:
            p[k] = a[k]
    for k in ("prezzo", "prezzo2"):
        if k in a:
            p[k] = _num(a[k])
    for k in ("visibile", "del_giorno"):
        if k in a:
            p[k] = a[k] in (True, 1, "1", "true", "sì", "si")
    if "allergeni" in a:
        al = a["allergeni"] if isinstance(a["allergeni"], list) else [a["allergeni"]]
        p["allergeni"] = [str(x).strip().capitalize() for x in al if str(x).strip()]
    if p.get("categoria") and not base:
        p["categoria"] = str(p["categoria"])[:1].upper() + str(p["categoria"])[1:]
    if p.get("prezzo2"):
        kind = a.get("tipo_prezzo") or ("beer" if "birr" in str(p.get("categoria", "")).lower() else "wine")
        p["tipo_prezzo"] = p.get("tipo_prezzo") if "tipo_prezzo" not in a and base else ("piccola/media" if kind == "beer" else "calice/bottiglia")
    return p


def _fmt_product(p: dict) -> str:
    s = f"#{p['id']} {p['nome']} [{p['categoria']}] {p['prezzo']} €"
    if p.get("prezzo2"):
        s += f" / {p['prezzo2']} € ({p.get('tipo_prezzo', '')})"
    if not p.get("visibile"):
        s += " · NASCOSTO"
    if p.get("del_giorno"):
        s += " · proposta del giorno"
    if p.get("etichetta"):
        s += f" · etichetta «{p['etichetta']}»"
    if p.get("descrizione"):
        s += f" — {p['descrizione']}"
    if p.get("allergeni"):
        s += f" (allergeni: {', '.join(p['allergeni'])})"
    return s


def _fmt_daily(m: dict) -> str:
    head = f"{m['giorno']} ({m['data']})"
    if not m.get("pubblicato"):
        head += " · NON pubblicato"
    if m.get("prezzo_menu"):
        head += f" · menu completo {m['prezzo_menu']} €"
    if m.get("nota"):
        head += f" · nota: {m['nota']}"
    lines = [head]
    for course, items in (m.get("portate") or {}).items():
        dishes = "; ".join(i["nome"] + (f" ({i['descrizione']})" if i.get("descrizione") else "") + (f" {i['prezzo']} €" if i.get("prezzo") else "") for i in items)
        lines.append(f"  {course}: {dishes}")
    return "\n".join(lines)


def _truthy(v) -> bool:
    return v in (True, 1, "1", "true", "True", "sì", "si", "yes")


async def _tool_site_read(user: dict, args: dict, request: Request) -> dict:
    # Filtri dell'API (categoria, cerca, solo nascosti) + filtri fatti qui (solo visibili, tutta la carta, solo proposte)
    filt = {k: args[k] for k in ("categoria", "cerca") if args.get(k)}
    visible = _truthy(args.get("solo_visibili"))
    hidden = _truthy(args.get("solo_nascosti")) and not visible
    if hidden:
        filt["solo_nascosti"] = True
    whole = _truthy(args.get("tutta_la_carta")) and not filt
    d = await site("leggi", **filt)
    if whole:
        # Tutta la carta: una lettura per categoria, in parallelo
        parts = await asyncio.gather(*(site("leggi", categoria_id=c["id"]) for c in d["categorie"] if c["prodotti"]))
        d["prodotti"] = [x for part in parts for x in part.get("prodotti", [])]
        d.pop("proposte_del_giorno", None)
    for key in ("prodotti", "proposte_del_giorno"):
        if key in d and visible:
            d[key] = [x for x in d[key] if x.get("visibile")]
        if key in d and hidden:
            d[key] = [x for x in d[key] if not x.get("visibile")]
        if key in d and _truthy(args.get("solo_proposte_del_giorno")):
            d[key] = [x for x in d[key] if x.get("del_giorno")]
    if visible:
        filt["solo_visibili"] = True
    if whole:
        filt["tutta_la_carta"] = True
    out = [f"Sito {SITE_NAME}. Giorno di servizio: {d['giorno']} ({d['oggi']}).",
           "Categorie della carta: " + "; ".join(f"{c['nome']} (id {c['id']}, {c['prodotti']} prodotti, {c['visibili']} visibili)" for c in d["categorie"]),
           "Portate del menu del giorno: " + ", ".join(d["portate_menu_del_giorno"]),
           "Allergeni ammessi: " + ", ".join(d["allergeni"])]
    out.append("Menu del giorno salvati da oggi in poi:" + ("" if d["menu_del_giorno"] else " nessuno"))
    out += [_fmt_daily(m) for m in d["menu_del_giorno"]]
    if "prodotti" in d:
        out.append(f"Prodotti trovati ({len(d['prodotti'])}):" + ("" if d["prodotti"] else " nessuno"))
        out += [_fmt_product(p) for p in d["prodotti"]]
    else:
        out.append("Proposte del giorno della carta (stellina)" + (" solo visibili" if visible else "") + ":"
                   + ("" if d["proposte_del_giorno"] else " nessuna"))
        out += [_fmt_product(p) for p in d["proposte_del_giorno"]]
    if _truthy(args.get("solo_proposte_del_giorno")):
        filt["solo_proposte_del_giorno"] = True
    labels = {"solo_visibili": "solo attivi", "solo_nascosti": "solo disattivati", "tutta_la_carta": "tutta la carta",
              "solo_proposte_del_giorno": "proposte del giorno"}
    bits = [labels[k] if k in labels else (f"«{v}»" if k == "cerca" else str(v)) for k, v in filt.items()]
    what = f" ({', '.join(bits)})" if bits else ""
    out.append("(L'utente vede già questi dati sullo schermo come scheda grafica uguale al sito: non ricopiare l'elenco dei piatti, rispondi in una o due frasi (o alla domanda precisa che ha fatto).)")
    return {"content": "\n".join(out), "display": f"Ho letto il menu del sito{what}", "view": site_view(d, filt)}


def site_view(data: dict, filt: dict | None = None) -> dict:
    """Dati per la scheda in stile sito: il browser la disegna, il modello non deve ripetere l'elenco."""
    return {"kind": "site", "origin": SITE_ORIGIN, "filter": filt or {}, "data": data}


def _check_dishes(args: dict) -> list:
    dishes = args.get("piatti")
    if not isinstance(dishes, list) or not dishes:
        raise ValueError("servono i piatti del menu (portata e nome)")
    for i, p in enumerate(dishes, 1):
        if not isinstance(p, dict) or not str(p.get("nome", "")).strip():
            raise ValueError(f"al piatto {i} manca il nome")
        if str(p.get("portata", "")).strip().lower() not in COURSES:
            raise ValueError(f"portata non valida per «{p.get('nome')}»: usa {', '.join(COURSES)}")
    return dishes


async def _summary_daily_set(args: dict) -> str:
    dishes = _check_dishes(args)
    cur = await site("menu_giorno", data=args.get("data") or "oggi")
    s = f"Pubblicare sul sito il **menu del giorno di {cur['giorno']}**"
    if cur.get("menu"):
        n = sum(len(v) for v in cur["menu"]["portate"].values())
        s += f" (sostituisce quello già salvato, {n} piatti)"
    s += "?\n"
    for course in COURSES:
        for p in dishes:
            if str(p.get("portata")).strip().lower() == course:
                line = f"\n- **{course.capitalize()}:** {p['nome']}"
                if p.get("descrizione"):
                    line += f" — {p['descrizione']}"
                if p.get("prezzo"):
                    line += f" · {_eur(p['prezzo'])}"
                s += line
    extra = []
    if args.get("prezzo_menu"):
        extra.append(f"menu completo {_eur(args['prezzo_menu'])}")
    if args.get("nota"):
        extra.append(f"nota: {args['nota']}")
    if args.get("pubblicato") is False:
        extra.append("**non pubblicato** (salvato ma nascosto)")
    if extra:
        s += "\n\n" + " · ".join(extra)
    courses = {}
    for p in dishes:
        courses.setdefault(str(p["portata"]).strip().lower(), []).append(
            {k: v for k, v in {"nome": p["nome"], "descrizione": p.get("descrizione"), "prezzo": _num(p.get("prezzo"))}.items() if v})
    preview = {"data": cur["data"], "giorno": cur["giorno"], "pubblicato": args.get("pubblicato") is not False,
               "prezzo_menu": _num(args.get("prezzo_menu")) or None, "nota": args.get("nota") or "", "portate": courses}
    return s, site_view({"menu_del_giorno": [preview]})


async def _tool_daily_set(user: dict, args: dict, request: Request) -> dict:
    payload = {k: args[k] for k in ("data", "piatti", "prezzo_menu", "nota", "pubblicato") if k in args}
    payload.setdefault("data", "oggi")
    m = (await site("imposta_menu_giorno", **payload))["menu"]
    n = sum(len(v) for v in m["portate"].values())
    return {"content": f"Menu del giorno salvato sul sito ({n} piatti):\n{_fmt_daily(m)}", "view": site_view({"menu_del_giorno": [m]}),
            "display": f"Menu del giorno di {m['giorno']} {'pubblicato' if m['pubblicato'] else 'salvato (non pubblicato)'} sul sito"}


async def _summary_daily_delete(args: dict) -> str:
    cur = await site("menu_giorno", data=args.get("data") or "oggi")
    if not cur.get("menu"):
        raise ValueError(f"non c'è un menu del giorno per {cur['giorno']}")
    n = sum(len(v) for v in cur["menu"]["portate"].values())
    return f"Togliere dal sito il **menu del giorno di {cur['giorno']}** ({n} piatti)?"


async def _tool_daily_delete(user: dict, args: dict, request: Request) -> dict:
    d = await site("elimina_menu_giorno", data=args.get("data") or "oggi")
    return {"content": f"Menu del giorno del {d['eliminato']} tolto dal sito.", "display": f"Menu del giorno del {d['eliminato']} tolto dal sito"}


def _product_fields_md(a: dict) -> str:
    bits = []
    if a.get("prezzo") not in (None, ""):
        bits.append(_eur(a["prezzo"]))
    if a.get("prezzo2") not in (None, ""):
        bits.append(f"secondo prezzo {_eur(a['prezzo2'])}")
    if a.get("descrizione"):
        bits.append(str(a["descrizione"]))
    if a.get("allergeni"):
        al = a["allergeni"] if isinstance(a["allergeni"], list) else [a["allergeni"]]
        bits.append("allergeni: " + ", ".join(map(str, al)))
    if a.get("del_giorno"):
        bits.append("proposta del giorno")
    if a.get("visibile") is False:
        bits.append("**nascosto**")
    return " · ".join(bits)


def _norm(t: str) -> str:
    return " ".join(re.sub(r"[^a-z0-9àèéìòù ]", " ", str(t).lower()).split())


async def _similar_products(name: str) -> list:
    """Prodotti della carta col nome uguale o molto simile (anche nascosti)."""
    import difflib
    target = _norm(name)
    words = [w for w in target.split() if len(w) > 3] or target.split()
    found = {}
    for q in dict.fromkeys([target] + words[:2]):
        try:
            for x in (await site("leggi", cerca=q)).get("prodotti", []):
                found[x["id"]] = x
        except ValueError:
            pass
    out = []
    for x in found.values():
        n = _norm(x["nome"])
        if n == target or difflib.SequenceMatcher(None, n, target).ratio() >= 0.72 or (len(target) > 4 and (target in n or n in target)):
            out.append(x)
    return out


async def _summary_product_add(args: dict) -> str:
    if not str(args.get("nome", "")).strip() or not str(args.get("categoria", "")).strip():
        raise ValueError("servono almeno nome e categoria del prodotto")
    if not _truthy(args.get("anche_se_simile")):
        sim = await _similar_products(args["nome"])
        if sim:
            desc = "; ".join(f"#{x['id']} «{x['nome']}» in {x['categoria']}, {'visibile' if x['visibile'] else 'NASCOSTO'}, {x['prezzo']} €" for x in sim[:4])
            raise ValueError(f"nella carta esiste già qualcosa di simile: {desc}. NON aggiungerlo: chiedi all'utente se vuole "
                             f"riattivare o modificare quello esistente (prodotto_modifica) oppure crearne uno nuovo comunque "
                             f"(in quel caso richiama prodotto_aggiungi con anche_se_simile=true)")
    s = f"Aggiungere alla carta, in **{args['categoria']}**: **{args['nome']}**?"
    return s, site_view({"prodotti": [_preview_product(args)]})


async def _tool_product_add(user: dict, args: dict, request: Request) -> dict:
    keys = ("categoria", "nome", "descrizione", "prezzo", "prezzo2", "tipo_prezzo", "etichetta", "allergeni", "visibile", "del_giorno")
    args = _clean_allergens(args)
    p = (await site("aggiungi_prodotto", **{k: args[k] for k in keys if k in args}))["prodotto"]
    return {"content": "Prodotto aggiunto: " + _fmt_product(p), "display": f"«{p['nome']}» aggiunto alla carta ({p['categoria']})",
            "view": site_view({"prodotti": [p]})}


EDITABLE = {"nome": "nome", "descrizione": "descrizione", "categoria": "categoria", "prezzo": "prezzo", "prezzo2": "secondo prezzo",
            "tipo_prezzo": "tipo di prezzo", "etichetta": "etichetta", "visibile": "visibile", "del_giorno": "proposta del giorno", "allergeni": "allergeni"}


def _yn(v) -> str:
    return "sì" if v in (True, 1, "1", "true", "sì", "si") else "no"


async def _summary_product_edit(args: dict) -> str:
    p = (await site("prodotto", id=int(args.get("id") or 0)))["prodotto"]
    changes = []
    for k, label in EDITABLE.items():
        if k not in args:
            continue
        new = args[k]
        if k in ("visibile", "del_giorno"):
            old, new = _yn(p.get(k)), _yn(new)
        elif k in ("prezzo", "prezzo2"):
            old, new = (f"{p[k]} €" if p.get(k) else "—"), _eur(new)
        elif k == "allergeni":
            old, new = ", ".join(p.get("allergeni") or []) or "nessuno", ", ".join(map(str, new if isinstance(new, list) else [new])) or "nessuno"
        else:
            old = p.get(k, "") or "—"
        if str(old) != str(new):
            changes.append(f"\n- {label}: {old} → **{new}**")
    if not changes:
        state = ("visibile" if p.get("visibile") else "nascosto") + (", con la stellina di proposta del giorno" if p.get("del_giorno") else "")
        raise ValueError(f"«{p['nome']}» è già così (ora è {state}): se l'utente voleva attivarlo o disattivarlo usa il campo "
                         f"'visibile', altrimenti chiedigli cosa cambiare")
    return (f"Modificare **{p['nome']}** ({p['categoria']}) sul sito?" + "".join(changes),
            site_view({"prodotti": [_preview_product(args, p)]}))


async def _tool_product_edit(user: dict, args: dict, request: Request) -> dict:
    args = _clean_allergens(args)
    d = await site("modifica_prodotto", **{k: args[k] for k in ("id", *EDITABLE) if k in args})
    p = d["prodotto"]
    if d["prima"]["visibile"] != p["visibile"]:
        display = f"«{p['nome']}» {'rimesso nel menu' if p['visibile'] else 'nascosto dal menu'}"
    else:
        display = f"«{p['nome']}» modificato"
    return {"content": "Prodotto aggiornato: " + _fmt_product(p), "display": display, "view": site_view({"prodotti": [p]})}


async def _summary_product_delete(args: dict) -> str:
    p = (await site("prodotto", id=int(args.get("id") or 0)))["prodotto"]
    return (f"Eliminare **definitivamente** dalla carta **{p['nome']}** ({p['categoria']}, {p['prezzo']} €)?\n\n"
            "Se è solo finito, meglio nasconderlo. (Il sito tiene comunque una copia di sicurezza di oggi.)",
            site_view({"prodotti": [p]}))


async def _tool_product_delete(user: dict, args: dict, request: Request) -> dict:
    p = (await site("elimina_prodotto", id=int(args.get("id") or 0)))["eliminato"]
    return {"content": f"Prodotto eliminato: {p['nome']} ({p['categoria']}).", "display": f"«{p['nome']}» eliminato dalla carta"}


async def _summary_category_add(args: dict) -> str:
    if not str(args.get("nome", "")).strip():
        raise ValueError("serve il nome della categoria")
    return f"Aggiungere alla carta del sito la nuova categoria **{args['nome']}**?"


async def _tool_category_add(user: dict, args: dict, request: Request) -> dict:
    c = (await site("aggiungi_categoria", nome=args.get("nome", "")))["categoria"]
    return {"content": f"Categoria creata: {c['nome']} (id {c['id']}).", "display": f"Categoria «{c['nome']}» creata"}


def _fn(name: str, description: str, properties: dict, required: list | None = None) -> dict:
    return {"type": "function", "function": {"name": name, "description": description,
            "parameters": {"type": "object", "properties": properties, "required": required or []}}}


_S = {"type": "string"}
_DATE = {"type": "string", "description": "\"oggi\", \"domani\" oppure AAAA-MM-GG"}
_PRICE = {"type": "string", "description": "In euro, per esempio \"12,50\""}
_PRODUCT_PROPS = {
    "categoria": {"type": "string", "description": "Nome di una categoria esistente della carta (vedi sito_leggi)"},
    "nome": {"type": "string", "description": "Nome breve, come sul menu (es. \"Polenta concia\"): gli ingredienti NON vanno qui"},
    "descrizione": {"type": "string", "description": "Ingredienti o breve descrizione (es. \"Con toma e burro fuso\")"},
    "prezzo": _PRICE,
    "prezzo2": {"type": "string", "description": "Secondo prezzo: bottiglia per i vini, media per le birre"},
    "tipo_prezzo": {"type": "string", "enum": ["wine", "beer"], "description": "wine = calice/bottiglia, beer = piccola/media"},
    "etichetta": {"type": "string", "description": "Piccola etichetta facoltativa, es. Novità"},
    "allergeni": {"type": "array", "items": _S, "description": "Tra gli allergeni ammessi dal sito"},
    "visibile": {"type": "boolean", "description": "true = visibile ai clienti (l'utente dice: attiva, attivalo, accendi, rimetti, "
                 "mostra, rendi disponibile, è tornato); false = nascosto ma non cancellato (disattiva, spegni, togli, nascondi, è finito, "
                 "non c'è più per oggi)"},
    "anche_se_simile": {"type": "boolean", "description": "Solo per prodotto_aggiungi: true se l'utente ha confermato di volere un prodotto nuovo anche se ne esiste uno simile"},
    "del_giorno": {"type": "boolean", "description": "Stellina di 'proposta del giorno' in evidenza: cambiala SOLO se l'utente parla "
                   "esplicitamente di proposta del giorno, stellina o metterlo in evidenza. Attivare/disattivare un piatto è 'visibile', non questo."},
}

if SITE_API_URL and SITE_API_KEY:
    TOOLS.update({
        "sito_leggi": {
            "admin": True, "confirm": False, "run": _tool_site_read,
            "spec": _fn("sito_leggi", f"Legge il sito del locale {SITE_NAME}: categorie della carta, menu del giorno salvati, proposte "
                        "del giorno e, con i filtri, i prodotti con id, prezzi e stato (visibile/nascosto). Usalo prima di modificare "
                        "qualcosa per conoscere id e categorie esatte.",
                        {"categoria": {"type": "string", "description": "Mostra i prodotti di questa categoria"},
                         "cerca": {"type": "string", "description": "Cerca nei nomi e nelle descrizioni"},
                         "solo_visibili": {"type": "boolean", "description": "Solo quelli visibili ai clienti: quando l'utente dice attivi, disponibili, visibili, accesi, in menu"},
                         "solo_nascosti": {"type": "boolean", "description": "Solo quelli nascosti: quando l'utente dice disattivati, spenti, nascosti, non disponibili, finiti"},
                         "solo_proposte_del_giorno": {"type": "boolean", "description": "Solo i prodotti con la stellina di proposta del giorno"},
                         "tutta_la_carta": {"type": "boolean", "description": "Tutti i prodotti di tutte le categorie (es. 'fammi vedere tutto il menu' o 'tutti i piatti attivi')"}})},
        "menu_giorno_imposta": {
            "admin": True, "confirm": True, "run": _tool_daily_set, "summary": _summary_daily_set,
            "spec": _fn("menu_giorno_imposta", "Pubblica sul sito il MENU DEL GIORNO di una data, diviso nelle portate primo, secondo, "
                        "contorno, dolce. Quando l'utente elenca i piatti del giorno, dividili tu nelle portate giuste. "
                        "Sostituisce tutti i piatti già salvati per quella data.",
                        {"data": _DATE,
                         "piatti": {"type": "array", "items": {"type": "object", "required": ["portata", "nome"], "properties": {
                             "portata": {"type": "string", "enum": COURSES},
                             "nome": {"type": "string", "description": "Nome breve del piatto; gli ingredienti vanno in descrizione"},
                             "descrizione": {"type": "string", "description": "Ingredienti, facoltativo"},
                             "prezzo": {"type": "string", "description": "Prezzo del singolo piatto, facoltativo"}}}},
                         "prezzo_menu": {"type": "string", "description": "Prezzo del menu completo, facoltativo"},
                         "nota": {"type": "string", "description": "Es. Primo + secondo + acqua · solo a pranzo"},
                         "pubblicato": {"type": "boolean", "description": "false = salvato ma non ancora visibile"}},
                        ["piatti"])},
        "menu_giorno_elimina": {
            "admin": True, "confirm": True, "run": _tool_daily_delete, "summary": _summary_daily_delete,
            "spec": _fn("menu_giorno_elimina", "Toglie dal sito il MENU DEL GIORNO (il riquadro a prezzo fisso con primo/secondo/"
                        "contorno/dolce) di una data. Usalo SOLO se l'utente dice esattamente 'menu del giorno' o 'menu fisso'. "
                        "NON usarlo MAI per 'piatti del giorno' o 'proposte del giorno': quelli sono prodotti della carta con la "
                        "stellina e si spengono con prodotto_modifica visibile=false.", {"data": _DATE})},
        "prodotto_aggiungi": {
            "admin": True, "confirm": True, "run": _tool_product_add, "summary": _summary_product_add,
            "spec": _fn("prodotto_aggiungi", "Aggiunge un prodotto alla CARTA fissa del sito (panini, piatti, birre, vini...), "
                        "non al menu del giorno.", _PRODUCT_PROPS, ["categoria", "nome", "prezzo"])},
        "prodotto_modifica": {
            "admin": True, "confirm": True, "run": _tool_product_edit, "summary": _summary_product_edit,
            "spec": _fn("prodotto_modifica", "Modifica un prodotto della carta: passa l'id (da sito_leggi) e SOLO i campi da cambiare. "
                        "Per nascondere un prodotto finito visibile=false, per rimetterlo visibile=true.",
                        {"id": {"type": "integer"}, **_PRODUCT_PROPS}, ["id"])},
        "prodotto_elimina": {
            "admin": True, "confirm": True, "run": _tool_product_delete, "summary": _summary_product_delete,
            "spec": _fn("prodotto_elimina", "Elimina definitivamente un prodotto dalla carta. Se è solo finito, meglio "
                        "nasconderlo con prodotto_modifica.", {"id": {"type": "integer"}}, ["id"])},
        "categoria_aggiungi": {
            "admin": True, "confirm": True, "run": _tool_category_add, "summary": _summary_category_add,
            "spec": _fn("categoria_aggiungi", "Crea una nuova categoria nella carta del sito.", {"nome": _S}, ["nome"])},
    })

SITE_PROMPT = (f"\n\nGestisci anche il sito del locale {SITE_NAME}" + (f" ({SITE_DOMAIN})" if SITE_DOMAIN else "") + ". "
               "ATTENZIONE, distinzione fondamentale: 'MENU DEL GIORNO' è il riquadro a prezzo fisso con le portate (strumenti "
               "menu_giorno_*); 'PIATTI DEL GIORNO' o 'PROPOSTE DEL GIORNO' sono invece prodotti della carta con la stellina "
               "(campo del_giorno, strumenti prodotto_*). Esempio: 'disattiva i piatti del giorno' = leggi le proposte del giorno "
               "con sito_leggi e chiama prodotto_modifica visibile=false per OGNUNA; non toccare il menu del giorno. "
               "PIÙ COSE INSIEME: se l'utente chiede di aggiungere, modificare o spegnere più piatti, chiama lo strumento una "
               "volta per OGNI piatto nella stessa risposta: l'utente le conferma tutte insieme. "
               "PIATTO GIÀ ESISTENTE: se prodotto_aggiungi risponde che esiste già un piatto simile, chiedi all'utente se vuole "
               "riattivare quello esistente o aggiungerne uno nuovo. "
               "Sono due cose diverse: "
               "1) il MENU DEL GIORNO, per data, con le portate primo, secondo, contorno e dolce (si imposta con "
               "menu_giorno_imposta quando l'utente detta i piatti del giorno o il menu di oggi); "
               "2) la CARTA fissa, fatta di categorie e prodotti, dove un prodotto può essere visibile o nascosto e può avere "
               "la stellina di proposta del giorno. Se non conosci id o categoria esatti, chiama prima sito_leggi. "
               "Nel menu del giorno: pasta, risotti, gnocchi, zuppe e minestre sono PRIMI; carne, pesce, uova e piatti "
               "unici sono SECONDI; verdure, patate e insalate di accompagnamento sono CONTORNI; i dolci sono DOLCI. "
               "Se l'utente dice \"aggiungi tra i panini / tra i piatti / tra le birre...\" parla di una categoria della "
               "CARTA (prodotto_aggiungi), non del menu del giorno. "
               "Linguaggio del locale: ATTIVO/ATTIVARE/ACCENDERE/RIMETTERE/DISPONIBILE = visibile ai clienti (visibile=true); "
               "DISATTIVARE/SPEGNERE/TOGLIERE/FINITO/NASCONDERE = nascosto (visibile=false). La stellina 'proposta del giorno' "
               "(del_giorno) è un'altra cosa: si cambia solo se l'utente la nomina. Se chiede quelli attivi o disponibili usa "
               "solo_visibili, se chiede quelli disattivati usa solo_nascosti, se chiede tutto il menu usa tutta_la_carta. "
               "Se il nome che dice l'utente corrisponde a più prodotti (es. 'insalata' e 'insalatona'), scegli quello col nome "
               "più uguale; se non è chiaro chiedi quale. "
               "Non inventare prezzi: se l'utente non li dice, lasciali vuoti. "
               "IMPORTANTE: quando leggi o modifichi il menu, l'interfaccia mostra già all'utente una scheda grafica con tutti "
               "i piatti, uguale al sito. Quindi NON elencare di nuovo i piatti nella risposta: scrivi solo una frase breve "
               "(per esempio quante proposte ci sono o cosa hai cambiato), oppure rispondi alla domanda precisa. "
               "Se l'utente chiede di vedere qualcosa del menu, chiama sito_leggi anche se l'hai già letto prima, "
               "così vede la scheda aggiornata.")


# ----------------------------------------------------------- eventi del sito ---
# Serate ed "appuntamenti golosi" (un piatto che entra nel menu da solo nei giorni dell'evento).
# La foto: se l'utente la allega al messaggio, il server la prende dal messaggio (non passa dal modello).

def _fmt_event(e: dict) -> str:
    s = f"#{e['id']} [{e['tipo']}] «{e['titolo']}» — {e['giorno']} ({e['data']})"
    if e.get("ora"):
        s += f" dalle {e['ora']}"
    if e.get("data_fine"):
        s += f" fino a {e['giorno_fine']}"
    s += f" · {e['stato']}" + ("" if e.get("pubblicato") else " · NON pubblicato") + (" · con foto" if e.get("foto") else " · senza foto")
    if e.get("piatto"):
        pz = e["piatto"]
        s += f" · piatto: {pz.get('nome', '')}" + (f" {pz['prezzo']} €" if pz.get("prezzo") else "")
    if e.get("descrizione"):
        s += f" — {e['descrizione'][:160]}"
    return s


async def _tool_events_read(user: dict, args: dict, request: Request) -> dict:
    kw = {k: args[k] for k in ("cerca", "giorni_passati") if args.get(k)}
    d = await site("eventi", **kw)
    lines = [f"Eventi del sito (oggi {d['oggi']}): " + ("" if d["eventi"] else "nessuno")] + [_fmt_event(e) for e in d["eventi"]]
    lines.append("(L'utente vede già gli eventi come schede grafiche: non ricopiarli, rispondi in breve.)")
    return {"content": "\n".join(lines), "display": "Ho letto gli eventi del sito" + (f" («{args['cerca']}»)" if args.get("cerca") else ""),
            "view": site_view({"eventi": d["eventi"]})}


EVENT_KEYS = ("tipo", "titolo", "descrizione", "data", "ora", "data_fine", "piatto_nome", "piatto_descrizione", "piatto_prezzo", "allergeni", "pubblicato")


def _event_payload(args: dict) -> dict:
    args = _clean_allergens(args)
    out = {k: args[k] for k in EVENT_KEYS if k in args}
    if args.get("_foto"):
        out["foto_base64"] = args["_foto"]
    if _truthy(args.get("togli_foto")):
        out["togli_foto"] = True
    return out


def _preview_event(a: dict, base: dict | None = None) -> dict:
    e = dict(base or {"id": None, "pubblicato": True, "stato": "in programma"})
    golo = "golos" in str(a.get("tipo", e.get("tipo", ""))).lower() or "culin" in str(a.get("tipo", "")).lower()
    e["tipo"] = "appuntamento goloso" if golo else (e.get("tipo") if base and "tipo" not in a else "serata/evento")
    for k in ("titolo", "descrizione", "ora"):
        if k in a:
            e[k] = a[k]
    if "data" in a:
        e["data"] = a["data"]; e["giorno"] = a["data"]
    if "data_fine" in a and a["data_fine"]:
        e["data_fine"] = a["data_fine"]; e["giorno_fine"] = a["data_fine"]
    if "pubblicato" in a:
        e["pubblicato"] = _truthy(a["pubblicato"])
    if e["tipo"] == "appuntamento goloso":
        pz = dict(e.get("piatto") or {})
        for k, kk in (("piatto_nome", "nome"), ("piatto_descrizione", "descrizione")):
            if k in a:
                pz[kk] = a[k]
        if "piatto_prezzo" in a:
            pz["prezzo"] = _num(a["piatto_prezzo"])
        if "allergeni" in a:
            pz["allergeni"] = [str(x).capitalize() for x in (a["allergeni"] if isinstance(a["allergeni"], list) else [a["allergeni"]])]
        e["piatto"] = pz
    if a.get("_foto"):
        e["foto"] = {"data": "data:image/jpeg;base64," + a["_foto"]}
    elif _truthy(a.get("togli_foto")):
        e.pop("foto", None)
    return e


async def _similar_events(title: str) -> list:
    import difflib
    target, out = _norm(title), []
    words = [w for w in target.split() if len(w) > 3][:2] or [target]
    seen = {}
    for q in dict.fromkeys([target] + words):
        try:
            for e in (await site("eventi", cerca=q, giorni_passati=365))["eventi"]:
                seen[e["id"]] = e
        except ValueError:
            pass
    for e in seen.values():
        n = _norm(e["titolo"])
        if n == target or difflib.SequenceMatcher(None, n, target).ratio() >= 0.7 or (len(target) > 4 and (target in n or n in target)):
            out.append(e)
    return out


async def _summary_event_add(args: dict):
    if not str(args.get("titolo", "")).strip() or not str(args.get("descrizione", "")).strip():
        raise ValueError("servono almeno titolo e descrizione dell'evento")
    if not _truthy(args.get("anche_se_simile")):
        sim = await _similar_events(args["titolo"])
        if sim:
            desc = "; ".join(f"#{e['id']} «{e['titolo']}» del {e['giorno']}, {e['stato']}, {'pubblicato' if e['pubblicato'] else 'NON pubblicato'}" for e in sim[:4])
            raise ValueError(f"esiste già un evento simile: {desc}. NON crearlo: chiedi all'utente se vuole riusare quello "
                             f"(evento_duplica per una nuova data, oppure evento_modifica per ripubblicarlo o cambiarlo) oppure "
                             f"crearne uno nuovo comunque (in quel caso richiama evento_aggiungi con anche_se_simile=true)")
    kind = "appuntamento goloso" if "golos" in str(args.get("tipo", "")).lower() else "serata"
    article = "l'" if kind.startswith("a") else "la "
    s = f"Creare sul sito {article}**{kind}** «**{args['titolo']}**» per **{args.get('data') or 'oggi'}**"
    if args.get("ora"):
        s += f" dalle {args['ora']}"
    if args.get("data_fine"):
        s += f" fino al {args['data_fine']}"
    if args.get("_foto_troppo_grande"):
        raise ValueError("la foto allegata è troppo grande (oltre 2,5 MB): chiedi all'utente di allegarne una più piccola")
    s += "?" + ("\n\nCon la foto che hai allegato." if args.get("_foto") else "\n\nSenza foto (puoi allegarla al messaggio).")
    return s, site_view({"eventi": [_preview_event(args)]})


async def _tool_event_add(user: dict, args: dict, request: Request) -> dict:
    e = (await site("aggiungi_evento", **_event_payload(args)))["evento"]
    return {"content": "Evento creato: " + _fmt_event(e), "display": f"«{e['titolo']}» creato per {e['giorno']}", "view": site_view({"eventi": [e]})}


async def _event_by_id(eid) -> dict:
    for e in (await site("eventi", giorni_passati=365))["eventi"]:
        if e["id"] == int(eid or 0):
            return e
    raise ValueError("evento non trovato (forse è più vecchio di un anno): leggi prima gli eventi con eventi_leggi")


async def _summary_event_edit(args: dict):
    e = await _event_by_id(args.get("id"))
    labels = {"titolo": "titolo", "descrizione": "descrizione", "data": "data", "ora": "ora", "data_fine": "fino al", "tipo": "tipo",
              "piatto_nome": "piatto", "piatto_descrizione": "descrizione piatto", "piatto_prezzo": "prezzo piatto", "pubblicato": "pubblicato"}
    changes = [f"\n- {lab}: **{_yn(args[k]) if k == 'pubblicato' else args[k]}**" for k, lab in labels.items() if k in args]
    if "allergeni" in args and sorted(_norm_allergens(args["allergeni"])) == sorted((e.get("piatto") or {}).get("allergeni") or []):
        args = {k: v for k, v in args.items() if k != "allergeni"}   # uguali a quelli attuali: non è una modifica
        changes = [c for c in changes if not c.startswith("\n- allergeni")]
    if "allergeni" in args:
        old = ", ".join((e.get("piatto") or {}).get("allergeni") or []) or "nessuno"
        changes.append(f"\n- allergeni del piatto: {old} → **{', '.join(_norm_allergens(args['allergeni'])) or 'nessuno'}**")
    if args.get("_foto"):
        changes.append("\n- foto: **quella che hai allegato**")
    if _truthy(args.get("togli_foto")):
        changes.append("\n- foto: **tolta**")
    if not changes:
        raise ValueError("nessuna modifica indicata per l'evento")
    return f"Modificare l'evento «**{e['titolo']}**» del {e['giorno']}?" + "".join(changes), site_view({"eventi": [_preview_event(args, e)]})


async def _tool_event_edit(user: dict, args: dict, request: Request) -> dict:
    d = await site("modifica_evento", id=int(args.get("id") or 0), **_event_payload(args))
    e = d["evento"]
    return {"content": "Evento aggiornato: " + _fmt_event(e), "display": f"«{e['titolo']}» aggiornato", "view": site_view({"eventi": [e]})}


async def _summary_event_dup(args: dict):
    e = await _event_by_id(args.get("id"))
    when = args.get("data") or f"{int(args.get('giorni') or 7)} giorni dopo"
    return f"Ripetere l'evento «**{e['titolo']}**» (del {e['giorno']}) per **{when}**? Viene creata una copia pubblicata, con la stessa foto.", \
        site_view({"eventi": [_preview_event({"data": args.get("data") or when}, e)]})


async def _tool_event_dup(user: dict, args: dict, request: Request) -> dict:
    kw = {"id": int(args.get("id") or 0)}
    if args.get("data"):
        kw["data"] = args["data"]
    elif args.get("giorni"):
        kw["giorni"] = int(args["giorni"])
    e = (await site("duplica_evento", **kw))["evento"]
    return {"content": "Evento ripetuto: " + _fmt_event(e), "display": f"«{e['titolo']}» ripetuto per {e['giorno']}", "view": site_view({"eventi": [e]})}


async def _summary_event_delete(args: dict):
    e = await _event_by_id(args.get("id"))
    return (f"Eliminare **definitivamente** l'evento «**{e['titolo']}**» del {e['giorno']}? Se vuoi solo nasconderlo, meglio "
            "togliere la pubblicazione."), site_view({"eventi": [e]})


async def _tool_event_delete(user: dict, args: dict, request: Request) -> dict:
    e = (await site("elimina_evento", id=int(args.get("id") or 0)))["eliminato"]
    return {"content": f"Evento eliminato: {e['titolo']} ({e['giorno']}).", "display": f"«{e['titolo']}» eliminato"}


_EVENT_PROPS = {
    "tipo": {"type": "string", "enum": ["serata", "appuntamento goloso"],
             "description": "serata = evento, festa, musica, serata a tema; appuntamento goloso = una proposta di cucina legata a una data (es. Venerdì Galletto): il suo piatto entra nel menu da solo in quei giorni"},
    "titolo": _S, "descrizione": {"type": "string", "description": "Testo dell'evento come comparirà sul sito"},
    "data": _DATE, "ora": {"type": "string", "description": "HH:MM, facoltativa"},
    "data_fine": {"type": "string", "description": "Solo per appuntamenti golosi di più giorni: ultimo giorno (AAAA-MM-GG)"},
    "piatto_nome": {"type": "string", "description": "Solo appuntamento goloso: nome del piatto"},
    "piatto_descrizione": {"type": "string", "description": "Solo appuntamento goloso: ingredienti del piatto"},
    "piatto_prezzo": {"type": "string", "description": "Solo appuntamento goloso: prezzo, es. \"15,00\""},
    "allergeni": {"type": "array", "items": _S, "description": "Solo appuntamento goloso: allergeni del piatto, tra i 14 del sito: "
                  "Glutine, Crostacei, Uova, Pesce, Arachidi, Soia, Latte, Frutta a guscio, Sedano, Senape, Sesamo, Solfiti, Lupini, Molluschi"},
    "pubblicato": {"type": "boolean", "description": "false = salvato ma non visibile sul sito"},
    "usa_foto_allegata": {"type": "boolean", "description": "true se l'utente ha allegato una foto per l'evento in questo messaggio"},
    "togli_foto": {"type": "boolean", "description": "true per togliere la foto attuale"},
}

if SITE_API_URL and SITE_API_KEY:
    TOOLS.update({
        "eventi_leggi": {
            "admin": True, "confirm": False, "run": _tool_events_read,
            "spec": _fn("eventi_leggi", "Legge gli eventi del sito (serate e appuntamenti golosi): in corso, in programma e passati di "
                        "recente, con id, date, stato e se sono pubblicati. Usalo prima di creare o modificare un evento.",
                        {"cerca": {"type": "string", "description": "Cerca nel titolo, nella descrizione o nel piatto"},
                         "giorni_passati": {"type": "integer", "description": "Quanti giorni indietro guardare (di base 45)"}})},
        "evento_aggiungi": {
            "admin": True, "confirm": True, "run": _tool_event_add, "summary": _summary_event_add,
            "spec": _fn("evento_aggiungi", "Crea sul sito una serata o un appuntamento goloso (pagina Eventi & novità).",
                        {**_EVENT_PROPS, "anche_se_simile": {"type": "boolean", "description": "true se l'utente ha confermato di volere un evento nuovo anche se ne esiste uno simile"}},
                        ["tipo", "titolo", "descrizione", "data"])},
        "evento_modifica": {
            "admin": True, "confirm": True, "run": _tool_event_edit, "summary": _summary_event_edit,
            "spec": _fn("evento_modifica", "Modifica un evento esistente: passa l'id (da eventi_leggi) e SOLO i campi da cambiare. "
                        "Per ripubblicare un evento nascosto pubblicato=true; per spostarlo cambia data.",
                        {"id": {"type": "integer"}, **_EVENT_PROPS}, ["id"])},
        "evento_duplica": {
            "admin": True, "confirm": True, "run": _tool_event_dup, "summary": _summary_event_dup,
            "spec": _fn("evento_duplica", "Ripete un evento esistente per una nuova data (copia con la stessa foto e lo stesso piatto). "
                        "Ideale per gli appuntamenti fissi, es. il Venerdì Galletto della settimana prossima.",
                        {"id": {"type": "integer"}, "data": _DATE, "giorni": {"type": "integer", "description": "In alternativa alla data: quanti giorni dopo (di base 7)"}},
                        ["id"])},
        "evento_elimina": {
            "admin": True, "confirm": True, "run": _tool_event_delete, "summary": _summary_event_delete,
            "spec": _fn("evento_elimina", "Elimina definitivamente un evento. Se va solo nascosto, usa evento_modifica pubblicato=false.",
                        {"id": {"type": "integer"}}, ["id"])},
    })

SITE_PROMPT += ("\n\nEVENTI: il sito ha anche la pagina Eventi & novità con due tipi: SERATE (feste, musica, serate a tema) e "
                "APPUNTAMENTI GOLOSI (una proposta di cucina legata a una data, es. 'Venerdì Galletto': il piatto entra da solo nel "
                "menu in quei giorni). Prima di creare un evento chiama eventi_leggi: se esiste già uno uguale o simile, anche passato "
                "o nascosto, chiedi all'utente se vuole ripeterlo per la nuova data (evento_duplica), ripubblicarlo/modificarlo "
                "(evento_modifica) o crearne uno nuovo. Se l'utente allega una foto all'evento, metti usa_foto_allegata=true. "
                "Calcola tu la data esatta (AAAA-MM-GG) da espressioni come 'venerdì prossimo' partendo dalla data di oggi. "
                "ALLERGENI: se l'utente chiede di metterli leggendo gli ingredienti, deducili tu dalla descrizione, usando solo i "
                "14 nomi del sito: panino, pane, focaccia, pasta, impanature, farina = Glutine; formaggi, burro, panna, latte = Latte; "
                "maionese e salse per burger = Uova e Senape; salsa barbecue = Senape; noci, nocciole, mandorle, pistacchi = "
                "Frutta a guscio; pesce, acciughe, tonno = Pesce; gamberi = Crostacei; vino, aceto, insaccati = possibili Solfiti. "
                "Salta i piatti di cui non conosci gli ingredienti (non mandare modifiche vuote) e alla fine ricorda all'utente "
                "di verificarli con la cucina.")
