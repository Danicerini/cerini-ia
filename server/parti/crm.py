# Cerini IA, parte «crm»: i ticket del CRM di lavoro (vtiger / OpenCRM), SOLO IN LETTURA, per il consuntivo.
# Non si importa da sola: app.py la carica nel proprio spazio di nomi (vedi PARTI in fondo ad app.py),
# quindi qui si usano direttamente i nomi definiti in app.py e nelle parti caricate prima.
# ruff: noqa: F821

# ================================================================== CRM
# Indirizzo, utente e chiave di accesso stanno nel .env del server (CRM_URL, CRM_USER, CRM_KEY), mai nel codice.
# Si usano solo le operazioni di lettura dell'API webservice: qualunque altra viene rifiutata qui, prima di partire.

import hashlib
import html as _html

CRM_URL = os.environ.get("CRM_URL", "").rstrip("/")
CRM_USER = os.environ.get("CRM_USER", "")
CRM_KEY = os.environ.get("CRM_KEY", "")
CRM_READ_OPS = {"getchallenge", "login", "query", "retrieve", "describe", "listtypes"}
# campi del modulo ticket (personalizzati nel CRM dell'azienda): soluzione, tempo, cliente
CRM_SOLUTION = os.environ.get("CRM_SOLUTION_FIELD", "cf_acf_rtf_soluzione_ticket")


def crm_on() -> bool:
    return bool(CRM_URL and CRM_USER and CRM_KEY)


async def _crm(op: str, **p) -> dict | list:
    if op not in CRM_READ_OPS:
        raise ValueError(f"operazione CRM non permessa: {op} (il collegamento è solo in lettura)")
    url = CRM_URL + "/webservice.php"
    try:
        if op == "login":
            r = await client.post(url, data={"operation": op, **p}, timeout=20)
        else:
            r = await client.get(url, params={"operation": op, **p}, timeout=20)
        d = r.json()
    except (httpx.HTTPError, ValueError):
        raise ValueError("il CRM non risponde")
    if not d.get("success"):
        raise ValueError("CRM: " + str((d.get("error") or {}).get("message") or "errore"))
    return d["result"]


async def _crm_login() -> tuple[str, str]:
    tok = (await _crm("getchallenge", username=CRM_USER))["token"]
    r = await _crm("login", username=CRM_USER, accessKey=hashlib.md5((tok + CRM_KEY).encode()).hexdigest())
    return r["sessionName"], r["userId"]


def _crm_text(h: str, n: int = 400) -> str:
    h = re.sub(r"(?is)<(style|head|script)[^>]*>.*?</\1>", " ", h or "")
    t = re.sub(r"\s+", " ", _html.unescape(re.sub(r"<[^>]+>", " ", h))).strip()
    return t[:n]


def _crm_q(v: str) -> str:
    return re.sub(r"[^0-9x:\- ]", "", str(v))   # nelle query vanno solo id e date


async def crm_day(day: str) -> list[dict]:
    """I ticket su cui l'utente ha lavorato quel giorno: modificati da lui, presi in carico o chiusi, commentati, o con un
    tempo registrato. Per ognuno: numero, cliente, titolo, stato, soluzione, i suoi commenti del giorno, il tempo registrato."""
    s, uid = await _crm_login()
    q = lambda sql: _crm("query", sessionName=s, query=sql)
    prev = (datetime.strptime(day, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
    t0, t1 = f"{prev} 22:00:00", f"{day} 23:59:59"   # margine per l'ora del server del CRM
    fields = ("ticket_no,ticket_title,ticketstatus,parent_id,modifiedby,modifiedtime,data_presa_in_carico,data_chiusura_ticket,"
              f"tipo_intervento,{CRM_SOLUTION}")
    tickets = {t["id"]: t for t in await q(f"SELECT {fields} FROM HelpDesk WHERE assigned_user_id='{_crm_q(uid)}' "
                                           f"AND modifiedtime>='{t0}' AND modifiedtime<='{t1}' LIMIT 100;")}
    comments = await q(f"SELECT commentcontent,related_to,createdtime FROM ModComments WHERE assigned_user_id='{_crm_q(uid)}' "
                       f"AND createdtime>='{t0}' AND createdtime<='{t1}' LIMIT 100;")
    try:
        times = await q(f"SELECT helpdeskid,sum_time,working_hours,description,time_start,time_end FROM GreenTimeControl "
                        f"WHERE assigned_user_id='{_crm_q(uid)}' AND date_start='{_crm_q(day)}' LIMIT 100;")
    except ValueError:
        times = []   # modulo dei tempi assente in questo CRM
    said, spent = {}, {}
    for c in comments:
        said.setdefault(c.get("related_to"), []).append(_crm_text(c.get("commentcontent"), 300))
    for t in times:
        if t.get("helpdeskid"):
            spent[t["helpdeskid"]] = spent.get(t["helpdeskid"], 0.0) + float(t.get("sum_time") or t.get("working_hours") or 0)
    for tid in (set(said) | set(spent)) - set(tickets):   # ticket commentati o con tempo ma non (più) assegnati a lui
        if str(tid).startswith("17x"):
            try:
                tickets[tid] = await _crm("retrieve", sessionName=s, id=tid)
            except ValueError:
                pass
    keep = {tid: t for tid, t in tickets.items()
            if tid in said or tid in spent or t.get("modifiedby") == uid
            or day in (t.get("data_presa_in_carico"), t.get("data_chiusura_ticket"))}
    accounts = {str(t.get("parent_id")) for t in keep.values() if t.get("parent_id")}
    names = {}
    if accounts:
        ids = ",".join(f"'{_crm_q(a)}'" for a in accounts)
        names = {a["id"]: a["accountname"] for a in await q(f"SELECT accountname FROM Accounts WHERE id IN ({ids});")}
    out = []
    for tid, t in keep.items():
        out.append({"ticket": t.get("ticket_no", ""), "cliente": names.get(t.get("parent_id"), ""), "titolo": t.get("ticket_title", ""),
                    "stato": t.get("ticketstatus", ""), "tipo": t.get("tipo_intervento", ""),
                    "preso": t.get("data_presa_in_carico") == day, "chiuso": t.get("data_chiusura_ticket") == day,
                    "soluzione": _crm_text(t.get(CRM_SOLUTION), 300), "commenti": said.get(tid, []),
                    "ore": round(spent.get(tid, 0.0), 2)})
    return sorted(out, key=lambda x: x["ticket"])


def crm_day_text(rows: list[dict]) -> str:
    lines = []
    for r in rows:
        bits = [f"{r['ticket']} | cliente: {r['cliente'] or '?'} | {r['titolo']} | stato: {r['stato']}"]
        if r["preso"]:
            bits.append("preso in carico quel giorno")
        if r["chiuso"]:
            bits.append("chiuso quel giorno")
        if r["ore"]:
            bits.append(f"tempo registrato nel CRM: {r['ore']} ore")
        if r["soluzione"]:
            bits.append(f"soluzione: {r['soluzione']}")
        if r["commenti"]:
            bits.append("suoi commenti quel giorno: " + " / ".join(r["commenti"]))
        lines.append("- " + " | ".join(bits))
    return "\n".join(lines)
