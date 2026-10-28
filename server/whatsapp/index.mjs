// Aura e WhatsApp: collega il WhatsApp dell'utente come «dispositivo collegato» (con il QR, come WhatsApp Web),
// tiene la rubrica (solo nomi e numeri) e invia messaggi e file quando Aura glielo chiede.
// Non legge e non salva i messaggi. Ascolta solo su 127.0.0.1 e risponde solo a chi ha il token di Aura (WA_TOKEN).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers } from 'baileys';
import QRCode from 'qrcode';
import P from 'pino';

const PORT = Number(process.env.WA_PORT || 8091);
const TOKEN = process.env.WA_TOKEN || '';
const DIR = process.env.WA_DIR || './wa-data';
const AUTH = path.join(DIR, 'auth');
const CONTACTS = path.join(DIR, 'contacts.json');
const MAX_FILE = 60 * 1024 * 1024;

let sock = null;
let qrTries = 0;
let state = { status: 'unlinked', qr: null, me: null, error: null };
let contacts = {};
try { contacts = JSON.parse(fs.readFileSync(CONTACTS, 'utf8')); } catch {}

// ---- rubrica: per ogni contatto il numero (jid), l'eventuale lid e il nome salvato sul telefono
let saveTimer = null;
function saveContacts() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { fs.writeFileSync(CONTACTS, JSON.stringify(contacts)); } catch {} }, 1500);
}
function addContacts(list) {
  for (const c of list || []) {
    if (!c?.id || c.id.endsWith('@g.us') || c.id.endsWith('@broadcast') || c.id.endsWith('@newsletter')) continue;
    const pn = c.phoneNumber || (c.id.endsWith('@s.whatsapp.net') ? c.id : null);
    const lid = c.lid || (c.id.endsWith('@lid') ? c.id : null);
    const key = Object.keys(contacts).find((k) => (pn && contacts[k].jid === pn) || (lid && contacts[k].lid === lid)) || pn || lid;
    const old = contacts[key] || {};
    contacts[key] = { jid: pn || old.jid || null, lid: lid || old.lid || null, name: c.name || old.name || null,
      notify: c.notify || c.verifiedName || old.notify || null };
  }
  saveContacts();
}
function wipe() {
  try { fs.rmSync(AUTH, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(CONTACTS, { force: true }); } catch {}
  contacts = {};
}
const linkedBefore = () => { try { return JSON.parse(fs.readFileSync(path.join(AUTH, 'creds.json'), 'utf8')).registered === true; } catch { return false; } };

// ---- collegamento
async function start() {
  if (sock) return;
  fs.mkdirSync(AUTH, { recursive: true });
  const { state: auth, saveCreds } = await useMultiFileAuthState(AUTH);
  let version;
  try { ({ version } = await fetchLatestBaileysVersion()); } catch {}
  state = { ...state, status: linkedBefore() ? 'connecting' : 'starting', error: null };
  sock = makeWASocket({ auth, version, logger: P({ level: 'silent' }), browser: Browsers.appropriate('Aura'),
    markOnlineOnConnect: false,        // le notifiche devono continuare ad arrivare sul telefono
    syncFullHistory: false, generateHighQualityLinkPreview: false });
  const me = sock;
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (u) => {
    if (me !== sock) return;
    if (u.qr) {
      qrTries += 1;
      if (qrTries > 6) { stop('unlinked'); return; }   // dopo un paio di minuti senza scansione si smette (si riparte dal tasto)
      state = { status: 'qr', qr: await QRCode.toDataURL(u.qr, { margin: 1, width: 300 }), me: null, error: null };
    }
    if (u.connection === 'open') {
      qrTries = 0;
      state = { status: 'connected', qr: null, me: { id: (sock.user?.id || '').split(':')[0].split('@')[0], name: sock.user?.name || '' }, error: null };
    }
    if (u.connection === 'close') {
      const code = u.lastDisconnect?.error?.output?.statusCode;
      sock = null;
      if (code === DisconnectReason.loggedOut) { wipe(); state = { status: 'unlinked', qr: null, me: null, error: 'Dissociato dal telefono' }; return; }
      if (state.status === 'unlinked') return;
      state = { ...state, status: 'connecting', error: u.lastDisconnect?.error?.message || null };
      setTimeout(() => start().catch((e) => { state = { ...state, error: String(e) }; }), code === DisconnectReason.restartRequired ? 200 : 4000);
    }
  });
  sock.ev.on('messaging-history.set', ({ contacts: cs }) => addContacts(cs));   // dalla cronologia si prende solo la rubrica
  sock.ev.on('contacts.upsert', addContacts);
  sock.ev.on('contacts.update', addContacts);
}
function stop(status) {
  const s = sock; sock = null; qrTries = 0;
  state = { status, qr: null, me: null, error: null };
  try { s?.end(undefined); } catch {}
}

// ---- rubrica e invio
const digits = (s) => String(s || '').replace(/\D/g, '');
function toJid(to) {
  if (/@(s\.whatsapp\.net|lid)$/.test(to)) return to;
  let n = digits(to);
  if (n.startsWith('00')) n = n.slice(2);
  if (/^(3\d{8,9}|0\d{5,10})$/.test(n)) n = '39' + n;   // numeri italiani scritti senza prefisso
  return n.length >= 8 ? `${n}@s.whatsapp.net` : null;
}
function searchContacts(q) {
  const s = String(q || '').toLowerCase().trim();
  const d = digits(s);
  const all = Object.values(contacts).filter((c) => c.jid || c.lid);
  const score = (c) => {
    const names = [c.name, c.notify].filter(Boolean).map((x) => x.toLowerCase());
    if (d.length >= 6 && digits(c.jid).endsWith(d)) return 100;
    if (!s) return 0;
    if (names.some((x) => x === s)) return 90;
    if (names.some((x) => x.split(/\s+/).includes(s))) return 70;
    if (names.some((x) => x.startsWith(s))) return 60;
    if (names.some((x) => x.includes(s))) return 40;
    return 0;
  };
  return all.map((c) => [score(c), c]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]).slice(0, 12)
    .map(([n, c]) => ({ score: n, name: c.name || c.notify || '', saved: !!c.name, number: c.jid ? '+' + digits(c.jid) : '', jid: c.jid || c.lid }));
}
async function send({ to, text, files }) {
  if (!sock || state.status !== 'connected') throw new Error('WhatsApp non è collegato');
  const jid = toJid(String(to || ''));
  if (!jid) throw new Error('destinatario non valido');
  if (jid.endsWith('@s.whatsapp.net')) {
    const [r] = await sock.onWhatsApp(jid);
    if (!r?.exists) throw new Error('questo numero non usa WhatsApp');
  }
  const ids = [];
  let caption = String(text || '').trim();
  for (const f of files || []) {
    const st = fs.statSync(f.path);
    if (st.size > MAX_FILE) throw new Error(`«${f.name}» è troppo grande per WhatsApp`);
    const buf = fs.readFileSync(f.path), mime = f.mime || 'application/octet-stream';
    let msg;
    if (mime.startsWith('image/') && !mime.includes('svg')) msg = { image: buf, caption, mimetype: mime };
    else if (mime.startsWith('video/')) msg = { video: buf, caption, mimetype: mime };
    else if (mime.startsWith('audio/')) msg = { audio: buf, mimetype: mime };
    else msg = { document: buf, mimetype: mime, fileName: f.name || 'file', caption };
    if (!msg.audio) caption = '';   // il testo va una volta sola, come didascalia del primo file
    ids.push((await sock.sendMessage(jid, msg))?.key?.id);
  }
  if (caption) ids.push((await sock.sendMessage(jid, { text: caption }))?.key?.id);
  return { ok: ids.length > 0 && ids.every(Boolean), ids, to: jid };
}

// ---- piccolo server HTTP solo per Aura
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const body = (req) => new Promise((ok, ko) => { let b = ''; req.on('data', (c) => { b += c; if (b.length > 1e6) req.destroy(); }); req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { ko(e); } }); });
http.createServer(async (req, res) => {
  if (!TOKEN || req.headers['x-token'] !== TOKEN) return json(res, 401, { error: 'token' });
  const url = new URL(req.url, 'http://x');
  try {
    if (req.method === 'GET' && url.pathname === '/status') return json(res, 200, { ...state, contacts: Object.keys(contacts).length });
    if (req.method === 'POST' && url.pathname === '/link') { qrTries = 0; await start(); return json(res, 200, state); }
    if (req.method === 'POST' && url.pathname === '/logout') {
      try { await sock?.logout(); } catch {}
      stop('unlinked'); wipe();
      return json(res, 200, state);
    }
    if (req.method === 'GET' && url.pathname === '/contacts') return json(res, 200, { contacts: searchContacts(url.searchParams.get('q')) });
    if (req.method === 'POST' && url.pathname === '/send') return json(res, 200, await send(await body(req)));
    return json(res, 404, { error: 'non trovato' });
  } catch (e) { return json(res, 400, { error: String(e?.message || e) }); }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Aura WhatsApp in ascolto su 127.0.0.1:${PORT}`);
  if (linkedBefore()) start().catch((e) => { state = { ...state, error: String(e) }; });   // gia' collegato: si riconnette da solo
});
