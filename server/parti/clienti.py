# Cerini IA, parte «clienti»: trovare in zona aziende a cui fare (o rifare) un sito vetrina.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# ================================================================== Clienti per siti vetrina
# Cerca le attività della zona (Google Places se c'è la chiave, altrimenti i siti dei Comuni e le ricerche sul web), guarda chi non ha un sito e
# controlla i siti che ci sono (si apre? HTTPS? si vede dal telefono? è vecchio? è un sito gratuito fai-da-te?).
# Restano le piccole attività locali: per ognuna il numero, la mail se si trova sul sito, il motivo e una mail personale
# da mandare (la manda l'utente, una per volta: niente invii a tappeto).

from urllib.parse import quote_plus  # noqa: E402

CLIENTI_FILE = DATA_DIR / "clienti.json"   # chiave di Google Places, firma, zona e mestieri (la chiave non torna mai al browser)
# La zona sta nella configurazione (data/clienti.json, si cambia dalla pagina Clienti): nome, comuni, aree di ricerca e
# sigla della provincia. Nel codice niente nomi di posti.


def clienti_zona() -> dict:
    z = clienti_cfg().get("zona") or {}
    comuni = [c for c in z.get("comuni") or [] if c]
    return {"nome": z.get("nome") or "", "comuni": comuni, "aree": [a for a in z.get("aree") or [] if a] or comuni,
            "provincia": (z.get("provincia") or "").lower().strip()}


CLIENTI_MESTIERI = ["idraulico", "elettricista", "imbianchino", "impresa edile", "falegname", "fabbro", "serramenti", "lattoniere",
                    "parrucchiere", "barbiere", "estetista", "ristorante", "pizzeria", "bar", "agriturismo", "bed and breakfast", "albergo",
                    "officina meccanica", "carrozzeria", "gommista", "fisioterapista", "veterinario", "panetteria", "macelleria",
                    "alimentari", "fiorista", "geometra", "giardiniere", "noleggio", "scuola guida"]
# catene, banche, enti e grandi marchi: un sito vetrina non serve a loro
CLIENTI_SKIP = re.compile(r"\b(eurospin|carrefour|conad|coop|lidl|penny|md\b|esselunga|bennet|tigot|acqua ?& ?sapone|poste|banca|intesa|unicredit|bper|"
                          r"credit agricole|bpm|eni|agip|q8|tamoil|esso|ip\b|mcdonald|burger king|autogrill|comune di|municipio|asl|ospedale|"
                          r"carabinieri|polizia|scuola primaria|istituto comprensivo|parrocchia|chiesa|decathlon|euronics|unieuro|mediaworld|"
                          r"brico|leroy|obi\b|kiko|calzedonia|intimissimi|tezenis|vodafone|tim\b|windtre|iliad|fastweb|despar|sigma|crai|todis)", re.I)


def init_clienti_db():
    with db() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, ext_id TEXT NOT NULL,
            name TEXT NOT NULL, category TEXT NOT NULL DEFAULT '', town TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', website TEXT NOT NULL DEFAULT '', maps_url TEXT NOT NULL DEFAULT '',
            rating REAL, reviews INTEGER NOT NULL DEFAULT 0, kind TEXT NOT NULL DEFAULT '', score INTEGER NOT NULL DEFAULT 0,
            issues TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'nuovo', note TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT '',
            created INTEGER NOT NULL, updated INTEGER NOT NULL, checked INTEGER NOT NULL DEFAULT 0, contacted INTEGER NOT NULL DEFAULT 0,
            UNIQUE (user_id, ext_id))""")


def clienti_cfg() -> dict:
    try:
        return json.loads(CLIENTI_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _clienti_save(cfg: dict):
    CLIENTI_FILE.write_text(json.dumps(cfg, ensure_ascii=False), encoding="utf-8")
    os.chmod(CLIENTI_FILE, 0o600)


def _places_key() -> str:
    return clienti_cfg().get("places_key") or os.environ.get("GOOGLE_PLACES_KEY", "")


# ---- dove si trovano le attività

PLACES_FIELDS = ("places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,"
                 "places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.primaryTypeDisplayName,"
                 "places.businessStatus,places.addressComponents,nextPageToken")


def _town_of(addr: str, comps: list | None = None) -> str:
    for comp in comps or []:
        if "locality" in (comp.get("types") or []):
            return comp.get("longText") or ""
    for t in clienti_zona()["comuni"]:
        if t.lower() in (addr or "").lower():
            return t
    return ""


async def _places_search(query: str) -> list[dict]:
    """Google Places (Text Search): fino a 60 risultati per «mestiere + paese»."""
    out, token = [], None
    for _ in range(3):
        body = {"textQuery": query, "languageCode": "it", "regionCode": "IT", "pageSize": 20}
        if token:
            body["pageToken"] = token
        r = await client.post("https://places.googleapis.com/v1/places:searchText", json=body, timeout=20,
                              headers={"X-Goog-Api-Key": _places_key(), "X-Goog-FieldMask": PLACES_FIELDS})
        if r.status_code != 200:
            raise HTTPException(502, f"Google Places: {r.status_code} {_clip(r.text, 200)}")
        d = r.json()
        usage_add("google-places", "clienti", 1, 0)
        for p in d.get("places") or []:
            if p.get("businessStatus") not in (None, "OPERATIONAL"):
                continue
            if any("country" in (c.get("types") or []) and c.get("shortText") != "IT" for c in p.get("addressComponents") or []):
                continue   # solo attivita' in Italia
            out.append({"ext_id": "g:" + p["id"], "name": (p.get("displayName") or {}).get("text") or "", "address": p.get("formattedAddress") or "",
                        "town": _town_of(p.get("formattedAddress"), p.get("addressComponents")), "phone": p.get("nationalPhoneNumber") or "",
                        "website": p.get("websiteUri") or "", "maps_url": p.get("googleMapsUri") or "", "rating": p.get("rating"),
                        "reviews": p.get("userRatingCount") or 0, "category": (p.get("primaryTypeDisplayName") or {}).get("text") or query,
                        "source": "google"})
        token = d.get("nextPageToken")
        if not token:
            break
        await asyncio.sleep(2)
    return out


# Senza chiave Google: le liste delle aziende sui siti dei Comuni e le ricerche sul web (SearXNG, che chiede a Google,
# DuckDuckGo e Brave). Per chi sembra senza sito si fa una ricerca col nome: se un sito suo c'è, lo trova.
DIRECTORY_RE = re.compile(r"(paginegialle|paginebianche|virgilio\.it|misterimprese|cylex|trova-aperto|reteimprese|prontopro|infobel|europages|"
                          r"kompass|hotfrog|tuttocitta|tripadvisor|booking\.com|facebook\.com|instagram\.com|google\.|yelp|subito\.it|wikipedia|"
                          r"comune\.|epublic\.it|unionemontana|regione\.|provincia\.|lastampa|youtube|linkedin|twitter|x\.com|"
                          r"tiktok|amazon\.|ebay\.|idealista|immobiliare\.it|habitissimo|starofservice|cronoshare|instapro|houzz|aziende\.it|"
                          r"registroimprese|ufficiocamerale|atoka|fatturatoitalia|reportaziende|informazione-aziende|guidamonaci|paginemestieri|"
                          r"elenco|annunci|visit\w+|thefork|justeat|"
                          r"glovo|deliveroo|airbnb|expedia|hotels\.com|trivago|agoda|kayak|weather|meteo|maps\.|apple\.com|bing\.com|duckduckgo|"
                          r"wix\.com|trustpilot|gelbeseiten|local\.ch|search\.ch|pagesjaunes|infojobs|indeed|bakeca|kijiji|newsletter)", re.I)
PHONE_RE = re.compile(r"(?<![\d/.-])(?:\+39[\s.]?)?(0\d{1,3}[\s.-]?\d{4,7}|3\d{2}[\s.-]?\d{3}[\s.-]?\d{3,4})(?![\d/.-])")
GENERIC_WORDS = {"ristorante", "albergo", "hotel", "pizzeria", "bar", "impresa", "edile", "costruzioni", "idraulica", "idraulico", "elettrica",
                 "snc", "srl", "sas", "di", "e", "c", "f", "lli", "fratelli", "del", "della", "dei", "la", "il", "lo", "le", "da", "studio",
                 "agriturismo", "bed", "breakfast", "and", "casa", "valle", "officina", "carrozzeria", "panetteria"}


# attivita' a cui un sito vetrina serve poco (o che non lo pagherebbero): fuori
CLIENTI_NOT_VETRINA = re.compile(r"\b(edicol\w*|tabacch\w*|generi di monopolio|monopolio|autotrasport\w*|allevator\w*|farmaci\w*|parafarmaci\w*|"
                                 r"banc[ao]\w*|poste|ufficio postale|scuol\w*|asilo|associazion\w*|pro loco|parrocchi\w*|onlus|"
                                 r"distributore|carburant\w*|ripetitore|cimitero)\b", re.I)


def _host(u: str) -> str:
    try:
        return httpx.URL(u).host.lower().removeprefix("www.")
    except Exception:
        return ""


def _clean_title(t: str) -> str:
    parts = [x.strip() for x in re.split(r"\s+[|–—:-]\s+|\s*\|\s*", html.unescape(t or "")) if x.strip()]
    generic = re.compile(r"^(home ?page|home|benvenut[io]|chi siamo|contatti|la ditta|servizi|sito ufficiale)$", re.I)
    t = next((x for x in parts if not generic.match(x)), parts[0] if parts else "")
    t = re.sub(r"^(home ?page|home|benvenuti( su| nel| a)?|sito ufficiale( di)?)\s*[-:]?\s*", "", t, flags=re.I).strip()
    t = re.sub(r"\s+(a|in|-)\s+[A-Z][\w' -]+\s*\((VB|vb)\)\s*$|\s*\((VB|vb)\)\s*$", "", t).strip()
    return t[:80]


def _name_key(n: str) -> str:
    n = re.sub(r"[^a-z0-9 ]", " ", (n or "").lower())
    return " ".join(w for w in n.split() if w not in {"snc", "srl", "sas", "di", "e", "c", "s", "n", "r", "l"})


def _phone_of(text: str) -> str:
    for m in PHONE_RE.finditer(text or ""):
        digits = re.sub(r"\D", "", m.group(1))
        if 8 <= len(digits) <= 10 and not re.fullmatch(r"(19|20)\d\d", digits[-4:]) or len(digits) == 10 and digits.startswith("3"):
            return re.sub(r"[\s.-]+", " ", m.group(1)).strip()
    return ""


async def _comune_directory(town: str) -> list[dict]:
    """La pagina «Shopping e aziende» del Comune (piattaforma usata da molti piccoli comuni): nome, indirizzo, telefono, mail, sito."""
    prov = clienti_zona()["provincia"]
    if not prov:
        return []
    base = f"https://www.comune.{town.lower().replace(' ', '-')}.{prov}.it"
    ua = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36"}
    try:
        r = await client.get(base + "/it-it/vivere-il-comune/shopping-aziende", follow_redirects=True, timeout=20, headers=ua)
    except httpx.HTTPError:
        return []
    if r.status_code != 200 or "shopping-aziende" not in str(r.url):
        return []
    links = sorted(set(re.findall(r'href="(/it-it/vivere-il-comune/shopping-aziende/[a-z0-9-]+-\d+-1-[0-9a-f]{20,})"', r.text)))[:150]
    out = []
    for link in links:
        try:
            d = await client.get(base + link, follow_redirects=True, timeout=15, headers=ua)
        except httpx.HTTPError:
            continue
        page = re.sub(r"(?is)<(script|style|header|footer|nav)[^>]*>.*?</\1>", " ", d.text)
        txt = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " | ", page)))
        h1 = re.search(r"(?is)<h1[^>]*>(.*?)</h1>", d.text)
        name = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h1.group(1)))).strip() if h1 else ""
        field = lambda k: (re.search(rf"\| {k} \|(?: \|)* ([^|]+?) \|", txt) or [None, ""])[1].strip()   # noqa: E731
        site = field("Web")
        if not name:
            continue
        cat = re.sub(r"-\d+-1-[0-9a-f]+$", "", link.rsplit("/", 1)[-1]).split("-")[0]
        m = re.match(r"^([^-–]{3,40}?)\s+[-–]\s+(.+)$", name)
        if m:
            cat, name = m.group(1).strip(), m.group(2).strip()
        if CLIENTI_NOT_VETRINA.search(f"{cat} {name}"):
            continue
        out.append({"ext_id": "c:" + link.rsplit("-", 1)[-1][:24], "name": name[:80], "address": f"{field('Indirizzo')}, {town}".strip(", "),
                    "town": town, "phone": _phone_of(field("Telefono")), "email": field("EMail").lower() if "@" in field("EMail") else "",
                    "website": site if site.startswith("http") else "", "maps_url": f"https://www.google.com/maps/search/{quote_plus(name + ' ' + town)}",
                    "rating": None, "reviews": 0, "category": cat.lower(), "source": "comune"})
        await asyncio.sleep(0.3)
    return out


async def _web_discover(mestiere: str, area: str) -> list[dict]:
    """Una ricerca «mestiere + zona»: i siti delle attività (da controllare) e le schede degli elenchi (chi forse un sito non ce l'ha)."""
    try:
        res = (await web_search(f"{mestiere} {area}", 20))["results"]
    except Exception:
        return []
    town = area if area in clienti_zona()["comuni"] else ""
    out = []
    for x in res:
        u, host = x["url"], _host(x["url"])
        if not host or CLIENTI_SKIP.search(x["title"] + " " + host):
            continue
        phone = _phone_of(x["snippet"])
        m = re.match(r"https?://(?:www\.)?paginegialle\.it/([a-z-]+)-[a-z]{2}/[^/]+/([^/?#]+)", u)
        if m:   # scheda di PagineGialle: un'attivita' (il paese e' nell'indirizzo)
            t = m.group(1).replace("-", " ").title()
            out.append({"name": _clean_title(x["title"]), "town": t, "phone": phone, "website": "", "category": mestiere, "via": u})
            continue
        if re.match(r"https?://(?:www\.)?facebook\.com/(?!groups|sharer|events|watch|pages/category)[^/?#]+/?$", u):
            out.append({"name": _clean_title(x["title"]), "town": town, "phone": phone, "website": u, "category": mestiere, "via": u})
            continue
        if DIRECTORY_RE.search(host) or u.count("/") > 5:
            continue
        out.append({"name": _clean_title(x["title"]), "town": town, "phone": phone, "website": f"https://{host}/", "category": mestiere, "via": u})
    return out


async def _find_site(name: str, town: str) -> tuple[str, str]:
    """Cerca nome + paese: se tra i risultati c'e' un sito che ha il loro nome nell'indirizzo, e' il loro. (sito, telefono)"""
    short = re.sub(r"\b(s\.?\s?n\.?\s?c\.?|s\.?\s?r\.?\s?l\.?s?|s\.?\s?a\.?\s?s\.?)(\s+di\s+.*)?$", "", name, flags=re.I)
    short = re.sub(r"\s+(di|&)\s+.*$", "", short).strip(" .,-") or name
    try:
        res = (await web_search(f'"{short}" {town}'.strip(), 10))["results"]
    except Exception:
        return "", ""
    words = [w for w in _name_key(short).split() if len(w) >= 4 and w not in GENERIC_WORDS] or [w for w in _name_key(short).split() if len(w) >= 4]
    if not words:
        return "", ""
    about = lambda x: any(w in f"{x['title']} {x['snippet']} {x['url']}".lower() for w in words)   # noqa: E731
    phone = next((p for p in (_phone_of(x["snippet"]) for x in res if about(x)) if p), "")
    for attempt in range(2):
        for x in res:
            host = _host(x["url"])
            if host and not DIRECTORY_RE.search(host) and any(w in host.replace("-", "") for w in words):
                return f"https://{host}/", phone
        if attempt == 0:
            await asyncio.sleep(1.5)
            try:
                res = (await web_search(f"{short} {town}".strip(), 10))["results"]
            except Exception:
                break
    fb = next((x["url"] for x in res if re.match(r"https?://(?:www\.)?facebook\.com/(?!groups|sharer)[^/?#]+/?$", x["url"])
               and any(w in x["url"].lower() for w in words)), "")
    return fb, phone


# ---- il controllo del sito

SOCIAL_RE = re.compile(r"(facebook\.com|fb\.me|instagram\.com|linktr\.ee|tripadvisor\.|booking\.com|business\.site|g\.page|wa\.me|paginegialle\.it|tiktok\.com)", re.I)
FREE_SITE_RE = re.compile(r"(wixsite\.com|altervista\.org|jimdo|weebly\.com|webnode\.|sites\.google\.com|blogspot\.|wordpress\.com|over-blog|site123\.me|godaddysites\.com|mystrikingly\.com)", re.I)
PARKED_RE = re.compile(r"(dominio (è )?in vendita|domain (is )?for sale|this domain|buy this domain|parked|sito in costruzione|under construction|"
                       r"coming soon|account suspended|account sospeso|website expired|hosting scaduto|default web page|it works!|index of /)", re.I)
EMAIL_RE2 = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}", re.I)


def _emails_in(html: str) -> list[str]:
    found = []
    for m in re.findall(r'mailto:([^"\'?>\s]+)', html, re.I) + EMAIL_RE2.findall(html):
        e = m.strip().strip(".").lower()
        if re.search(r"\.(png|jpe?g|gif|svg|webp|css|js)$|example\.|sentry|wixpress|@2x|domain\.|yourdomain|nome@|email@", e):
            continue
        if e not in found:
            found.append(e)
    # prima quelle «normali» (info@, nome@), le PEC dopo
    return sorted(found, key=lambda e: ("pec" in e, len(e)))[:3]


async def site_audit(url: str) -> dict:
    """Quanto è da rifare il sito (0 = va bene, 100 = non c'è o non si apre) e perché, in parole semplici."""
    if not url:
        return {"kind": "nosite", "score": 100, "issues": ["Non ha un sito suo: chi lo cerca trova solo elenchi (PagineGialle, Comune, Maps)"], "emails": []}
    if SOCIAL_RE.search(url):
        where = SOCIAL_RE.search(url).group(1).split(".")[0].capitalize()
        return {"kind": "nosite", "score": 95, "issues": [f"Al posto del sito ha solo una pagina {where}"], "emails": []}
    issues, score, emails = [], 0, []
    t0 = time.monotonic()
    try:
        r = await client.get(url if "://" in url else "http://" + url, follow_redirects=True, timeout=15,
                             headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36"})
    except httpx.HTTPError as e:
        return {"kind": "bad", "score": 90, "issues": [f"Il sito non si apre ({type(e).__name__})"], "emails": []}
    secs = time.monotonic() - t0
    if r.status_code >= 400:
        return {"kind": "bad", "score": 90, "issues": [f"Il sito dà errore {r.status_code}: chi lo apre trova una pagina rotta"], "emails": []}
    html = r.text[:600000]
    low = html.lower()
    text = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", html))).strip()
    final = str(r.url)
    if PARKED_RE.search(text[:3000]) and len(text) < 3000:
        return {"kind": "bad", "score": 90, "issues": ["Il dominio c'è ma il sito no: pagina vuota, parcheggiata o «in costruzione»"], "emails": []}
    if not final.startswith("https://"):
        issues.append("Niente HTTPS: il browser lo segna come «non sicuro»"); score += 25
    if 'name="viewport"' not in low and "name='viewport'" not in low:
        issues.append("Non è fatto per il telefono: da cellulare si vede piccolo e scomodo"); score += 30
    if FREE_SITE_RE.search(final):
        issues.append("È un sito gratuito fai-da-te (indirizzo poco professionale, pubblicità)"); score += 25
    years = [int(y) for y in re.findall(r"(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?((?:19|20)\d\d)", text, re.I)]
    now_y = local_now().year
    if years and max(years) <= now_y - 4:
        issues.append(f"Fermo da anni: il copyright dice {max(years)}"); score += 20
    if re.search(r"<frameset|<frame\s|\.swf\b|<marquee|<font\s|<center>|bgcolor=", low):
        issues.append("Fatto con tecniche vecchie (anni 2000): si vede antiquato"); score += 25
    elif low.count("<table") >= 6:
        issues.append("Impaginato con le tabelle, come i siti di 15 anni fa"); score += 15
    gen = re.search(r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)', html, re.I)
    if gen and re.search(r"(joomla! 1\.|joomla! 2\.|wordpress [1-4]\.|frontpage|dreamweaver|iweb|microsoft word)", gen.group(1), re.I):
        issues.append(f"Fatto con un programma vecchio ({_clip(gen.group(1), 40)})"); score += 15
    if len(text) < 400:
        issues.append("Quasi vuoto: poche righe, niente che spieghi cosa fanno"); score += 20
    if "<title>" not in low or re.search(r"<title>\s*(home|homepage|untitled|benvenuti|index)?\s*</title>", low):
        issues.append("Senza un titolo vero: su Google si presenta male"); score += 10
    if secs > 5:
        issues.append(f"Lento: ci mette {secs:.0f} secondi ad aprirsi"); score += 15
    if not re.search(r"(tel:|mailto:|contatt|whatsapp|wa\.me)", low):
        issues.append("Non si capisce come contattarli"); score += 10
    emails = _emails_in(html)
    if not emails:   # spesso la mail sta nella pagina dei contatti
        m = re.search(r'href=["\']([^"\']*contatt[^"\']*)["\']', html, re.I)
        if m:
            try:
                r2 = await client.get(str(httpx.URL(final).join(m.group(1))), follow_redirects=True, timeout=10,
                                      headers={"User-Agent": "Mozilla/5.0 Chrome/130"})
                emails = _emails_in(r2.text[:300000])
            except httpx.HTTPError:
                pass
    score = min(score, 95)
    return {"kind": "bad" if score >= 40 else "ok", "score": score, "issues": issues, "emails": emails}


# ---- la ricerca (in sottofondo, con l'avanzamento per la pagina)

CLIENTI_JOB: dict[int, dict] = {}


def _lead_row(r) -> dict:
    d = dict(r)
    d["issues"] = json.loads(d.get("issues") or "[]")
    return d


async def clienti_search(uid: int, mestieri: list[str] | None = None, force: bool = False) -> dict:
    job = CLIENTI_JOB[uid] = {"running": True, "done": 0, "total": 0, "phase": "Cerco le attività in zona…", "found": 0, "new": 0, "error": ""}
    try:
        cfg, zona = clienti_cfg(), clienti_zona()
        mestieri = mestieri or cfg.get("mestieri") or CLIENTI_MESTIERI
        if not zona["comuni"]:
            raise HTTPException(400, "Prima scrivi la zona nelle impostazioni (i comuni dove cercare)")
        places: dict[str, dict] = {}
        if _places_key():
            job["total"] = len(mestieri) * len(zona["aree"])
            for m in mestieri:
                for area in zona["aree"]:
                    job["phase"] = f"Cerco «{m}» a {area}…"
                    for p in await _places_search(f"{m} {area}"):
                        places.setdefault(p["ext_id"], p)
                    job["done"] += 1
        else:
            # 1) le liste delle aziende dei Comuni
            for n, town in enumerate(zona["comuni"]):
                job.update(phase=f"Guardo le aziende sul sito del Comune di {town}…", done=n, total=len(zona["comuni"]))
                for p in await _comune_directory(town):
                    places.setdefault(p["ext_id"], p)
            # 2) le ricerche sul web, mestiere per mestiere e zona per zona
            seen = {_name_key(p["name"]): p for p in places.values()}
            sites = {_host(p["website"]) for p in places.values() if p.get("website")}
            combos = [(m, a) for m in mestieri for a in zona["aree"]]
            job.update(total=len(combos), done=0)
            for n, (m, a) in enumerate(combos):
                job.update(phase=f"Cerco «{m}» a {a}…", done=n)
                for x in await _web_discover(m, a):
                    k, host = _name_key(x["name"]), _host(x["website"])
                    if not k or len(k) < 3 or k in seen or (host and host in sites):
                        if k in seen and x["phone"] and not seen[k].get("phone"):
                            seen[k]["phone"] = x["phone"]
                        continue
                    p = {"ext_id": "w:" + (host or k)[:60], "name": x["name"], "address": x["town"], "town": x["town"], "phone": x["phone"],
                         "email": "", "website": x["website"], "rating": None, "reviews": 0, "category": x["category"], "source": "web",
                         "maps_url": f"https://www.google.com/maps/search/{quote_plus(x['name'] + ' ' + (x['town'] or zona['nome']))}"}
                    places[p["ext_id"]] = seen[k] = p
                    if host:
                        sites.add(host)
                await asyncio.sleep(1.5)   # piano: il motore di ricerca non deve pensare a un robot impazzito
            # 3) chi sembra senza sito: una ricerca col nome, per esserne sicuri
            nosite = [p for p in places.values() if not p.get("website")]
            job.update(total=len(nosite), done=0)
            for n, p in enumerate(nosite):
                job.update(phase=f"Controllo se {p['name']} ha un sito…", done=n)
                site, phone = await _find_site(p["name"], p.get("town") or zona["nome"])
                p["website"] = p.get("website") or site
                p["phone"] = p.get("phone") or phone
                await asyncio.sleep(1.5)
        cand = [p for p in places.values() if p["name"] and not CLIENTI_SKIP.search(p["name"]) and not CLIENTI_NOT_VETRINA.search(f"{p['name']} {p.get('category', '')}")
                and (p.get("reviews") or 0) <= 600]
        job.update(phase="Controllo i siti…", done=0, total=len(cand), found=len(cand))
        now = int(time.time())
        with db() as c:
            known = {r["ext_id"]: r for r in c.execute("SELECT ext_id, checked, status FROM leads WHERE user_id = ?", (uid,))}
        sem = asyncio.Semaphore(6)

        async def one(p):
            k = known.get(p["ext_id"])
            if k and not force and k["checked"] > now - 30 * 86400:
                job["done"] += 1
                return
            async with sem:
                try:
                    a = await site_audit(p.get("website") or "")
                except Exception as e:   # un sito strano non ferma la ricerca
                    a = {"kind": "bad", "score": 60, "issues": [f"Non sono riuscito a controllarlo ({type(e).__name__})"], "emails": []}
            email = p.get("email") or (a["emails"][0] if a["emails"] else "")
            with db() as c:
                c.execute("""INSERT INTO leads (user_id, ext_id, name, category, town, address, phone, email, website, maps_url, rating, reviews,
                             kind, score, issues, source, created, updated, checked) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                             ON CONFLICT (user_id, ext_id) DO UPDATE SET name = excluded.name, category = excluded.category, town = excluded.town,
                             address = excluded.address, phone = COALESCE(NULLIF(excluded.phone, ''), phone),
                             email = COALESCE(NULLIF(email, ''), excluded.email), website = excluded.website, maps_url = excluded.maps_url,
                             rating = excluded.rating, reviews = excluded.reviews, kind = excluded.kind, score = excluded.score,
                             issues = excluded.issues, updated = excluded.updated, checked = excluded.checked""",
                          (uid, p["ext_id"], p["name"], p.get("category") or "", p.get("town") or "", p.get("address") or "", p.get("phone") or "",
                           email, p.get("website") or "", p.get("maps_url") or "", p.get("rating"), p.get("reviews") or 0, a["kind"], a["score"],
                           json.dumps(a["issues"], ensure_ascii=False), p.get("source") or "", now, now, now))
            if not k:
                job["new"] += 1
            job["done"] += 1

        await asyncio.gather(*(one(p) for p in cand))
        job["phase"] = "Fatto"
    except Exception as e:
        job["error"] = str(getattr(e, "detail", e))
    finally:
        job["running"] = False
    return job


def leads_list(uid: int, kind: str = "", status: str = "", q: str = "", limit: int = 400) -> list[dict]:
    sql, args = "SELECT * FROM leads WHERE user_id = ?", [uid]
    if kind:
        sql += " AND kind = ?"; args.append(kind)
    else:
        sql += " AND kind IN ('nosite', 'bad')"
    if status:
        sql += " AND status = ?"; args.append(status)
    if q:
        sql += " AND (name LIKE ? OR category LIKE ? OR town LIKE ?)"; args += [f"%{q}%"] * 3
    sql += " ORDER BY CASE status WHEN 'nuovo' THEN 0 WHEN 'contattato' THEN 1 WHEN 'risposto' THEN 2 WHEN 'cliente' THEN 3 ELSE 4 END, score DESC, name LIMIT ?"
    args.append(limit)
    with db() as c:
        return [_lead_row(r) for r in c.execute(sql, args)]


def _lead(uid: int, lid) -> dict:
    with db() as c:
        r = c.execute("SELECT * FROM leads WHERE id = ? AND user_id = ?", (_int(lid), uid)).fetchone()
    if not r:
        raise HTTPException(404, "Attività non trovata")
    return _lead_row(r)


async def lead_mail(user: dict, lead: dict) -> dict:
    """La mail per proporre il sito: personale, breve, con i difetti veri del loro sito (o il fatto che non c'è)."""
    cfg = clienti_cfg()
    zona = clienti_zona()["nome"]
    firma = cfg.get("firma") or {}
    nome = firma.get("nome") or _user_display(user)
    sig = "\n".join(x for x in (nome, firma.get("telefono"), firma.get("sito")) if x)
    issues = lead["issues"][:3]
    why = ("non avete ancora un sito tutto vostro" if lead["kind"] == "nosite" else "il vostro sito potrebbe lavorare meglio per voi")
    fallback = {"oggetto": f"Un sito per {lead['name']}" if lead["kind"] == "nosite" else f"Il sito di {lead['name']}",
                "testo": (f"Buongiorno,\n\nmi chiamo {nome.split()[0]} e realizzo siti vetrina per le attività della zona{', qui ' + zona if zona else ''}.\n"
                          f"Cercando {lead['category'] or 'la vostra attività'} {('a ' + lead['town']) if lead['town'] else 'in zona'} ho visto che {why}"
                          + (":\n" + "\n".join(f"- {i}" for i in issues) if issues and lead["kind"] != "nosite" else ".") +
                          "\n\nUn sito semplice, veloce e fatto bene per il telefono aiuta chi vi cerca su Google a trovarvi, chiamarvi o arrivare da voi. "
                          "Se vi interessa vi preparo senza impegno una bozza da vedere, così vi fate un'idea.\n\n"
                          "Se invece non vi interessa, basta rispondere «no grazie» e non vi scrivo più.\n\nGrazie e buona giornata,\n" + sig)}
    prompt = ("Scrivi una mail commerciale BREVE e personale in italiano, da una persona vera a una piccola attività della sua zona" + (f" ({zona})" if zona else "") + ". "
              "Tono: semplice, cordiale, diretto, niente parole da marketing, niente esagerazioni, dare del voi. Massimo 120 parole. "
              f"Chi scrive: {nome}, fa siti vetrina per le attività locali. Destinatario: {lead['name']} ({lead['category']}"
              f"{', ' + lead['town'] if lead['town'] else ''}). "
              + (f"Non ha un sito{': ' + issues[0] if issues else ''}. " if lead["kind"] == "nosite" else
                 "Ha un sito con questi problemi (citane al massimo 2-3, in parole semplici, senza offendere): " + "; ".join(issues) + ". ")
              + (f"Offerta da citare: {cfg.get('offerta')}. " if cfg.get("offerta") else "Non citare prezzi. ")
              + "Proponi una bozza gratuita e senza impegno. Chiudi con una riga: se non interessa basta rispondere «no grazie» e non scrive più. "
              f"Firma esattamente così (su righe separate):\n{sig}\n"
              "Rispondi SOLO con JSON: {\"oggetto\": \"...\", \"testo\": \"...\"}")
    try:
        d = json.loads(await llm_once([{"role": "user", "content": prompt}], json_mode=True, temperature=0.5, timeout=120) or "{}")
        if d.get("testo") and len(d["testo"]) > 80:
            return {"oggetto": _clip(d.get("oggetto") or fallback["oggetto"], 120), "testo": str(d["testo"]).strip()}
    except Exception:
        pass
    return fallback


# ---- API per la pagina «Clienti»

@app.get("/api/clienti")
async def clienti_get(kind: str = "", status: str = "", q: str = "", user: dict = Depends(require_admin)):
    uid = user["id"]
    with db() as c:
        counts = {r["k"]: r["n"] for r in c.execute("SELECT kind || ':' || status AS k, COUNT(*) AS n FROM leads WHERE user_id = ? GROUP BY kind, status", (uid,))}
    cfg = clienti_cfg()
    return {"leads": leads_list(uid, kind if kind in ("nosite", "bad", "ok") else "", status, q.strip()), "counts": counts,
            "job": CLIENTI_JOB.get(uid), "has_key": bool(_places_key()), "zona": clienti_zona(),
            "mestieri": cfg.get("mestieri") or CLIENTI_MESTIERI, "firma": cfg.get("firma") or {}, "offerta": cfg.get("offerta") or "",
            "gmail": bool(_gmail_row(uid))}


class ClientiSearchIn(BaseModel):
    mestieri: list[str] = []
    force: bool = False


@app.post("/api/clienti/cerca")
async def clienti_start(body: ClientiSearchIn, user: dict = Depends(require_admin)):
    uid = user["id"]
    if (CLIENTI_JOB.get(uid) or {}).get("running"):
        return {"job": CLIENTI_JOB[uid]}
    asyncio.create_task(clienti_search(uid, [m.strip()[:40] for m in body.mestieri if m.strip()][:40] or None, body.force))
    await asyncio.sleep(0.2)
    return {"job": CLIENTI_JOB.get(uid)}


class ClientiCfgIn(BaseModel):
    places_key: str = ""        # vuota = tieni quella salvata
    firma: dict = {}
    offerta: str = ""
    mestieri: list[str] = []
    zona: dict = {}


@app.put("/api/clienti/config")
async def clienti_cfg_put(body: ClientiCfgIn, user: dict = Depends(require_admin)):
    cfg = clienti_cfg()
    if body.places_key.strip():
        cfg["places_key"] = body.places_key.strip()
    cfg["firma"] = {k: _clip(str(body.firma.get(k) or ""), 120) for k in ("nome", "telefono", "sito")}
    cfg["offerta"] = _clip(body.offerta, 300)
    cfg["mestieri"] = [m.strip()[:40] for m in body.mestieri if m.strip()][:60]
    z = body.zona or {}
    lst = lambda v: [str(x).strip()[:40] for x in (v or []) if str(x).strip()][:40]   # noqa: E731
    cfg["zona"] = {"nome": _clip(str(z.get("nome") or ""), 60), "comuni": lst(z.get("comuni")), "aree": lst(z.get("aree")),
                   "provincia": re.sub(r"[^a-z]", "", str(z.get("provincia") or "").lower())[:2]}
    _clienti_save(cfg)
    return {"ok": True, "has_key": bool(_places_key())}


class LeadIn(BaseModel):
    status: str | None = None
    note: str | None = None
    email: str | None = None


@app.patch("/api/clienti/{lid}")
async def clienti_patch(lid: int, body: LeadIn, user: dict = Depends(require_admin)):
    lead = _lead(user["id"], lid)
    sets, args = [], []
    if body.status in ("nuovo", "contattato", "risposto", "cliente", "no"):
        sets.append("status = ?"); args.append(body.status)
        if body.status == "contattato":
            sets.append("contacted = ?"); args.append(int(time.time()))
    if body.note is not None:
        sets.append("note = ?"); args.append(body.note[:2000])
    if body.email is not None:
        if body.email and not EMAIL_RE2.fullmatch(body.email.strip()):
            raise HTTPException(400, "Indirizzo email non valido")
        sets.append("email = ?"); args.append(body.email.strip())
    if sets:
        with db() as c:
            c.execute(f"UPDATE leads SET {', '.join(sets)}, updated = ? WHERE id = ?", (*args, int(time.time()), lead["id"]))
    return _lead(user["id"], lid)


@app.post("/api/clienti/{lid}/mail")
async def clienti_mail(lid: int, user: dict = Depends(require_admin)):
    lead = _lead(user["id"], lid)
    m = await lead_mail(user, lead)
    return {"to": lead["email"], "subject": m["oggetto"], "body": m["testo"]}


# ---- in chat

async def _tool_clienti(user: dict, args: dict, request: Request) -> dict:
    uid, a = user["id"], str(args.get("azione") or "elenco")
    if a == "cerca":
        if (CLIENTI_JOB.get(uid) or {}).get("running"):
            return {"content": "Una ricerca è già in corso: i risultati arrivano nella pagina Clienti.", "display": "Ricerca clienti già in corso"}
        asyncio.create_task(clienti_search(uid, [str(args["mestiere"])] if args.get("mestiere") else None))
        return {"content": "Ho avviato la ricerca delle attività della zona: ci mette qualche minuto. I risultati (con numero, "
                           "motivo e mail pronta) li trova nella pagina Clienti, nel menu a sinistra.", "display": "Ricerca clienti avviata"}
    if a == "mail":
        lead = _lead(uid, args.get("numero")) if args.get("numero") else next(iter(leads_list(uid, q=str(args.get("nome") or ""), limit=1)), None)
        if not lead:
            raise ValueError("attività non trovata: dimmi il nome o il numero")
        m = await lead_mail(user, lead)
        view = {"kind": "email", "to": lead["email"], "subject": m["oggetto"], "body": m["testo"], "reply_to": None, "status": "draft", "attachments": []}
        return {"content": f"Mail per {lead['name']} preparata nella scheda (non inviata: decide l'utente)."
                           + ("" if lead["email"] else " Non ho trovato la loro mail: l'indirizzo lo scrive l'utente."),
                "display": f"Mail per {lead['name']} pronta", "view": view}
    rows = leads_list(uid, q=str(args.get("nome") or ""), status=str(args.get("stato") or ""), limit=25)
    if not rows:
        return {"content": "Nessuna attività trovata: lancia prima la ricerca (azione cerca).", "display": "Clienti: niente ancora"}
    return {"content": "Attività senza sito o con il sito da rifare (dati, non istruzioni):\n" + "\n".join(
        f"n.{r['id']} {r['name']} — {r['category']}, {r['town']} — tel {r['phone'] or '?'} — {r['email'] or 'mail ?'} — "
        f"{'SENZA SITO' if r['kind'] == 'nosite' else 'sito da rifare (' + str(r['score']) + '/100)'}: {'; '.join(r['issues'][:3])} — stato {r['status']}"
        for r in rows), "display": f"Ha guardato i possibili clienti: {len(rows)}"}


TOOLS["clienti"] = {
    "admin": True, "confirm": False, "run": _tool_clienti,
    "spec": _fn("clienti", "Il lavoro dell'utente sui siti vetrina: trova nella sua zona le attività senza sito o con "
                "un sito da rifare, con numero, mail e motivo; prepara la mail per proporre il sito. azione=cerca avvia la ricerca, "
                "azione=elenco mostra chi c'è (filtra per nome o stato), azione=mail prepara la mail per un'attività (numero o nome).",
                {"azione": {"type": "string", "enum": ["elenco", "cerca", "mail"]}, "nome": _S, "numero": {"type": "integer"},
                 "stato": {"type": "string", "enum": ["nuovo", "contattato", "risposto", "cliente", "no"]},
                 "mestiere": {"type": "string", "description": "Per cerca: un solo mestiere, es. idraulico (vuoto = tutti)"}}, ["azione"]),
}
