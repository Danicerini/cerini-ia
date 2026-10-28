'use strict';
// ================================================================== utils
const $ = (s, r = document) => r.querySelector(s);
const ICONS = {
  panel: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18"/>',
  edit: '<path d="M12 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-6"/><path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
  retry: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  power: '<path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.77.04"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M10.7 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  play: '<path d="M6 3l14 9-14 9Z"/>',
  sound: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  box: '<path d="M21 8 12 3 3 8l9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 16v-5M13 16V7M18 16v-8"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  waves: '<path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
  pinOff: '<path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/>',
  brain: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M12 18V5"/>',
  auto: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  unload: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
};
const MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.4 7.5A7 7 0 1 0 17.4 16.5"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/></svg>';
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
document.querySelectorAll('[data-icon]').forEach((el) => { el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); });

// Pannello del marchio nelle schermate di accesso: anelli concentrici che si aprono come la C del logo
(function authArt() {
  const rings = [44, 80, 116, 152, 188].map((r, i) => {
    const x = (200 + r * 0.766).toFixed(1), y1 = (200 - r * 0.643).toFixed(1), y2 = (200 + r * 0.643).toFixed(1);
    const w = (2.4 - i * 0.3).toFixed(2), o = (0.9 - i * 0.17).toFixed(2);
    return `<path pathLength="1" d="M${x} ${y1}A${r} ${r} 0 1 0 ${x} ${y2}" stroke-width="${w}" opacity="${o}" style="animation-delay:${i * 110}ms"/>`;
  }).join('');
  const html = `<div class="brand"><span class="brand-mark">${MARK}</span>Cerini IA</div>
    <svg class="rings" viewBox="0 0 400 400">${rings}<circle cx="200" cy="200" r="13"/></svg>
    <div class="art-copy"><h2>Il tuo assistente.<br>Sul PC di casa.</h2>
    <p>I modelli girano sul nostro computer, non su servizi esterni: le conversazioni restano qui.</p></div>`;
  document.querySelectorAll('.auth-art').forEach((el) => { el.innerHTML = html; });
})();
document.querySelectorAll('.pw-toggle').forEach((b) => {
  const inp = document.getElementById(b.dataset.for);
  const paint = () => { const shown = inp.type === 'text'; b.innerHTML = icon(shown ? 'eyeOff' : 'eye'); b.setAttribute('aria-label', shown ? 'Nascondi password' : 'Mostra password'); };
  b.onclick = () => { inp.type = inp.type === 'password' ? 'text' : 'password'; paint(); inp.focus(); };
  paint();
});

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c);
  return el;
}
const pref = {
  get(k, d) { try { const v = localStorage.getItem('ia.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ia.' + k, JSON.stringify(v)); } catch {} },
};
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
const gb = (b) => (b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : Math.round(b / 1e6) + ' MB');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = h('textarea', { style: 'position:fixed;opacity:0' }); ta.value = text; document.body.append(ta); ta.select();
    document.execCommand('copy'); ta.remove();
  }
  if (btn) { const old = btn.innerHTML; btn.innerHTML = icon('check', 'sm') + (btn.dataset.label ? 'Copiato' : ''); setTimeout(() => (btn.innerHTML = old), 1400); }
}

// ===================================================================== api
async function api(path, body, opts = {}) {
  const r = await fetch(path, body === undefined ? opts : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...opts,
  });
  if (r.status === 401 && path !== '/api/login') { showLogin(); throw new Error('Sessione scaduta: accedi di nuovo'); }
  if (!r.ok) {
    let msg = `Errore ${r.status}`;
    try { const j = await r.json(); msg = typeof j.detail === 'string' ? j.detail : msg; } catch {}
    throw new Error(msg);
  }
  return r;
}

// ============================================================== storage
// Le chat stanno sul server, separate per utente. IndexedDB serve solo a importare
// una volta le chat che la versione precedente salvava nel browser.
const LegacyDB = {
  open() {
    return new Promise((res) => {
      try {
        const r = indexedDB.open('ia-locale', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('chats', { keyPath: 'id' });
        r.onsuccess = () => res(r.result); r.onerror = () => res(null);
      } catch { res(null); }
    });
  },
  async takeAll() {
    const db = await this.open(); if (!db) return [];
    return new Promise((res) => {
      try {
        const q = db.transaction('chats').objectStore('chats').getAll();
        q.onsuccess = () => res(q.result || []); q.onerror = () => res([]);
      } catch { res([]); }
    });
  },
  async clear() { const db = await this.open(); try { db && db.transaction('chats', 'readwrite').objectStore('chats').clear(); } catch {} },
};
const Store = {
  async list() { return (await api('/api/chats')).json(); },
  async get(id) { return (await api('/api/chats/' + id)).json(); },
  put(c) { return api('/api/chats/' + c.id, { title: c.title, model: c.model || null, created: c.created, messages: c.messages }, { method: 'PUT' }); },
  del(id) { return api('/api/chats/' + id, undefined, { method: 'DELETE' }); },
};

// =================================================================== state
const S = {
  chats: [], currentId: null, status: null, model: String(pref.get('model', '') || '').startsWith('cloud:') ? null : pref.get('model', null), busyModel: null, busySince: 0,
  stream: null, attachments: [], think: pref.get('think', false), caps: {}, wol: false, editing: null, me: null,
};
const current = () => S.chats.find((c) => c.id === S.currentId) || null;
const loadedNames = () => new Set((S.status?.loaded || []).map((m) => m.name));
// una chat aperta con un modello cloud di prima usa quello impostato adesso (e lo mostra)
const activeModel = () => { const m = current()?.model || S.model; return isCloudM(m) && S.status?.cloud && m !== S.status.cloud ? S.status.cloud : m; };
const isAdmin = () => S.me?.role === 'admin';

// I campi che iniziano con _ sono stato dell'interfaccia (streaming, ragionamento aperto) e non si salvano.
// I salvataggi della stessa chat vanno in coda, cosi' non arrivano al server in ordine sbagliato.
function saveChat(chat) {
  chat.updated = Date.now();
  const doc = JSON.parse(JSON.stringify({ id: chat.id, title: chat.title, model: chat.model, created: chat.created, messages: chat.messages },
    (k, v) => (k.startsWith('_') ? undefined : v)));
  chat._saving = (chat._saving || Promise.resolve()).then(() => Store.put(doc)).catch(() => toast('Non sono riuscito a salvare la chat sul server'));
}

// =================================================================== login
function showLogin() {
  $('#app').classList.add('hidden'); $('#invite').classList.add('hidden'); $('#login').classList.remove('hidden');
  setTimeout(() => $('#u').focus(), 50);
}
async function showApp() {
  $('#login').classList.add('hidden'); $('#app').classList.remove('hidden');
  $('#invite').classList.add('hidden');
  try {
    S.me = await (await api('/api/me')).json(); S.wol = S.me.power || S.me.wol;
    $('#userName').textContent = S.me.user; $('#avatar').textContent = S.me.user[0] || '?';
    $('#avatar').classList.add('c'); $('#avatar').style.setProperty('--h', hueOf(S.me.user));
    $('#userRole').textContent = isAdmin() ? 'Amministratore' : 'Utente';
  } catch { return; }
  S.currentId = null; closeViews(); refreshMemoryCount();
  $('#mailBtn').classList.toggle('hidden', !S.me.gmail); refreshMailBadge();
  $('#agendaBtn').classList.toggle('hidden', !S.me.calendar); loadToday();
  $('#clientiBtn').classList.toggle('hidden', !isAdmin());
  refreshAuraBadge();
  if (new URLSearchParams(location.search).get('aura')) { history.replaceState(null, '', '/'); openAura(); }
  if (!isMobile() && pref.get('brainPanel', true)) toggleBrain(true);
  try { S.chats = await Store.list(); } catch (e) { S.chats = []; toast('Non riesco a leggere le chat: ' + e.message); }
  renderAll(); refresh(); focusInput();
  migrateLegacy();
  const gm = new URLSearchParams(location.search).get('gmail');
  if (gm) {
    history.replaceState(null, '', '/');
    toast({ ok: 'Google collegato', annullato: 'Collegamento a Gmail annullato', scaduto: 'Il collegamento è scaduto: riprova',
      permessi: 'Serve il permesso di gestire le mail: riprova e lascia la spunta su Gmail' }[gm] || 'Collegamento a Gmail non riuscito');
    if (gm === 'ok' || gm === 'permessi') openSettings();
  }
}
async function migrateLegacy() {
  if (pref.get('migrated', false)) return;
  const old = (await LegacyDB.takeAll()).filter((c) => c.messages?.length && !S.chats.some((x) => x.id === c.id));
  let n = 0;
  for (const c of old) {
    try { await Store.put(JSON.parse(JSON.stringify(c, (k, v) => (k.startsWith('_') ? undefined : v)))); n++; } catch {}
  }
  if (n === old.length) { await LegacyDB.clear(); pref.set('migrated', true); }
  if (n) { S.chats = await Store.list(); renderSidebar(); toast(`Ho spostato sul server ${n} chat salvate in questo browser`); }
}
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target), err = $('#loginErr'), btn = $('#loginBtn');
  if (!f.get('username') || !f.get('password')) { err.textContent = 'Inserisci utente e password.'; return; }
  err.textContent = ''; btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    await api('/api/login', { username: f.get('username'), password: f.get('password') });
    e.target.reset(); showApp();
  } catch (ex) { err.textContent = ex.message === 'Credenziali errate' ? 'Utente o password non corretti.' : ex.message; }
  btn.disabled = false; btn.textContent = 'Accedi';
});
$('#logoutBtn').onclick = async () => { try { await api('/api/logout', {}); } catch {} showLogin(); };

// =================================================================== theme
const THEMES = ['auto', 'light', 'dark'];
function applyTheme() {
  const t = pref.get('theme', 'auto');
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t;
  const b = $('#themeBtn');
  b.innerHTML = icon(t === 'auto' ? 'auto' : t === 'light' ? 'sun' : 'moon', 'sm');
  b.title = 'Tema: ' + ({ auto: 'automatico', light: 'chiaro', dark: 'scuro' })[t];
}
$('#themeBtn').onclick = () => { pref.set('theme', THEMES[(THEMES.indexOf(pref.get('theme', 'auto')) + 1) % 3]); applyTheme(); };
applyTheme();

// ================================================================== status
const isCloudM = (n) => String(n || '').startsWith('cloud:');
const canChat = () => !!S.status?.online || (isCloudM(activeModel()) && S.status?.cloud === activeModel());
async function refresh() {
  try { S.status = await (await api('/api/status')).json(); }
  catch (e) { if (!$('#app').classList.contains('hidden')) S.status = { online: false, loaded: [], models: [], unreachable: true }; }
  if (S.status?.cloud && !S.status.models.some((m) => m.name === S.status.cloud)) S.status.models.push({ name: S.status.cloud, cloud: true });
  // all'avvio: il modello scelto nelle impostazioni (Gemma di casa o il cloud, se e' configurato)
  if (!S.startSet && S.me && S.status) { S.startSet = true; if (S.me.start_model === 'cloud' && S.status.cloud) S.model = S.status.cloud; }
  if (S.status?.online && S.status.models.length) {
    const names = S.status.models.map((m) => m.name);
    if (!S.model || !names.includes(S.model)) {
      S.model = names.includes(S.status.default_model) ? S.status.default_model
        : (S.status.loaded[0] && names.includes(S.status.loaded[0].name)) ? S.status.loaded[0].name : names[0];
      pref.set('model', S.model);
    }
  }
  renderStatus(); loadCaps(activeModel());
}
setInterval(() => { if (!document.hidden && !$('#app').classList.contains('hidden')) refresh(); }, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#app').classList.contains('hidden')) refresh(); });

async function loadCaps(name) {
  if (isCloudM(name)) { S.caps[name] = { capabilities: ['completion', 'tools', 'vision'] }; return; }
  if (!name || S.caps[name] || !S.status?.online) return;
  S.caps[name] = { capabilities: [] };
  try { S.caps[name] = await (await api('/api/model-info?name=' + encodeURIComponent(name))).json(); renderComposer(); }
  catch { delete S.caps[name]; }
}
const hasCap = (cap) => (S.caps[activeModel()]?.capabilities || []).includes(cap);

function renderStatus() {
  const s = S.status || { online: false, loaded: [], models: [] };
  const loaded = loadedNames(), m = activeModel();
  if (s.online) S.powering = null;   // acceso: fine dell'attesa
  $('#modelName').textContent = canChat() && isCloudM(m) ? '☁ ' + m.slice(6) : !s.online ? (s.unreachable ? 'Server non raggiungibile' : S.powering ? 'Accensione…' : 'PC spento') : (m || 'Nessun modello');
  $('#modelDot').className = 'dot ' + (canChat() && isCloudM(m) ? 'ok' : !s.online ? 'err' : S.busyModel === m ? 'warn' : loaded.has(m) ? 'ok' : '');
  $('#modelDot').title = loaded.has(m) ? 'Acceso' : 'Spento';
  if (!$('#picker').classList.contains('hidden')) renderPicker();
  renderComposer();
}

// ================================================================== picker
function renderPicker() {
  const p = $('#picker'), s = S.status || { online: false, models: [], loaded: [] };
  p.replaceChildren();
  if (!s.online) {
    p.append(h('div', { class: 'picker-empty' },
      h('div', { text: s.unreachable ? 'Il pannello non riesce a contattare il server.' : 'Il PC è spento o Ollama non è in esecuzione.' }),
      S.wol ? h('button', { class: 'btn sm', html: icon('power', 'sm') + 'Accendi PC', onclick: wake }) : null));
    if (!s.cloud) return;
  }
  if (!s.models.length) { p.append(h('div', { class: 'picker-empty', text: 'Nessun modello scaricato sul PC. Usa “ollama pull” per aggiungerne uno.' })); return; }
  p.append(h('div', { class: 'picker-head' }, h('span', { text: 'Modelli sul PC' }), h('span', { text: 'per la chat' })));
  const sel = activeModel();
  for (const m of s.models) {
    if (m.cloud) {
      p.append(h('div', { class: 'm-row' + (sel === m.name ? ' sel' : ''), role: 'option', tabindex: 0, onclick: () => selectModel(m.name) },
        h('span', { class: 'check', html: icon('check', 'sm') }),
        h('div', {}, h('div', { class: 'nm', text: '☁ ' + m.name.slice(6) }), h('div', { class: 'meta', text: 'nel cloud · a pagamento · funziona anche a PC spento' })), h('div')));
      continue;
    }
    if (!s.online) continue;
    const ld = s.loaded.find((l) => l.name === m.name);
    const busy = S.busyModel === m.name;
    const meta = [m.params, m.quant, gb(m.size)].filter(Boolean).join(' · ');
    let act;
    if (busy) act = h('span', { class: 'btn sm', 'aria-live': 'polite' }, h('span', { class: 'spinner' }), h('span', { class: 'tnum', id: 'busyTxt', text: busyText() }));
    else if (ld) act = h('button', { class: 'btn sm', title: 'Spegne il modello e libera la memoria della GPU', onclick: (e) => { e.stopPropagation(); unloadModel(m.name); }, html: icon('power', 'sm') + 'Spegni' });
    else act = h('button', { class: 'btn sm', disabled: !!S.busyModel, title: 'Carica il modello in memoria, pronto a rispondere', onclick: (e) => { e.stopPropagation(); loadModel(m.name); }, html: icon('power', 'sm') + 'Accendi' });
    if (!isAdmin() && !busy) act = null;
    let mem = null;
    if (ld) {
      const gpu = ld.size ? Math.round((100 * ld.size_vram) / ld.size) : 0;
      const mins = ld.expires_at ? Math.max(0, Math.round((new Date(ld.expires_at) - Date.now()) / 60000)) : null;
      mem = h('div', { class: 'mem' },
        h('div', { class: 'mem-bar', title: `GPU ${gpu}% · CPU ${100 - gpu}%` }, h('div', { class: 'g', style: `width:${gpu}%` }), h('div', { class: 'c', style: `width:${100 - gpu}%` })),
        h('div', { class: 'mem-txt tnum' },
          h('span', { html: `<b>${gpu}%</b> in GPU` }), gpu < 100 ? h('span', { html: `<b>${100 - gpu}%</b> in RAM` }) : null,
          h('span', { text: gb(m.size) }), mins !== null && mins < 100000 ? h('span', { text: `libera tra ${mins} min` }) : null));
    }
    const row = h('div', { class: 'm-row' + (m.name === sel ? ' sel' : ''), role: 'option', 'aria-selected': m.name === sel, tabindex: 0,
      onclick: () => selectModel(m.name), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectModel(m.name); } } },
      h('span', { class: 'check', html: icon('check', 'sm') }),
      h('div', {}, h('div', { class: 'nm' }, m.name, ld ? h('span', { class: 'chip', style: 'margin-left:8px;vertical-align:1px', text: 'acceso' }) : null), h('div', { class: 'meta tnum', text: meta })),
      h('div', { class: 'side-act' }, act), mem);
    p.append(row);
  }
  // quanto ha consumato il modello attivo questo mese (un clic apre i consumi)
  const um = S.usage?.models?.find((x) => x.name === sel);
  p.append(h('button', { class: 'picker-foot u-foot', onclick: () => { S.accSec = 'usage'; openSettings('account'); } }, h('span', { html: icon('chart', 'sm') }),
    h('span', { text: 'Questo mese' }), h('span', { class: 'pf-state tnum', text: um ? `${fmtTok(um.month[1] + um.month[2])} token · ${um.cloud ? (um.month_cost == null ? 'prezzo da impostare' : fmtMoney(um.month_cost)) : 'gratis'}` : 'ancora niente' })));
  // Modelli di servizio (memoria): informativi, non si scelgono per chattare
  (s.helpers || []).forEach((x) => p.append(h('div', { class: 'picker-foot' }, h('span', { html: icon('brain', 'sm') }),
    h('span', { text: `Memoria: ${x.name.replace(':latest', '')}` }), h('span', { class: 'pf-state', text: x.loaded ? `in GPU · ${gb(x.size_vram)}` : 'si accende quando serve' }))));
}
const busyText = () => `Accensione ${Math.round((Date.now() - S.busySince) / 1000)} s`;
setInterval(() => { const b = $('#busyTxt'); if (b) b.textContent = busyText(); }, 1000);

function togglePicker(force) {
  const p = $('#picker'), open = force ?? p.classList.contains('hidden');
  p.classList.toggle('hidden', !open); $('#modelBtn').setAttribute('aria-expanded', open);
  if (open) { renderPicker(); refresh(); loadUsage().then(() => { if (!p.classList.contains('hidden')) renderPicker(); }); }
}
$('#modelBtn').onclick = (e) => { e.stopPropagation(); togglePicker(); };
document.addEventListener('click', (e) => { if (!$('#picker').contains(e.target)) togglePicker(false); });

function selectModel(name) {
  S.model = name; if (!isCloudM(name)) pref.set('model', name);   // il cloud vale per questa chat, non diventa il predefinito
  const c = current(); if (c) { c.model = name; saveChat(c); }
  togglePicker(false); renderStatus(); loadCaps(name); focusInput();
}
async function loadModel(name) {
  S.model = name; pref.set('model', name);
  const c = current(); if (c) { c.model = name; saveChat(c); }
  S.busyModel = name; S.busySince = Date.now(); renderStatus();
  try { await api('/api/load', { model: name }); toast(`${name} è acceso e pronto`); }
  catch (e) { toast('Accensione non riuscita: ' + e.message); }
  S.busyModel = null; refresh();
}
async function unloadModel(name) {
  try { await api('/api/unload', { model: name }); toast('Modello spento, memoria liberata'); } catch (e) { toast(e.message); }
  refresh();
}
// Accensione con l'ESP32: il server preme il tasto solo se il PC risulta davvero spento
async function wake() {
  if (S.powering && Date.now() - S.powering < 180000) return;
  try {
    const d = await (await api(S.me?.power ? '/api/power/on' : '/api/wol', {})).json();
    S.powering = Date.now(); toast(d.message || 'Comando inviato: il PC può impiegare un paio di minuti');
  } catch (e) { toast(e.message); }
  renderAll();
}

// ================================================================= sidebar
function groupOf(ts) {
  const d = new Date(ts), now = new Date(), day = 864e5;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (ts >= start) return 'Oggi';
  if (ts >= start - day) return 'Ieri';
  if (ts >= start - 7 * day) return 'Ultimi 7 giorni';
  if (ts >= start - 30 * day) return 'Ultimi 30 giorni';
  return d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}
function renderSidebar() {
  const list = $('#chatList'); list.replaceChildren();
  const chats = S.chats.filter((c) => (!c.messages || c.messages.length) && c.id !== S.me?.aura_chat);
  if (!chats.length) { list.append(h('div', { class: 'side-empty', text: 'Le tue conversazioni appariranno qui.' })); return; }
  let last = null;
  // Prima le fissate, poi le altre per data
  const pinned = chats.filter((c) => c.pinned);
  if (pinned.length) { list.append(h('div', { class: 'group-label', text: 'Fissate' })); pinned.forEach((c) => list.append(chatItem(c))); }
  for (const c of chats.filter((x) => !x.pinned)) {
    const g = groupOf(c.updated);
    if (g !== last) { list.append(h('div', { class: 'group-label', text: g })); last = g; }
    list.append(chatItem(c));
  }
}
function chatItem(c) {
  const el = h('div', { class: 'chat-item' + (c.id === S.currentId ? ' active' : ''), role: 'button', tabindex: 0, title: c.title,
    onclick: () => openChat(c.id), onkeydown: (e) => { if (e.key === 'Enter') openChat(c.id); } });
  const t = h('span', { class: 't', text: c.title });
  const pin = h('button', { class: 'icon-btn', title: c.pinned ? 'Togli dalle fissate' : 'Fissa in cima', 'aria-label': c.pinned ? 'Togli dalle fissate' : 'Fissa in cima',
    html: icon(c.pinned ? 'pinOff' : 'pin', 'sm'), onclick: (e) => { e.stopPropagation(); togglePin(c); } });
  const rename = h('button', { class: 'icon-btn', title: 'Rinomina', 'aria-label': 'Rinomina', html: icon('pencil', 'sm'),
    onclick: (e) => { e.stopPropagation(); startRename(el, c); } });
  const del = h('button', { class: 'icon-btn', title: 'Elimina', 'aria-label': 'Elimina', html: icon('trash', 'sm'),
    onclick: (e) => {
      e.stopPropagation();
      if (!el.classList.contains('confirm')) {
        el.classList.add('confirm'); t.textContent = 'Eliminare la chat?'; del.title = 'Conferma eliminazione';
        setTimeout(() => { if (el.isConnected) { el.classList.remove('confirm'); t.textContent = c.title; } }, 3000);
        return;
      }
      deleteChat(c.id);
    } });
  if (c.pinned) el.append(h('span', { class: 'pin-mark', html: icon('pin', 'sm'), 'aria-hidden': 'true' }));
  el.append(t, h('span', { class: 'acts' }, pin, rename, del));
  return el;
}
async function togglePin(c) {
  const was = !!c.pinned;
  c.pinned = !was; renderSidebar();
  try { await api('/api/chats/' + c.id, { pinned: c.pinned }, { method: 'PATCH' }); toast(c.pinned ? 'Chat fissata in cima' : 'Chat tolta dalle fissate'); }
  catch (e) { c.pinned = was; renderSidebar(); toast('Non sono riuscito a fissare la chat: ' + e.message); }
}
function startRename(el, c) {
  const inp = h('input', { value: c.title, 'aria-label': 'Nuovo titolo' });
  el.replaceChildren(inp); inp.focus(); inp.select();
  const done = (save) => { if (save && inp.value.trim()) { c.title = inp.value.trim(); saveChat(c); } renderSidebar(); };
  inp.onclick = (e) => e.stopPropagation();
  inp.onkeydown = (e) => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); };
  inp.onblur = () => done(true);
}
function deleteChat(id) {
  if (S.stream?.chatId === id) S.stream.controller.abort();
  S.chats = S.chats.filter((c) => c.id !== id);
  Store.del(id).catch(() => toast('Non sono riuscito a eliminare la chat dal server'));
  if (S.currentId === id) S.currentId = null;
  renderAll();
}
async function openChat(id) {
  const c = S.chats.find((x) => x.id === id); if (!c) return;
  closeViews();
  if (!c.messages) {
    try { Object.assign(c, await Store.get(id)); }
    catch (e) { toast('Non riesco ad aprire la chat: ' + e.message); return; }
  }
  S.currentId = id; S.editing = null; S.attachments = [];
  if (c.model) loadCaps(c.model);
  closeSide(); renderAll(); scrollToBottom(true);
}
function newChat() {
  S.currentId = null; S.editing = null; S.attachments = [];
  closeViews(); closeSide(); renderAll(); focusInput();
}
$('#newChat').onclick = newChat; $('#newChatTop').onclick = newChat;

const isMobile = () => matchMedia('(max-width: 820px)').matches;
function closeSide() { $('#app').classList.remove('side-open'); }
$('#sideOpen').onclick = () => {
  if (isMobile()) $('#app').classList.add('side-open');
  else { $('#app').classList.remove('side-collapsed'); pref.set('sideCollapsed', false); }
};
$('#sideClose').onclick = () => {
  if (isMobile()) closeSide();
  else { $('#app').classList.add('side-collapsed'); pref.set('sideCollapsed', true); }
};
$('#scrim').onclick = closeSide;
if (pref.get('sideCollapsed', false)) $('#app').classList.add('side-collapsed');

// Telefono: trascinando dal bordo sinistro si apre la barra laterale, verso sinistra si chiude
(() => {
  let x0 = null, y0 = 0, open = false;
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    open = $('#app').classList.contains('side-open');
    x0 = isMobile() && e.touches.length === 1 && (open || t.clientX < 28) ? t.clientX : null; y0 = t.clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const t = e.changedTouches[0], dx = t.clientX - x0, dy = Math.abs(t.clientY - y0);
    if (dy < 60 && !open && dx > 60) $('#app').classList.add('side-open');
    if (dy < 60 && open && dx < -60) closeSide();
    x0 = null;
  }, { passive: true });
})();

// Telefono: con la tastiera aperta (iOS non ridimensiona la pagina) l'app occupa solo la parte visibile,
// cosi' la casella di scrittura resta sopra la tastiera. Non si applica quando si ingrandisce con due dita.
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fit = () => {
    if (vv.scale > 1.01) return;
    document.documentElement.style.setProperty('--app-h', `${Math.round(vv.height)}px`);
    if (window.scrollY) window.scrollTo(0, 0);
  };
  vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); fit();
}

// ================================================================ markdown
function renderMarkdown(src, { breaks = true } = {}) {
  src = String(src || '').replace(/<call>[\s\S]*?(<\/call>|$)/gi, '').replace(/```tool_code[\s\S]*?(```|$)/gi, '')
    .replace(/call:[a-z_]+\{[\s\S]*?\}\s*(<tool_call\|>)?\s*(<\|tool_response>)?/g, '').replace(/<\|?\/?tool_(call|response)\|?>/g, '');
  if (!window.marked || !window.DOMPurify) return h('div', { text: src, style: 'white-space:pre-wrap' }).outerHTML;
  // Protegge le formule dal parser markdown; il codice resta intatto
  const math = [];
  const parts = src.split(/(```[\s\S]*?(?:```|$)|`[^`\n]*`)/g);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i]
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => ph(t, true))
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => ph(t, true))
      .replace(/\\\(([\s\S]+?)\\\)/g, (_, t) => ph(t, false))
      .replace(/(^|[^\\$\w])\$(?=\S)([^$\n]+?)(?<=\S)\$(?![\w$])/g, (_, pre, t) => pre + ph(t, false));
  }
  function ph(tex, display) { math.push({ tex, display }); return `@@M${math.length - 1}@@`; }
  let html = DOMPurify.sanitize(marked.parse(parts.join(''), { gfm: true, breaks }));
  html = html.replace(/@@M(\d+)@@/g, (_, i) => {
    const m = math[+i];
    if (!window.katex) return h('code', { text: m.tex }).outerHTML;
    try { return katex.renderToString(m.tex, { displayMode: m.display, throwOnError: false, output: 'html' }); }
    catch { return h('code', { text: m.tex }).outerHTML; }
  });
  return html;
}
function enhance(root) {
  root.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    if (pre.parentElement.classList.contains('codeblock')) return;
    const lang = (code.className.match(/language-([\w+#-]+)/) || [])[1] || '';
    if (window.hljs && lang && hljs.getLanguage(lang)) {
      try { code.innerHTML = hljs.highlight(code.textContent, { language: lang, ignoreIllegals: true }).value; } catch {}
    }
    const btn = h('button', { 'data-label': '1', html: icon('copy', 'sm') + 'Copia', onclick: () => copyText(code.textContent, btn) });
    const wrap = h('div', { class: 'codeblock' }, h('div', { class: 'ch' }, h('span', { text: lang || 'testo' }), btn));
    pre.replaceWith(wrap); wrap.append(pre);
  });
  root.querySelectorAll('table').forEach((t) => { if (!t.parentElement.classList.contains('tbl')) { const w = h('div', { class: 'tbl' }); t.replaceWith(w); w.append(t); } });
  root.querySelectorAll('a[href]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
}

// ================================================================== thread
function renderAll() { renderSidebar(); renderThread(); renderStatus(); renderProjectChip(); }
// il progetto di questa chat (Brain Protocol, project-first): lo decide il server dai messaggi; un tocco apre la sua scheda
function renderProjectChip() {
  const b = $('#projChip'); if (!b) return;
  const p = current()?.project;
  b.classList.toggle('hidden', !p);
  if (p) { b.replaceChildren(h('span', { html: icon('folder', 'sm') }), h('span', { class: 'pc-n', text: p.name })); b.title = `Progetto di questa chat: ${p.name}`; b.onclick = () => openBrainFile(p.path); }
}

function renderThread() {
  const c = current(), thread = $('#thread'), aura = isAuraChat(c);
  const empty = !aura && (!c || !c.messages.length);
  $('#main').classList.toggle('empty', empty);
  $('#main').classList.toggle('aura-mode', aura);
  input.placeholder = aura ? 'Rispondi ad Aura…' : 'Scrivi ad Aura';
  thread.replaceChildren();
  if (empty) { renderHero(); return; }
  if (aura) thread.append(auraBanner());
  const lastAssist = c.messages.map((m) => m.role).lastIndexOf('assistant');
  groupMemoryNotes(c.messages);
  // i passaggi intermedi di un turno (strumenti usati, ragionamenti tra uno e l'altro) finiscono in una riga sola, apribile
  const rows = []; let turn = 0;
  c.messages.forEach((m, i) => { if (m.role === 'user') turn++; const el = messageEl(c, m, i, i === lastAssist, i === c.messages.length - 1); if (el) rows.push({ m, el, turn }); });
  const grouped = new Set();
  let lastDay = '', prevFeed = false;
  rows.forEach((r) => {
    if (aura) {   // «Da Aura»: un'etichetta per ogni giorno, e l'avatar solo sul primo di una serie di messaggi di Aura
      const ts = r.m.ts || (r.m.role === 'feed' ? (S.feed?.[r.m.fid]?.at || 0) * 1000 : 0);
      const day = ts ? new Date(ts).toDateString() : lastDay;
      if (day && day !== lastDay) { thread.append(daySep(ts)); prevFeed = false; }
      lastDay = day;
      const isFeed = r.m.role === 'feed';
      if (isFeed && prevFeed) r.el.classList.add('au-cont');
      prevFeed = isFeed;
    }
    if (!r.m._step) { thread.append(r.el); return; }
    if (grouped.has(r.turn)) return;
    const steps = rows.filter((x) => x.turn === r.turn && x.m._step);
    if (steps.length < 2) { thread.append(r.el); return; }
    grouped.add(r.turn); thread.append(stepsEl(steps));
  });
}
function stepsEl(steps) {
  const owner = steps[0].m;
  const tools = steps.filter((s) => s.m.role === 'tool').length;
  const ms = steps.reduce((t, s) => t + (s.m.role === 'assistant' ? s.m.thinkMs || 0 : 0), 0);
  const secs = ms ? Math.max(1, Math.round(ms / 1000)) : 0;
  const label = (tools ? `${tools === 1 ? 'Un passaggio' : tools + ' passaggi'}` : 'Ha ragionato') + (secs ? (tools ? ` · ${secs} s` : ` per ${secs} s`) : '');
  const d = h('details', { class: 'think steps', open: owner._stepsOpen ? true : null, ontoggle: () => { owner._stepsOpen = d.open; } },
    h('summary', {}, h('span', { html: icon('tool', 'sm') }), h('span', { text: label }), h('span', { class: 'chev', html: icon('chevron', 'sm') })),
    h('div', { class: 'steps-body' }, steps.map((s) => s.el)));
  return h('div', { class: 'msg step' }, d);
}

// Strumenti della memoria: i loro esiti non compaiono uno per uno nella chat, ma raccolti sotto la risposta del turno
const READ_TOOLS = { homebase_scratchpad_archivio: 'tool', cerca_memoria: 'brain', mail_cerca: 'mail', mail_leggi: 'mail', calendario_vedi: 'calendar', web_cerca: 'globe', web_leggi: 'globe', homebase_note: 'tool', homebase_nota: 'tool', homebase_cerca: 'tool', homebase_servizi: 'tool', homebase_rete: 'tool', homebase_scratchpad: 'tool', file_leggi: 'clip' };
const MEMORY_TOOLS = ['ricorda', 'aggiorna_ricordo', ...Object.keys(READ_TOOLS)];
// le letture con una scheda da vedere (ricerca e documenti della Homebase, chat WhatsApp) restano in vista
const SHOWN_VIEWS = ['hb', 'hb_doc', 'wa', 'consuntivo'];
const isMemoryTool = (m) => m.role === 'tool' && !SHOWN_VIEWS.includes(m.view?.kind) && (MEMORY_TOOLS.includes(m.tool_name) || m.undo?.type === 'memory' || m.undo?.type === 'memory_edit');
const isMemoryOnlyCall = (m) => m.role === 'assistant' && m.tool_calls?.length && m.tool_calls.every((t) => MEMORY_TOOLS.includes(t.function?.name));
const WORKING_LABEL = { homebase_procedura: 'Sto preparando la procedura con il tuo template… (può volerci un minuto)' };
const READING_LABEL = { cerca_memoria: 'Sto leggendo la memoria…', mail_cerca: 'Sto leggendo la posta…', mail_leggi: 'Sto leggendo la mail…', calendario_vedi: 'Sto guardando il calendario…', web_cerca: 'Sto cercando sul web…', web_leggi: 'Sto leggendo una pagina…', homebase_note: 'Sto guardando le note…', homebase_nota: 'Sto leggendo la nota…', homebase_cerca: 'Sto cercando nella Homebase…', homebase_servizi: 'Sto guardando i servizi…', homebase_rete: 'Sto guardando la rete…', homebase_scratchpad: 'Sto leggendo lo scratchpad…', homebase_scratchpad_archivio: 'Cerco negli scratchpad archiviati…', file_leggi: 'Sto leggendo il file…' };
function groupMemoryNotes(msgs) {
  let start = 0;
  const flush = (end) => {
    const turn = msgs.slice(start, end);
    const notes = turn.filter((m) => isMemoryTool(m) && m.undo);
    const reads = turn.filter((m) => m.role === 'tool' && READ_TOOLS[m.tool_name] && !SHOWN_VIEWS.includes(m.view?.kind));
    // la risposta del turno: l'ultimo messaggio dell'assistente con del testo (o quello che sta scrivendo)
    const anchor = [...turn].reverse().find((m) => m.role === 'assistant' && (m.content || m._streaming));
    // il ragionamento dei passaggi nascosti (solo memoria) si somma a quello della risposta
    const hiddenMs = turn.filter((m) => isMemoryOnlyCall(m) && !m.content).reduce((s, m) => s + (m.thinkMs || 0), 0);
    // passaggi intermedi: strumenti senza una scheda propria e i messaggi dell'assistente prima della risposta
    const SHOWN = ['email', 'procedure', 'site', 'scratchpad', 'hb', 'wa', 'hb_doc'];
    turn.forEach((m) => {
      m._step = m !== anchor && !m._streaming && ((m.role === 'tool' && !m.fromConfirm && !isMemoryTool(m) && !SHOWN.includes(m.view?.kind))
        || (m.role === 'assistant' && m.tool_calls?.length > 0 && !!anchor));
    });
    turn.forEach((m) => {
      if (m.role !== 'assistant') return;
      const mine = m === anchor;
      m._mem = mine ? notes : null;
      m._memRead = mine ? reads.map((r) => r.display).filter(Boolean) : null;
      m._readIcons = mine ? [...new Set(reads.map((r) => READ_TOOLS[r.tool_name]))] : null;
      m._sp = mine ? reads.filter((r) => r.view?.kind === 'scratchpad').map((r) => r.view) : null;
      m._thinkExtra = mine ? hiddenMs : 0;
      m._files = mine ? turn.filter((x) => x.role === 'tool' && x.files).flatMap((x) => x.files) : null;
      m._sources = mine ? [...new Map(turn.filter((x) => x.role === 'tool' && x.sources).flatMap((x) => x.sources).map((s) => [s.url, s])).values()].slice(0, 6) : null;
    });
  };
  msgs.forEach((m, i) => { if (m.role === 'user') { flush(i); start = i; } });
  flush(msgs.length);
}
function memoryNotesEl(chat, owner) {
  const notes = owner._mem;
  if (!notes?.length) return null;
  const item = (m) => {
    const edit = m.undo.type === 'memory_edit';
    return h('li', { class: m.undone ? 'undone' : '' }, h('i', { class: 'mem-ic', html: icon('brain', 'sm') }), h('span', { text: m.display }),
      m.undone ? null : h('button', { class: 'tc-undo', text: edit ? 'Annulla' : 'Cancella',
        title: edit ? 'Rimetti il ricordo com\'era prima' : 'Togli questo ricordo dalla memoria', onclick: async () => {
          try {
            if (edit) { await api(`/api/memory/${m.undo.id}`, { text: m.undo.old }, { method: 'PATCH' }); m.display = `Modifica annullata: «${m.undo.old}»`; }
            else { await api(`/api/memory/${m.undo.id}`, undefined, { method: 'DELETE' }); m.display = 'Ricordo cancellato'; }
            m.undone = true; saveChat(chat); renderThread(); refreshMemoryCount();
          } catch (e) { toast(e.message); } } }));
  };
  const list = h('ul', { class: 'mem-notes' }, notes.map(item));
  if ((S.me?.mem_display || 'list') === 'list') return list;
  // Solo un simbolo: si apre con un clic
  const live = notes.filter((m) => !m.undone).length;
  const label = live ? `${live === 1 ? 'Ha ricordato una cosa' : `Ha ricordato ${live} cose`}` : 'Ricordi annullati';
  const d = h('details', { class: 'mem-badge', open: owner._memOpen ? true : null, ontoggle: () => { owner._memOpen = d.open; } },
    h('summary', { title: label, 'aria-label': label }, h('span', { html: icon('brain', 'sm') }), live ? h('b', { class: 'tnum', text: String(live) }) : null),
    list);
  return d;
}
function renderHero() {
  const s = S.status, hr = new Date().getHours();
  $('#heroTitle').textContent = hr < 6 ? 'Ancora sveglio?' : hr < 13 ? 'Buongiorno. Di cosa hai bisogno?' : hr < 18 ? 'Di cosa hai bisogno?' : 'Buonasera. Di cosa hai bisogno?';
  const am = activeModel();
  $('#heroSub').textContent = !s ? '' : isCloudM(am) && canChat() ? `Sono Aura · ${am.slice(6)}, nel cloud: i messaggi escono da casa.`
    : !s.online ? 'Il PC è spento: accendilo per iniziare.' : am ? `Sono Aura · ${am}, sul PC di casa.` : '';
  $('#heroToday')?.remove();

}

function messageEl(chat, m, i, isLastAssist, isLast) {
  if (m.role === 'user') {
    if (S.editing === i) return editEl(chat, m, i);
    const bubble = h('div', { class: 'bubble' });
    if (m.images?.length) bubble.append(h('div', { class: 'imgs' }, m.images.map((src) => h('img', { src, alt: 'Immagine allegata' }))));
    if (m.files?.some((f) => !f.image)) bubble.append(h('div', { class: 'msg-files' }, m.files.filter((f) => !f.image).map((f) => fileChip(f))));
    if (m.content) bubble.append(document.createTextNode(m.content));
    const copyB = h('button', { class: 'icon-btn sm', title: 'Copia', 'aria-label': 'Copia', html: icon('copy', 'sm'), onclick: () => copyText(m.content, copyB) });
    return h('div', { class: 'msg user' }, bubble,
      h('div', { class: 'msg-actions' }, copyB,
        h('button', { class: 'icon-btn sm', title: 'Modifica', 'aria-label': 'Modifica', disabled: !!S.stream, html: icon('pencil', 'sm'),
          onclick: () => { S.editing = i; renderThread(); } })));
  }
  if (m.role === 'tool') {
    // L'esito di un'azione confermata si vede gia' nella scheda di conferma
    if (m.fromConfirm) return null;
    if (isMemoryTool(m)) return null;   // raccolti sotto la risposta (groupMemoryNotes)
    if (m.view?.kind === 'email') return h('div', { class: 'msg step' }, emailView(chat, m));
    if (m.view?.kind === 'procedure') return h('div', { class: 'msg step' }, procedureView(chat, m));
    const isMem = m.undo?.type === 'memory' || m.undo?.type === 'memory_edit';
    const undo = isMem && !m.undone
      ? h('button', { class: 'tc-undo', text: m.undo.type === 'memory_edit' ? 'Annulla' : 'Cancella',
          title: m.undo.type === 'memory_edit' ? 'Rimetti il ricordo com\'era prima' : 'Togli questo ricordo dalla memoria', onclick: async () => {
          try {
            if (m.undo.type === 'memory_edit') { await api(`/api/memory/${m.undo.id}`, { text: m.undo.old }, { method: 'PATCH' }); m.display = `Modifica annullata: «${m.undo.old}»`; }
            else { await api(`/api/memory/${m.undo.id}`, undefined, { method: 'DELETE' }); m.display = 'Ricordo cancellato'; }
            m.undone = true; saveChat(chat); renderThread(); refreshMemoryCount();
          } catch (e) { toast(e.message); } } })
      : null;
    const calUndo = m.undo?.type === 'cal_event' && !m.undone
      ? h('button', { class: 'tc-undo', text: 'Annulla', title: 'Togli dal calendario', onclick: async () => {
          try { await api(`/api/calendar/event/${encodeURIComponent(m.undo.id)}`, undefined, { method: 'DELETE' }); m.undone = true; m.display = 'Tolto dal calendario'; saveChat(chat); renderThread(); loadToday(); }
          catch (e) { toast(e.message); } } })
      : null;
    const tIcon = isMem || m.open ? 'brain' : m.undo?.type === 'cal_event' || (m.tool_name || '').startsWith('calendario') || m.tool_name === 'promemoria' ? 'calendar' : (m.tool_name || '').startsWith('mail_') ? 'mail' : 'tool';
    const card = m.open && !m.undone
      ? h('button', { class: 'tool-card link', title: 'Apri nel cervello', onclick: () => openBrainFile(m.open) }, h('span', { html: icon(tIcon, 'sm') }),
          h('span', { text: m.display || `Ha usato ${m.tool_name}` }), h('span', { class: 'tc-open', html: icon('chevron', 'sm') }))
      : h('div', { class: 'tool-card' + (m.undone ? ' undone' : '') }, h('span', { html: icon(tIcon, 'sm') }), h('span', { text: m.display || `Ha usato ${m.tool_name}` }), undo || calUndo);
    return h('div', { class: 'msg step' }, card,
      m.view?.kind === 'site' ? siteView(m.view) : m.view?.kind === 'scratchpad' ? scratchView(m.view) : m.view?.kind === 'hb' ? hbView(m.view)
        : m.view?.kind === 'wa' ? h('div', { class: 'wa-card read' }, waView(m.view))
        : m.view?.kind === 'hb_doc' ? hbDocView(m.view, () => saveChat(chat))
        : m.view?.kind === 'consuntivo' ? consView(m.view) : null);
  }
  if (m.role === 'feed') { const it = S.feed?.[m.fid]; return it ? feedCard(it) : null; }
  if (m.role === 'note') return noteEl(m);
  if (m.role === 'confirm') return confirmEl(chat, m);
  // Messaggio dell'assistente che chiede solo di usare uno strumento: non ha testo da mostrare
  if (m.role === 'assistant' && m.tool_calls?.length && !m.content && !m.thinking && !m._streaming) return null;
  // passaggio solo per salvare ricordi, senza testo: non mostra neanche il ragionamento
  if (isMemoryOnlyCall(m) && !m.content && !m._streaming) return null;
  if (m.role === 'error') {
    return h('div', { class: 'msg' }, h('div', { class: 'err-box' }, h('span', { text: m.content }),
      isLast ? h('button', { class: 'btn sm', html: icon('retry', 'sm') + 'Riprova', onclick: () => regenerate(chat) }) : null));
  }
  const step = m.tool_calls?.length && !m.content;
  const el = h('div', { class: 'msg assistant' + (isLastAssist ? ' last' : '') + (step ? ' step' : '') });
  paintAssistant(el, m, chat, isLastAssist);
  return el;
}

function paintAssistant(el, m, chat, isLastAssist) {
  const streaming = m._streaming;
  el.replaceChildren();
  const readIcon = !streaming && m._memRead?.length
    ? h('span', { class: 'mem-read', title: m._memRead.join('\n'), 'aria-label': m._memRead.join('. '), html: (m._readIcons || ['brain']).map((i) => icon(i, 'sm')).join('') }) : null;
  if (m.thinking) {
    const ms = (m.thinkMs || 0) + (m._thinkExtra || 0);
    const secs = ms ? Math.max(1, Math.round(ms / 1000)) : null;
    const live = streaming && !m.content;
    // Chiuso di default (anche mentre ragiona): si apre solo se l'utente clicca
    const d = h('details', { class: 'think' + (live ? ' live' : ''), open: m._thinkOpen ? true : null,
      ontoggle: () => { m._thinkOpen = d.open; } },
      h('summary', {}, readIcon, h('span', { text: live ? (m._reading ? READING_LABEL[m._reading] : 'Sto pensando…') : secs ? `Ha ragionato per ${secs} s` : 'Ragionamento' }), h('span', { class: 'chev', html: icon('chevron', 'sm') })),
      h('div', { class: 'body md', html: renderMarkdown(m.thinking.replace(/\n{3,}/g, '\n\n'), { breaks: false }) }));
    el.append(d);
  }
  if (m.content) {
    const md = h('div', { class: 'md', html: renderMarkdown((!streaming && m._sp?.length && spEcho(m.content, m._sp)) || m.content) });
    enhance(md); el.append(md);
  } else if (streaming && !m.thinking) {
    el.append(m._reading
      ? h('div', { class: 'live-label' }, h('span', { html: icon(READ_TOOLS[m._reading] || 'tool', 'sm') }), h('span', { text: READING_LABEL[m._reading] || WORKING_LABEL[m._reading] }))
      : h('div', { class: 'typing', 'aria-label': 'Sto scrivendo' }, h('i'), h('i'), h('i')));
  }
  if (readIcon && !m.thinking) el.prepend(h('div', { class: 'mem-read-row' }, readIcon));
  if (!streaming && m._sp?.length) m._sp.forEach((v) => el.append(scratchView(v)));
  if (!streaming && m._sources?.length) el.append(h('div', { class: 'sources' }, h('span', { class: 'src-lbl', html: icon('globe', 'sm') + 'Fonti' }),
    ...m._sources.map((s) => { let host = s.url; try { host = new URL(s.url).hostname.replace(/^www\./, ''); } catch {}
      return h('a', { class: 'src', href: s.url, target: '_blank', rel: 'noopener noreferrer', title: s.title, text: host }); })));
  if (!streaming && m._files?.length) el.append(h('div', { class: 'msg-files out' }, m._files.map((f) => fileChip(f))));
  if (!streaming && m._mem?.length) el.append(memoryNotesEl(chat, m));
  if (!streaming && !(m.tool_calls?.length && !m.content)) {
    const copyB = h('button', { class: 'icon-btn sm', title: 'Copia', 'aria-label': 'Copia risposta', html: icon('copy', 'sm'), onclick: () => copyText(m.content, copyB) });
    const speakB = S.me?.homebase && m.content ? h('button', { class: 'icon-btn sm', title: 'Ascolta', 'aria-label': 'Ascolta la risposta', html: icon('sound', 'sm'), onclick: () => speak(m.content, speakB) }) : null;
    el.append(h('div', { class: 'msg-actions assist' }, copyB, speakB,
      isLastAssist ? h('button', { class: 'icon-btn sm', title: 'Rigenera', 'aria-label': 'Rigenera risposta', html: icon('retry', 'sm'), onclick: () => regenerate(chat) }) : null,
      m.stats ? h('span', { class: 'stats tnum', text: m.stats }) : null));
  }
}

// Mail preparata da Aura: scheda modificabile, poi l'utente sceglie Invia o Salva in bozze (Gmail)
function emailView(chat, m) {
  const v = m.view, done = ['sent', 'saved', 'cancelled'].includes(v.status);
  const save = () => saveChat(chat);
  const field = (cls, ph, key) => {
    const el = h('input', { class: cls, placeholder: ph, 'aria-label': ph, value: v[key] || '', disabled: done ? true : null,
      oninput: (e) => { v[key] = e.target.value; }, onchange: save });
    return el;
  };
  const body = h('textarea', { class: 'em-body', 'aria-label': 'Testo della mail', disabled: done ? true : null,
    oninput: (e) => { v.body = e.target.value; grow(); }, onchange: save });
  body.value = v.body || '';
  const grow = () => { body.style.height = 'auto'; body.style.height = body.scrollHeight + 'px'; };
  requestAnimationFrame(grow);
  const copyB = h('button', { class: 'icon-btn sm', title: 'Copia il testo', 'aria-label': 'Copia il testo', html: icon('copy', 'sm'),
    onclick: () => copyText(`${v.subject ? 'Oggetto: ' + v.subject + '\\n\\n' : ''}${v.body}`, copyB) });
  const act = async (kind, btn) => {
    btn.disabled = true;
    try {
      const r = await (await api(`/api/mail/compose/${kind === 'send' ? 'send' : 'draft'}`, { to: v.to || '', subject: v.subject || '', body: v.body || '',
        reply_to: v.reply_to || null, attachments: (v.attachments || []).map((a) => a.id) })).json();
      v.status = kind === 'send' ? 'sent' : 'saved';
      v.done_at = Date.now();
      m.content = (m.content || '') + (kind === 'send' ? ` [L'utente ha INVIATO la mail a ${r.to}.]` : " [L'utente l'ha salvata nelle bozze di Gmail.]");
      saveChat(chat); renderThread();
      toast(kind === 'send' ? `Mail inviata a ${r.to}` : 'Salvata nelle bozze di Gmail');
    } catch (e) { btn.disabled = false; toast(e.message); }
  };
  const cancel = () => {
    v.status = 'cancelled';
    m.content = (m.content || '') + " [L'utente ha ANNULLATO: la mail non è stata né inviata né salvata.]";
    saveChat(chat); renderThread();
  };
  const foot = v.status === 'cancelled'
    ? h('div', { class: 'em-done off' }, h('span', { html: icon('x', 'sm') }), h('span', { text: 'Annullata: non inviata né salvata' }))
    : done
    ? h('div', { class: 'em-done' }, h('span', { html: icon('check', 'sm') }),
        h('span', { text: v.status === 'sent' ? `Inviata a ${v.to}` : 'Salvata nelle bozze di Gmail' }),
        h('a', { href: `https://mail.google.com/mail/u/0/#${v.status === 'sent' ? 'sent' : 'drafts'}`, target: '_blank', rel: 'noopener', text: 'Apri Gmail' }))
    : (() => {
        const send = h('button', { class: 'btn sm primary', html: icon('up', 'sm') + 'Invia', onclick: () => act('send', send) });
        const draft = h('button', { class: 'btn sm', html: icon('mail', 'sm') + 'Salva in bozze', onclick: () => act('draft', draft) });
        const no = h('button', { class: 'btn sm em-cancel', html: icon('x', 'sm') + 'Annulla', onclick: cancel });
        return h('div', { class: 'em-actions' }, no, draft, send);
      })();
  // allegati: quelli scelti da Aura (o il file che hai appena mandato in chat); si tolgono con la x, se ne aggiungono con «Allega»
  v.attachments = v.attachments || [];
  const pick = h('input', { type: 'file', multiple: true, hidden: true, onchange: async () => {
    for (const f of pick.files) {
      try {
        const r = await fetch('/api/files?name=' + encodeURIComponent(f.name), { method: 'POST', body: f, headers: { 'Content-Type': f.type || 'application/octet-stream' }, credentials: 'same-origin' });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'caricamento non riuscito');
        const d = await r.json(); v.attachments.push({ id: d.id, name: d.name, size: d.size });
      } catch (e) { toast(`${f.name}: ${e.message}`); }
    }
    save(); renderThread(); } });
  const atts = (v.attachments.length || !done) ? h('div', { class: 'em-atts' },
    ...v.attachments.map((a, i) => h('span', { class: 'em-att' }, h('span', { html: icon('clip', 'sm') }),
      h('a', { href: `/api/files/${a.id}?download=1`, text: a.name }), h('small', { class: 'tnum', text: fmtSize(a.size) }),
      done ? null : h('button', { class: 'em-att-x', title: 'Togli', 'aria-label': `Togli ${a.name}`, html: icon('x', 'sm'),
        onclick: () => { v.attachments.splice(i, 1); save(); renderThread(); } }))),
    done ? null : h('button', { class: 'em-att-add', html: icon('clip', 'sm') + 'Allega', onclick: () => pick.click() }), pick) : null;
  return h('div', { class: 'email-card' + (done ? ' done' : '') },
    h('div', { class: 'em-head' }, h('b', { text: v.reply_to ? 'Risposta' : 'Email' }), h('span', { class: 'em-tools' }, copyB)),
    field('em-to', 'Destinatari', 'to'), field('em-subj', 'Oggetto', 'subject'), body, atts, foot);
}

// Procedura / runbook preparato da Aura con il template della Homebase: anteprima, poi Crea su Homebase o Annulla
const PR_LABELS = { text: 'Testo', title: 'Titolo', command: 'Comando', code: 'Codice', list: 'Elenco', note: 'Nota', warning: 'Attenzione',
  link: 'Link', expected: 'Risultato atteso', error: 'Errore comune', fix: 'Soluzione', important: 'Importante', prerequisite: 'Prerequisito',
  verify: 'Verifica', path: 'Percorso', registry: 'Registro', parameter: 'Parametri', output: 'Output', table: 'Tabella', keyvalue: 'Dati',
  screenshot: 'Immagine', section: 'Sezione', subsection: 'Sottosezione', group: 'Gruppo' };
function procedureView(chat, m) {
  const v = m.view, done = ['created', 'cancelled'].includes(v.status);
  const steps = (v.steps || []).map((s) => h('details', { class: 'pr-step', open: s.n === 1 ? true : null },
    h('summary', {}, h('span', { class: 'pr-n tnum', text: String(s.n) }), h('b', { text: s.title }), h('small', { text: `${s.blocks.length} blocchi` })),
    h('div', { class: 'pr-blocks' }, s.blocks.filter((b) => PR_LABELS[b.type] && (b.text || b.type === 'screenshot')).map((b) =>
      h('div', { class: 'pr-b pr-' + b.type }, h('span', { class: 'pr-t', text: PR_LABELS[b.type] }), h('span', { class: 'pr-x', text: b.text }))))));
  const create = async (btn) => {
    btn.disabled = true; btn.textContent = 'Creo…';
    try {
      const r = await (await api('/api/homebase/procedure/create', { zip_id: v.zip_id, title: v.title })).json();
      v.status = 'created'; v.url = r.url;
      m.content = (m.content || '') + ` [L'utente ha CREATO il ${v.tipo} nella Homebase: ${r.url}]`;
      saveChat(chat); renderThread(); toast(r.message || 'Creato nella Homebase');
    } catch (e) { btn.disabled = false; btn.textContent = 'Crea su Homebase'; toast(e.message); }
  };
  const cancel = () => {
    v.status = 'cancelled';
    m.content = (m.content || '') + ` [L'utente ha ANNULLATO: il ${v.tipo} non è stato creato.]`;
    saveChat(chat); renderThread();
  };
  const foot = v.status === 'cancelled'
    ? h('div', { class: 'em-done off' }, h('span', { html: icon('x', 'sm') }), h('span', { text: 'Annullato: non creato' }))
    : v.status === 'created'
    ? h('div', { class: 'em-done' }, h('span', { html: icon('check', 'sm') }), h('span', { text: 'Creato nella Homebase' }),
        h('a', { href: v.url, target: '_blank', rel: 'noopener', text: 'Apri' }))
    : (() => {
        const go = h('button', { class: 'btn sm primary', html: icon('up', 'sm') + 'Crea su Homebase', onclick: () => create(go) });
        return h('div', { class: 'em-actions' }, h('button', { class: 'btn sm em-cancel', html: icon('x', 'sm') + 'Annulla', onclick: cancel }), go);
      })();
  return h('div', { class: 'email-card proc-card' + (done ? ' done' : '') },
    h('div', { class: 'em-head' }, h('b', { text: v.tipo === 'runbook' ? 'Runbook' : 'Procedura' }),
      h('small', { class: 'pr-meta', text: [v.category, `${(v.steps || []).length} step`, v.images?.length ? `${v.images.length} immagini` : ''].filter(Boolean).join(' · ') })),
    h('div', { class: 'pr-title', text: v.title }),
    v.description ? h('div', { class: 'pr-desc', text: v.description }) : null,
    v.warnings?.length ? h('div', { class: 'pr-warn', text: 'Avvisi della Homebase: ' + v.warnings.join(' · ') }) : null,
    h('div', { class: 'pr-steps' }, steps), foot);
}

// Se la risposta ricopia il foglio che la scheda mostra gia', si vede una frase sola (il testo resta nella scheda)
function spEcho(content, views) {
  for (const v of views) {
    const lines = String(v.content || '').split('\n').map((l) => l.replace(/^\s*[-*] \[[ xX]\] /, '').trim()).filter((l) => l.length >= 6);
    const hits = lines.filter((l) => content.includes(l)).length;
    if (lines.length && (hits >= 2 || hits / lines.length >= 0.6)) return `Ecco ${v.archived ? 'lo scratchpad archiviato' : 'il foglio'} «${v.title}».`;
  }
  return null;
}
// Lo scratchpad della Homebase, disegnato come nella Homebase: fogli in alto, testo sotto, righe e caratteri in fondo
function scratchView(v) {
  const copy = h('button', { class: 'hbsp-act', type: 'button', html: icon('copy', 'sm') + 'Copia', onclick: () => copyText(v.content, copy) });
  const text = h('div', { class: 'hbsp-text' });
  // le checklist «- [ ]» e «- [x]» come nella Homebase
  String(v.content || '').split('\n').forEach((line) => {
    const m = line.match(/^(\s*)[-*] \[( |x|X)\] (.*)$/);
    text.append(m ? h('div', { class: 'hbsp-check' + (m[2] !== ' ' ? ' done' : '') }, h('span', { class: 'hbsp-box', html: m[2] !== ' ' ? icon('check', 'sm') : '' }), h('span', { text: m[3] }))
      : h('div', { class: 'hbsp-line', text: line || ' ' }));
  });
  // I fogli si toccano: la scheda carica quel foglio dalla Homebase e si ridisegna
  const open = async (i, t) => {
    if (t === v.title) return;
    card.classList.add('loading');
    try {
      const q = v.ids?.length ? `sheet=${encodeURIComponent(v.ids[i])}` : `nome=${encodeURIComponent(t)}`;
      card.replaceWith(scratchView(await (await api(`/api/homebase/scratchpad?${q}`)).json()));
    } catch (e) { card.classList.remove('loading'); toast(e.message); }
  };
  const card = h('div', { class: 'hbsp-card' },
    h('div', { class: 'hbsp-head' },
      h('span', { class: 'hbsp-ic', html: '<svg viewBox="0 0 24 24" class="i sm" aria-hidden="true"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>' }),
      h('b', { text: 'Scratchpad' }),
      v.archived ? h('span', { class: 'hbsp-badge', text: 'Archiviato' + (v.archived.date ? ' · ' + v.archived.date.slice(0, 10).split('-').reverse().join('/') : '') }) : null,
      h('span', { class: 'grow' }),
      h('a', { class: 'hbsp-act', href: v.link, target: '_blank', rel: 'noopener', html: icon('link', 'sm') + 'Homebase' })),
    v.archived ? h('div', { class: 'hbsp-tabs' }, h('span', { class: 'hbsp-tab on', text: v.title }))
      : h('div', { class: 'hbsp-tabs', role: 'tablist' }, ...(v.sheets?.length ? v.sheets : [v.title]).map((t, i) => h('button', { type: 'button', role: 'tab',
          class: 'hbsp-tab' + (t === v.title ? ' on' : ''), 'aria-selected': String(t === v.title), title: t, text: t, onclick: () => open(i, t) }))),
    v.content ? text : h('div', { class: 'hbsp-empty', text: 'Foglio vuoto' }),
    h('div', { class: 'hbsp-foot' }, h('span', { class: 'tnum', text: `${v.lines} righe · ${v.chars} caratteri` }), h('span', { class: 'grow' }), v.content ? copy : null));
  return card;
}

function fileChip(f) {
  return h('a', { class: 'file-chip', href: `/api/files/${f.id}?download=1`, title: `Scarica ${f.name}`, download: f.name },
    h('span', { html: icon('clip', 'sm') }), h('span', { class: 'fn', text: f.name }), f.size ? h('small', { text: fmtSize(f.size) }) : null);
}
let speaking = null;
async function speak(text, btn) {
  if (speaking) { speaking.audio.pause(); const was = speaking.btn; speaking.btn.classList.remove('on'); speaking = null; if (was === btn) return; }
  btn.classList.add('on');
  try {
    const r = await api('/api/tts', { text: text.slice(0, 3000) });
    const url = URL.createObjectURL(await r.blob()), audio = new Audio(url);
    speaking = { audio, btn };
    audio.onended = () => { btn.classList.remove('on'); URL.revokeObjectURL(url); if (speaking?.audio === audio) speaking = null; };
    await audio.play();
  } catch (e) { btn.classList.remove('on'); speaking = null; toast(e.message); }
}

function editEl(chat, m, i) {
  const ta = h('textarea', { 'aria-label': 'Modifica messaggio' }); ta.value = m.content;
  const grow = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
  ta.addEventListener('input', grow);
  const submit = () => {
    const text = ta.value.trim(); if (!text) return;
    S.editing = null; chat.messages = chat.messages.slice(0, i); chat.messages.push({ ...m, content: text });
    saveChat(chat); run(chat);
  };
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isMobile()) { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { S.editing = null; renderThread(); }
  });
  const box = h('div', { class: 'msg user' }, h('div', { class: 'edit-box' }, ta,
    h('div', { class: 'row' },
      h('button', { class: 'btn sm', text: 'Annulla', onclick: () => { S.editing = null; renderThread(); } }),
      h('button', { class: 'btn sm primary', text: 'Invia', onclick: submit }))));
  requestAnimationFrame(() => { grow(); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); });
  return box;
}

// ================================================================ scrolling
const scroller = $('#scroller');
const nearBottom = (px = 120) => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < px;
// Segue il testo che arriva solo finche' l'utente sta in fondo: se scorre in su si ferma, se torna giu' riprende
let follow = true, lastTop = 0;
function scrollToBottom(instant) { follow = true; scroller.scrollTo({ top: scroller.scrollHeight, behavior: instant ? 'instant' : 'smooth' }); }
scroller.addEventListener('scroll', () => {
  if (scroller.scrollTop < lastTop - 2) follow = false;   // l'utente e' salito (rotella, dito, barra, tastiera)
  if (nearBottom(40)) follow = true;
  lastTop = scroller.scrollTop;
  $('#toBottom').classList.toggle('hidden', nearBottom() || $('#main').classList.contains('empty'));
}, { passive: true });
scroller.addEventListener('wheel', (e) => { if (e.deltaY < 0) follow = false; }, { passive: true });
$('#toBottom').onclick = () => scrollToBottom();
const keepFollowing = () => { if (follow) { scroller.scrollTop = scroller.scrollHeight; lastTop = scroller.scrollTop; } };

// ================================================================= composer
function upgradeSelect(sel) {
  if (sel.dataset.dd || sel.multiple) return;
  sel.dataset.dd = '1';
  const label = h('span', { class: 'dd-l' });
  const btn = h('button', { type: 'button', class: 'dd-btn ' + sel.className, 'aria-haspopup': 'listbox', 'aria-expanded': 'false',
    'aria-label': sel.getAttribute('aria-label') || '' }, label, h('span', { class: 'dd-c', html: icon('chevron', 'sm') }));
  const menu = h('div', { class: 'dd-menu', role: 'listbox', hidden: true });
  const wrap = h('span', { class: 'dd' + (sel.classList.contains('ag-in') ? ' dd-block' : '') });
  const sync = () => {
    const o = sel.selectedOptions[0] || sel.options[0];
    label.textContent = o ? o.textContent : '';
    btn.classList.toggle('on', sel.classList.contains('on'));
  };
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('pointerdown', outside, true); };
  const outside = (e) => { if (!wrap.contains(e.target)) close(); };
  const open = () => {
    menu.replaceChildren(...[...sel.options].filter((o) => !(o.value === '' && o.index === 0 && sel.options.length > 1)).map((o) =>
      h('button', { type: 'button', role: 'option', class: 'dd-opt' + (o.value === sel.value ? ' sel' : ''), 'aria-selected': String(o.value === sel.value),
        onclick: () => { sel.value = o.value; sel.dispatchEvent(new Event('change', { bubbles: true })); sync(); close(); btn.focus(); } },
        h('span', { text: o.textContent }), o.value === sel.value ? h('span', { class: 'dd-check', html: icon('check', 'sm') }) : null)));
    menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
    // se sotto non c'e' spazio, si apre verso l'alto
    const r = btn.getBoundingClientRect();
    wrap.classList.toggle('up', innerHeight - r.bottom < Math.min(280, menu.scrollHeight + 12) && r.top > innerHeight - r.bottom);
    (menu.querySelector('.sel') || menu.firstChild)?.focus();
    document.addEventListener('pointerdown', outside, true);
  };
  btn.onclick = () => (menu.hidden ? open() : close());
  menu.addEventListener('keydown', (e) => {
    const items = [...menu.querySelectorAll('.dd-opt')], i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus(); }
    if (e.key === 'Escape') { e.preventDefault(); close(); btn.focus(); }
  });
  sel.addEventListener('change', sync);
  sel.replaceWith(wrap);
  wrap.append(sel, btn, menu);
  sel.hidden = true; sel.tabIndex = -1;
  sync();
}
new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) {
  if (n.nodeType !== 1) continue;
  if (n.tagName === 'SELECT') upgradeSelect(n); else n.querySelectorAll?.('select').forEach(upgradeSelect);
} }).observe(document.body, { childList: true, subtree: true });

const APP_VER = document.querySelector('script[src*="/static/app.js"]')?.src.split('v=')[1] || '';
async function checkUpdate() {
  if (!APP_VER || document.hidden) return;
  try {
    const { v } = await (await fetch('/api/app/version', { cache: 'no-store' })).json();
    if (!v || v === APP_VER) return;
    const busy = S.stream || input.value.trim() || document.querySelector('.ag-modal, .email-card:not(.done) textarea:focus');
    if (!busy) location.reload();   // niente in corso: si ricarica e basta
    else if (!$('#updBar')) document.body.append(h('button', { id: 'updBar', class: 'upd-bar', text: 'C\'è una versione nuova di Cerini IA: tocca per aggiornare', onclick: () => location.reload() }));
  } catch {}
}
setInterval(checkUpdate, 120000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdate(); });

// al massimo: la chat deve restare larga almeno 520 px (barra laterale compresa), e mai oltre 720 px di pannello
const BRAIN_MIN = 300, brainMax = () => Math.max(BRAIN_MIN, Math.min(720, innerWidth - ($('#side')?.getBoundingClientRect().width || 0) - 520));
function setBrainW(w, save) {
  w = Math.max(BRAIN_MIN, Math.min(brainMax(), Math.round(w)));
  document.documentElement.style.setProperty('--brain-w', w + 'px');
  if (save) pref.set('brainW', w);
}
setBrainW(Number(pref.get('brainW', BRAIN_MIN)) || BRAIN_MIN);
addEventListener('resize', () => setBrainW(Number(pref.get('brainW', BRAIN_MIN)) || BRAIN_MIN));
document.addEventListener('pointerdown', (e) => {
  if (e.target.id !== 'brainResize') return;
  e.preventDefault();
  document.body.classList.add('brain-resizing');
  const move = (ev) => setBrainW(innerWidth - ev.clientX);
  const up = (ev) => { setBrainW(innerWidth - ev.clientX, true); document.body.classList.remove('brain-resizing');
    removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
  addEventListener('pointermove', move); addEventListener('pointerup', up);
});
document.addEventListener('dblclick', (e) => { if (e.target.id === 'brainResize') setBrainW(BRAIN_MIN, true); });

const input = $('#input');
function focusInput() { if (!isMobile()) setTimeout(() => input.focus(), 0); }
function autosize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, innerHeight * 0.4) + 'px'; }
input.addEventListener('input', () => { autosize(); renderComposer(); slashMenu(); });
input.addEventListener('keydown', (e) => {
  const menu = $('#slashMenu');
  if (menu && !menu.hidden) {
    const items = [...menu.querySelectorAll('.sl-item')], on = items.findIndex((x) => x.classList.contains('on'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[on]?.classList.remove('on'); items[(on + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.classList.add('on'); return; }
    if ((e.key === 'Enter' || e.key === 'Tab') && items[on]) { e.preventDefault(); items[on].click(); return; }
    if (e.key === 'Escape') { menu.hidden = true; return; }
  }
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !isMobile()) { e.preventDefault(); $('#composer').requestSubmit(); }
});
let SKILLS = null;
async function slashMenu() {
  let menu = $('#slashMenu');
  const m = input.value.match(/^\/([\w-]*)$/);
  if (!m) { if (menu) menu.hidden = true; return; }
  if (!SKILLS) { try { SKILLS = (await (await api('/api/brain/tree')).json()).skills; } catch { SKILLS = []; } }
  const list = SKILLS.filter((s) => (s.slug + ' ' + s.name).toLowerCase().includes(m[1].toLowerCase()));
  if (!menu) { menu = h('div', { id: 'slashMenu', class: 'slash-menu', role: 'listbox' }); $('#composer').append(menu); }
  menu.hidden = !list.length;
  menu.replaceChildren(...list.map((s, i) => h('button', { type: 'button', class: 'sl-item' + (i === 0 ? ' on' : ''), role: 'option',
    onclick: () => { input.value = `/${s.slug} `; menu.hidden = true; input.focus(); autosize(); renderComposer(); } },
    h('b', { text: '/' + s.slug }), h('span', { text: s.summary || s.name }))));
}

function renderComposer() {
  const s = S.status, m = activeModel(), streaming = !!S.stream;
  const online = canChat();
  const send = $('#sendBtn');
  send.innerHTML = streaming ? '<span class="stop"></span>' : icon('up');
  send.setAttribute('aria-label', streaming ? 'Interrompi' : 'Invia');
  const uploading = (S.files || []).some((f) => f.uploading);
  send.disabled = !streaming && (!online || !m || uploading || (!input.value.trim() && !S.attachments.length && !(S.files || []).length));
  $('#attachBtn').classList.remove('hidden');
  const mic = $('#micBtn');
  mic.classList.toggle('hidden', !S.me?.voice || !navigator.mediaDevices || !window.MediaRecorder);
  const vb = $('#voiceBtn');
  vb.classList.toggle('hidden', !S.me?.voice || !navigator.mediaDevices || !window.MediaRecorder);
  vb.disabled = !window.isSecureContext || streaming || !online;
  mic.disabled = !window.isSecureContext || streaming;
  mic.title = window.isSecureContext ? 'Detta (parla e trascrivo)' : 'Il microfono funziona solo da un indirizzo https';
  const tb = $('#thinkBtn');
  tb.classList.toggle('hidden', !hasCap('thinking'));
  tb.setAttribute('aria-pressed', S.think);
  const att = $('#attachments');
  S.files = S.files || [];
  att.classList.toggle('hidden', !S.attachments.length && !S.files.length);
  att.replaceChildren(...S.attachments.map((src, i) => h('div', { class: 'att' }, h('img', { src, alt: '' }),
    h('button', { type: 'button', 'aria-label': 'Rimuovi immagine', html: icon('x'), onclick: () => { S.attachments.splice(i, 1); const im = S.files.filter((f) => f.image)[i]; if (im) S.files.splice(S.files.indexOf(im), 1); renderComposer(); } }))),
    ...S.files.map((f, i) => f.image ? '' : h('div', { class: 'att file' + (f.uploading ? ' up' : '') },
      h('span', { class: 'fi', html: icon('clip', 'sm') }), h('span', { class: 'fn', text: f.name, title: f.name }),
      h('small', { text: f.uploading ? 'carico…' : fmtSize(f.size) }),
      h('button', { type: 'button', 'aria-label': 'Rimuovi file', html: icon('x'), onclick: () => { S.files.splice(i, 1); renderComposer(); } }))));

  const hint = $('#hint'); hint.replaceChildren(); hint.classList.remove('quiet');
  if (!s) hint.textContent = '';
  else if (!online) {
    hint.append(h('span', { text: s.unreachable ? 'Server non raggiungibile.' : 'Il PC è spento.' }));
    const booting = S.powering && Date.now() - S.powering < 180000;
    if (booting) hint.append(h('span', { class: 'spinner' }), h('span', { text: ` Accensione in corso… (${Math.round((Date.now() - S.powering) / 1000)} s)` }));
    else if (S.wol && !s.unreachable) hint.append(h('button', { class: 'btn sm', html: icon('power', 'sm') + 'Accendi il PC', onclick: wake }));
  } else if (S.busyModel) hint.append(h('span', { class: 'spinner' }), h('span', { text: `Accendo ${S.busyModel}…` }));
  else if (m && !loadedNames().has(m)) hint.textContent = `${m} è spento: il primo messaggio lo accende, ci vorrà qualche secondo in più.`;
  else { hint.textContent = isCloudM(m) ? `Le risposte arrivano da ${m.slice(6)}, nel cloud (fuori casa), e possono contenere errori.` : 'Le risposte sono generate sul PC di casa e possono contenere errori.'; hint.classList.add('quiet'); }
  if ($('#main').classList.contains('empty')) renderHero();
}
$('#thinkBtn').onclick = () => { S.think = !S.think; pref.set('think', S.think); renderComposer(); };
$('#attachBtn').onclick = () => $('#fileInput').click();
$('#fileInput').onchange = (e) => { addFiles(e.target.files); e.target.value = ''; };
function pastedFiles(dt) {
  if (!dt) return [];
  const items = [...(dt.items || [])].filter((it) => it.kind === 'file');
  const imgs = items.filter((it) => it.type.startsWith('image/')).map((it) => it.getAsFile()).filter(Boolean);
  const files = imgs.length ? imgs : [...(dt.files || [])];
  const stamp = new Date().toLocaleTimeString('it-IT').replace(/:/g, '');
  // il browser chiama «image.png» ogni immagine incollata: le si da' un nome riconoscibile
  return files.map((f, i) => /^image\.\w+$/i.test(f.name || 'image.png')
    ? new File([f], `screenshot-${stamp}${files.length > 1 ? '-' + (i + 1) : ''}.${(f.type.split('/')[1] || 'png').replace('jpeg', 'jpg')}`, { type: f.type })
    : f);
}
document.addEventListener('paste', (e) => {
  const tgt = e.target;
  if (tgt !== input && tgt?.closest?.('input, textarea, [contenteditable="true"]')) return;   // dentro altri campi: incolla normale
  if ($('#app').classList.contains('hidden')) return;
  const files = pastedFiles(e.clipboardData);
  if (files.length) { e.preventDefault(); addFiles(files); }
});
const comp = $('#composer');
['dragenter', 'dragover'].forEach((t) => $('#main').addEventListener(t, (e) => { if (e.dataTransfer?.types.includes('Files')) { e.preventDefault(); comp.classList.add('drag'); } }));
['dragleave', 'drop'].forEach((t) => $('#main').addEventListener(t, (e) => { if (t === 'dragleave' && $('#main').contains(e.relatedTarget)) return; comp.classList.remove('drag'); }));
$('#main').addEventListener('drop', (e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); addFiles(e.dataTransfer.files); } });

function fmtSize(n) { return n < 1024 ? `${n} B` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`; }
async function addFiles(files) {
  S.files = S.files || [];
  const list = [...files].slice(0, 10);
  // le foto le vede direttamente il modello (se puo'); tutto il resto va sul server e Aura lo legge con gli strumenti
  for (const f of list.filter((f) => f.type.startsWith('image/') && hasCap('vision') && S.attachments.length < 6)) {
    try { S.attachments.push(await shrink(f)); } catch { toast('Immagine non leggibile: ' + f.name); continue; }
    if (f.size > 25 * 1048576) continue;
    const item = { name: f.name, size: f.size, uploading: true, image: true };
    S.files.push(item); renderComposer();
    fetch('/api/files?name=' + encodeURIComponent(f.name), { method: 'POST', body: f, headers: { 'Content-Type': f.type || 'image/png' }, credentials: 'same-origin' })
      .then(async (r) => { if (!r.ok) throw new Error(); Object.assign(item, await r.json(), { uploading: false, image: true }); })
      .catch(() => { S.files.splice(S.files.indexOf(item), 1); })
      .finally(renderComposer);
  }
  const others = list.filter((f) => !(f.type.startsWith('image/') && hasCap('vision')));
  for (const f of others) {
    if (f.size > 25 * 1048576) { toast(`«${f.name}» è troppo grande (massimo 25 MB)`); continue; }
    const item = { name: f.name, size: f.size, uploading: true };
    S.files.push(item); renderComposer();
    try {
      const r = await fetch('/api/files?name=' + encodeURIComponent(f.name), { method: 'POST', body: f, headers: { 'Content-Type': f.type || 'application/octet-stream' }, credentials: 'same-origin' });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `errore ${r.status}`);
      Object.assign(item, await r.json(), { uploading: false });
    } catch (e) { S.files.splice(S.files.indexOf(item), 1); toast(`Non sono riuscito a caricare «${f.name}»: ${e.message}`); }
    renderComposer();
  }
  renderComposer(); focusInput();
}
function shrink(file, max = 1536) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = h('canvas', { width: Math.round(img.width * k), height: Math.round(img.height * k) });
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url); res(cv.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(); };
    img.src = url;
  });
}

comp.addEventListener('submit', (e) => {
  e.preventDefault();
  if (S.stream) { S.stream.controller.abort(); return; }
  const text = input.value.trim();
  S.files = S.files || [];
  if (S.files.some((f) => f.uploading)) return;
  if ((!text && !S.attachments.length && !S.files.length) || !canChat() || !activeModel()) return;
  let c = current();
  if (!c) {
    c = { id: uid(), title: 'Nuova chat', created: Date.now(), updated: Date.now(), model: activeModel(), messages: [] };
    S.chats.unshift(c); S.currentId = c.id;
  }
  c.model = c.model || activeModel();
  c.messages = c.messages.filter((m) => m.role !== 'error');
  const msg = { role: 'user', content: text };
  if (S.attachments.length) msg.images = S.attachments.slice();
  if (S.files.length) msg.files = S.files.map((f) => ({ id: f.id, name: f.name, size: f.size, mime: f.mime, ...(f.image ? { image: true } : {}) }));
  c.messages.push(msg);
  if (c.title === 'Nuova chat') c.title = (text || S.files[0]?.name || 'Immagine').replace(/\s+/g, ' ').slice(0, 48);
  input.value = ''; S.attachments = []; S.files = []; autosize();
  saveChat(c); run(c);
});

// ============================================================ scheda sito
// Il menu letto (o appena modificato) dal sito si disegna come sul sito, invece che come elenco di testo.
const COURSE_LABELS = { primo: 'Primo', secondo: 'Secondo', contorno: 'Contorno', dolce: 'Dolce' };
const svPrice = (v) => (v && v !== '0,00' ? `${v} €` : '');

function svProduct(p, origin) {
  const photo = p.foto && origin
    ? h('div', { class: 'sv-photo' }, h('img', { src: `${origin}/${p.foto.url}`, alt: p.nome, loading: 'lazy', decoding: 'async', style: `object-position:${p.foto.x}% ${p.foto.y}%` }))
    : null;
  const badges = [p.del_giorno ? 'Del giorno' : null, p.etichetta || null].filter(Boolean).map((t) => h('span', { class: 'sv-badge', text: t }));
  if (!p.visibile) badges.push(h('span', { class: 'sv-badge off', text: 'Nascosto' }));
  let price = null;
  if (p.prezzo2) {
    const [l1, l2] = p.tipo_prezzo === 'piccola/media' ? ['Piccola', 'Media'] : ['Calice', 'Bottiglia'];
    price = h('span', { class: 'sv-wine' }, h('span', {}, l1, h('strong', { text: svPrice(p.prezzo) })), h('span', {}, l2, h('strong', { text: svPrice(p.prezzo2) })));
  } else if (svPrice(p.prezzo)) price = h('strong', { text: svPrice(p.prezzo) });
  return h('article', { class: 'sv-card' + (photo ? '' : ' no-photo') + (p.visibile ? '' : ' off') }, photo,
    h('div', { class: 'sv-body' },
      badges.length ? h('div', { class: 'sv-badges' }, badges) : null,
      h('div', { class: 'sv-title' }, h('h3', {}, p.nome, p.id ? h('span', { class: 'sv-id', text: `#${p.id}` }) : null), price),
      p.descrizione ? h('p', { text: p.descrizione }) : null,
      p.allergeni?.length ? h('div', { class: 'sv-allergens' }, h('b', { text: 'Allergeni' }), p.allergeni.map((a) => h('span', { text: a }))) : null));
}

function svDaily(m) {
  const head = h('div', { class: 'sv-dm-head' },
    h('div', {}, h('span', { class: 'sv-eyebrow', text: m.giorno }), h('h3', {}, 'Menu del giorno', m.pubblicato ? null : h('span', { class: 'sv-unpub', text: 'Non pubblicato' }))),
    m.prezzo_menu ? h('div', { class: 'sv-dm-price' }, h('strong', { text: svPrice(m.prezzo_menu) }), m.nota ? h('span', { text: m.nota }) : null) : null);
  const courses = Object.keys(COURSE_LABELS).filter((k) => m.portate?.[k]?.length).map((k) =>
    h('section', { class: 'sv-course' }, h('h4', { text: COURSE_LABELS[k] }),
      m.portate[k].map((d) => h('div', { class: 'sv-dish' }, h('div', {}, h('b', { text: d.nome }), d.descrizione ? h('p', { text: d.descrizione }) : null), d.prezzo ? h('strong', { text: svPrice(d.prezzo) }) : null))));
  return h('article', { class: 'sv-daymenu' }, head, courses,
    !m.prezzo_menu && m.nota ? h('p', { class: 'sv-dm-foot', text: m.nota }) : null,
    h('p', { class: 'sv-dm-foot', text: 'Allergie o intolleranze? Chiedi al personale prima di ordinare.' }));
}

const EV_DAYS = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
const EV_MONTHS = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
function svEvent(e, origin) {
  const goloso = String(e.tipo || '').includes('golos');
  const d = /^\d{4}-\d{2}-\d{2}$/.test(e.data || '') ? new Date(e.data + 'T12:00:00') : null;
  const src = e.foto?.data || (e.foto?.url && origin ? `${origin}/${e.foto.url}` : null);
  const media = h('div', { class: 'sv-ev-media' },
    src ? h('img', { src, alt: e.titolo || '', loading: 'lazy' }) : h('div', { class: 'sv-ev-nophoto', text: 'Senza foto' }),
    d ? h('div', { class: 'sv-ev-date' }, h('span', { text: EV_DAYS[d.getDay()] }), h('b', { text: d.getDate() }), h('span', { text: EV_MONTHS[d.getMonth()] })) : null,
    e.stato === 'in corso' ? h('span', { class: 'sv-ev-now', text: goloso ? 'Oggi nel menu' : 'Oggi' }) : null);
  const meta = [e.ora ? `Dalle ${e.ora}` : null, e.giorno_fine ? `Fino a ${e.giorno_fine}` : null, d ? null : e.data].filter(Boolean).join(' · ');
  const pz = e.piatto || {};
  const badges = [!e.pubblicato ? h('span', { class: 'sv-badge off', text: 'Non pubblicato' }) : null, e.stato === 'passato' ? h('span', { class: 'sv-badge', text: 'Passato' }) : null].filter(Boolean);
  return h('article', { class: 'sv-event' + (goloso ? ' is-goloso' : '') + (e.stato === 'passato' ? ' is-past' : '') }, media,
    h('div', { class: 'sv-ev-body' },
      badges.length ? h('div', { class: 'sv-badges' }, badges) : null,
      h('span', { class: 'sv-ev-kind', text: goloso ? 'Appuntamento goloso' : (e.stato === 'passato' ? 'Passato' : 'Evento') }),
      h('h3', {}, e.titolo || '', e.id ? h('span', { class: 'sv-id', text: `#${e.id}` }) : null),
      meta ? h('div', { class: 'sv-ev-meta', text: meta }) : null,
      e.descrizione ? h('p', { text: e.descrizione }) : null,
      goloso && (pz.nome || pz.prezzo) ? h('div', { class: 'sv-ev-dish' }, h('span', { text: pz.nome || 'La proposta' }), pz.prezzo ? h('strong', { text: svPrice(pz.prezzo) }) : null) : null,
      pz.allergeni?.length ? h('div', { class: 'sv-allergens' }, h('b', { text: 'Allergeni' }), pz.allergeni.map((a) => h('span', { text: a }))) : null));
}

function svSection(title, tag, items, origin) {
  return h('section', {}, h('div', { class: 'sv-section-title' }, h('h2', { text: title }), h('span', { text: tag })),
    h('div', { class: 'sv-grid' }, items.map((p) => svProduct(p, origin))));
}

function siteView(v) {
  const d = v.data || {}, origin = v.origin || '';
  const box = h('div', { class: 'site-view' },
    h('div', { class: 'sv-head' }, h('span', { text: `${S.me?.site_name || 'Sito'} · ${d.eventi ? 'eventi' : 'menu'}` }), origin ? h('a', { href: `${origin}/${d.eventi ? 'eventi' : 'menu'}`, target: '_blank', rel: 'noopener noreferrer', text: 'Apri sul sito' }) : null));
  (d.menu_del_giorno || []).forEach((m) => box.append(svDaily(m)));
  const n = (x) => `${x} ${x === 1 ? 'PROPOSTA' : 'PROPOSTE'}`;
  if (d.proposte_del_giorno?.length) box.append(svSection('Le proposte del giorno', n(d.proposte_del_giorno.length), d.proposte_del_giorno, origin));
  if (d.prodotti) {
    const groups = new Map();
    d.prodotti.forEach((p) => { if (!groups.has(p.categoria)) groups.set(p.categoria, []); groups.get(p.categoria).push(p); });
    groups.forEach((items, cat) => box.append(svSection(cat, n(items.length), items, origin)));
    if (!d.prodotti.length) box.append(h('p', { class: 'sv-empty', text: 'Nessun prodotto trovato.' }));
  }
  if (d.eventi) {
    box.append(h('section', {}, h('div', { class: 'sv-section-title' }, h('h2', { text: 'Eventi & novità' }), h('span', { text: `${d.eventi.length} ${d.eventi.length === 1 ? 'APPUNTAMENTO' : 'APPUNTAMENTI'}` })),
      d.eventi.length ? h('div', { class: 'sv-events' }, d.eventi.map((e) => svEvent(e, origin))) : h('p', { class: 'sv-empty', text: 'Nessun evento in programma.' })));
  }
  if (box.children.length === 1) box.append(h('p', { class: 'sv-empty', text: 'Nessun menu del giorno e nessuna proposta del giorno al momento.' }));
  return box;
}

// =================================================================== copia
// Il browser copia i paragrafi con righe vuote in piu' e anche i pulsanti: qui si mette negli appunti solo il testo, pulito.
document.addEventListener('copy', (e) => {
  const sel = getSelection();
  if (!sel || sel.isCollapsed || !$('#thread').contains(sel.anchorNode)) return;
  const box = document.createElement('div');
  for (let i = 0; i < sel.rangeCount; i++) box.append(sel.getRangeAt(i).cloneContents());
  box.querySelectorAll('.msg-actions, .think summary, .cp-label, .sv-head a, .sv-id, .row, button, .typing').forEach((x) => x.remove());
  // Via gli "a capo" dell'HTML tra un tag e l'altro, poi una riga per voce di elenco e una riga vuota tra i paragrafi
  const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  const blanks = [];
  while (walker.nextNode()) if (!walker.currentNode.textContent.trim() && !walker.currentNode.parentElement?.closest('pre')) blanks.push(walker.currentNode);
  blanks.forEach((n) => n.remove());
  box.querySelectorAll('li, tr, .sv-card, .sv-dish, .tool-card').forEach((x) => x.append('\n'));
  box.querySelectorAll('li > p').forEach((x) => x.append(' '));
  box.querySelectorAll('p, h1, h2, h3, h4, pre, ul, ol, table, .bubble, .sv-event, .codeblock').forEach((x) => { if (!x.closest('li')) x.append('\n\n'); });
  box.querySelectorAll('td, th').forEach((x) => x.append('\t'));
  box.querySelectorAll('br').forEach((x) => x.replaceWith('\n'));
  box.style.cssText = 'position:fixed;left:-9999px;white-space:pre-wrap';
  document.body.append(box);
  const text = box.textContent.replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  box.remove();
  e.clipboardData.setData('text/plain', text);
  e.preventDefault();
});

// ================================================================= memoria
// Ricordi e documenti dell'utente. In cima il grafo del cervello, come quello di Obsidian: un pallino per scheda, una linea per collegamento.
const MEM_COLORS = { ricordo: 'oklch(0.68 0.16 262)', documento: 'oklch(0.72 0.14 150)' };
const GRAPH_KINDS = {
  me: ['Tu', 'oklch(0.78 0.15 85)'], projects: ['Progetti', 'oklch(0.66 0.17 262)'], people: ['Persone', 'oklch(0.72 0.15 150)'],
  companies: ['Aziende', 'oklch(0.72 0.15 40)'], places: ['Luoghi', 'oklch(0.7 0.13 200)'], services: ['Servizi', 'oklch(0.7 0.14 310)'],
  things: ['Cose', 'oklch(0.7 0.06 260)'], diary: ['Giorni del diario', 'oklch(0.6 0.01 260)'],
};
const GRAPH_ONE = { me: 'tu', projects: 'progetto', people: 'persona', companies: 'azienda', places: 'luogo', services: 'servizio', things: 'cosa', diary: 'giorno del diario' };
let memStop = null;

function closeMemory() { $('#main').classList.remove('memory-open'); if (memStop) { memStop(); memStop = null; } }
async function openMemory() {
  closeSide(); togglePicker(false); closeViews();
  $('#main').classList.add('memory-open');
  await renderMemory();
}
$('#memoryBtn').onclick = openMemory;
async function refreshMemoryCount() {
  try { const d = await (await api('/api/memory')).json(); $('#memoryCount').textContent = d.items.filter((i) => i.kind === 'ricordo').length || ''; } catch {}
}

function brainGraph(data, onOpen) {
  // grafo 3D come quello di Obsidian: le forze dispongono i pallini nello spazio, si ruota trascinando
  const box = h('div', { class: 'mem-map graph' });
  const N = data.nodes.map((n, i) => {   // partenza su una sfera (spirale di Fibonacci): niente pallini sovrapposti
    const k = (i + 0.5) / Math.max(1, data.nodes.length), phi = Math.acos(1 - 2 * k), th = Math.PI * (1 + Math.sqrt(5)) * i, r = 80;
    return { ...n, i, x: r * Math.sin(phi) * Math.cos(th), y: r * Math.sin(phi) * Math.sin(th), z: r * Math.cos(phi), vx: 0, vy: 0, vz: 0 };
  });
  const byId = new Map(N.map((n) => [n.id, n]));
  const L = data.links.map(([a, b]) => [byId.get(a), byId.get(b)]).filter(([a, b]) => a && b);
  const nb = new Map(N.map((n) => [n, new Set()]));
  L.forEach(([a, b]) => { nb.get(a).add(b); nb.get(b).add(a); });
  if (!N.length) { box.append(h('div', { class: 'mem-empty-map', text: 'Il cervello è ancora vuoto.' })); return { el: box, stop() {} }; }
  const cv = h('canvas'), tip = h('div', { class: 'mem-tip hidden' });
  box.append(cv, tip);
  const size = (n) => n.kind === 'diary' ? 3.2 : n.kind === 'me' ? 8.5 : 4.5 + Math.min(7, Math.sqrt(n.deg) * 2);
  let rx = -0.3, ry = 0, zoom = 1, auto = true, drag = null, hover = null, raf = 0, last = performance.now(), proj = [];
  const step = () => {   // si respingono tutti, i collegamenti tirano, il centro trattiene
    for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
      const a = N[i], b = N[j]; let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z; const d2 = dx * dx + dy * dy + dz * dz || 0.01, f = 1600 / d2;
      dx *= f; dy *= f; dz *= f; a.vx += dx; a.vy += dy; a.vz += dz; b.vx -= dx; b.vy -= dy; b.vz -= dz;
    }
    L.forEach(([a, b]) => {
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, d = Math.hypot(dx, dy, dz) || 1, want = a.kind === 'diary' || b.kind === 'diary' ? 40 : 60;
      const f = (d - want) * 0.05 / d; a.vx += dx * f; a.vy += dy * f; a.vz += dz * f; b.vx -= dx * f; b.vy -= dy * f; b.vz -= dz * f;
    });
    N.forEach((n) => {
      n.vx -= n.x * 0.01; n.vy -= n.y * 0.01; n.vz -= n.z * 0.01;
      n.x += Math.max(-15, Math.min(15, n.vx)); n.y += Math.max(-15, Math.min(15, n.vy)); n.z += Math.max(-15, Math.min(15, n.vz));
      n.vx *= 0.5; n.vy *= 0.5; n.vz *= 0.5;
    });
  };
  for (let k = 0; k < 600; k++) step();
  const ext = Math.max(40, ...N.map((n) => Math.hypot(n.x, n.y, n.z)));   // quanto e' grande la nuvola: serve a farla stare nel riquadro
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const draw = (now) => {
    const dt = Math.min(64, now - last); last = now;
    if (auto && !drag) ry += dt * 0.00015;
    const dpr = devicePixelRatio || 1, w = box.clientWidth, hh = box.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(hh * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
    const S = Math.min(w, hh) * 0.42 / ext * zoom, cam = ext * 3.2, cx = w / 2, cy = hh / 2;
    const cr = Math.cos(rx), sr = Math.sin(rx), cyw = Math.cos(ry), syw = Math.sin(ry);
    proj = N.map((n) => {
      const x1 = n.x * cyw + n.z * syw, z1 = -n.x * syw + n.z * cyw, y1 = n.y * cr - z1 * sr, z2 = n.y * sr + z1 * cr;
      const f = cam / (cam - z2);   // prospettiva: quello davanti e' piu' grande
      return { n, sx: cx + x1 * f * S, sy: cy + y1 * f * S, f, depth: (z2 / ext + 1) / 2 };
    });
    const P = new Map(proj.map((p) => [p.n, p]));
    const lit = hover ? new Set([hover, ...nb.get(hover)]) : null;
    const line = css('--text-3'), text = css('--text'), accent = css('--accent');
    g.lineWidth = 1;
    L.forEach(([a, b]) => {
      const A = P.get(a), B = P.get(b), on = lit && (a === hover || b === hover);
      g.strokeStyle = on ? accent : line;
      g.globalAlpha = lit ? (on ? 0.9 : 0.05) : 0.12 + 0.3 * (A.depth + B.depth) / 2;
      g.beginPath(); g.moveTo(A.sx, A.sy); g.lineTo(B.sx, B.sy); g.stroke();
    });
    g.font = '11.5px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    [...proj].sort((p, q) => p.depth - q.depth).forEach((p) => {   // da dietro in avanti
      const n = p.n, r = size(n) * p.f * Math.sqrt(zoom) * (n === hover ? 1.35 : 1);
      const dim = lit && !lit.has(n);
      g.globalAlpha = dim ? 0.12 : 0.35 + 0.65 * p.depth;
      g.fillStyle = (GRAPH_KINDS[n.kind] || GRAPH_KINDS.things)[1];
      g.beginPath(); g.arc(p.sx, p.sy, r, 0, Math.PI * 2); g.fill();
      if (n.kind !== 'diary' || (lit && lit.has(n)) || zoom > 1.8) {   // i nomi: le schede sempre, i giorni da vicino o accanto al pallino puntato
        g.globalAlpha = dim ? 0.08 : (n.kind === 'diary' ? 0.55 : 0.25 + 0.7 * p.depth);
        g.fillStyle = text; g.fillText(n.name, p.sx, p.sy + r + 3);
      }
    });
    g.globalAlpha = 1;
    if (hover && P.get(hover)) { const p = P.get(hover); tip.style.left = p.sx + 'px'; tip.style.top = (p.sy - size(hover) * p.f - 6) + 'px'; }
    raf = requestAnimationFrame(draw);
  };
  const at = (e) => {
    const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = null, bd = Infinity;
    proj.forEach((p) => { const d = Math.hypot(p.sx - mx, p.sy - my); if (d < size(p.n) * p.f * Math.sqrt(zoom) + 6 && d < bd) { bd = d; best = p; } });
    return best?.n || null;
  };
  box.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, rx, ry, moved: false, node: at(e) }; box.setPointerCapture(e.pointerId); });
  box.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) { drag.moved = true; auto = false; }
      ry = drag.ry + dx * 0.008; rx = Math.max(-1.5, Math.min(1.5, drag.rx + dy * 0.008));
      return;
    }
    hover = at(e); box.style.cursor = hover ? 'pointer' : '';
    tip.classList.toggle('hidden', !hover);
    if (hover) tip.textContent = `${hover.name} · ${GRAPH_ONE[hover.kind] || 'scheda'} · ${hover.deg} collegament${hover.deg === 1 ? 'o' : 'i'}`;
  });
  box.addEventListener('pointerup', () => { const d = drag; drag = null; if (d && !d.moved && d.node) onOpen(d.node); });
  box.addEventListener('pointerleave', () => { hover = null; tip.classList.add('hidden'); });
  box.addEventListener('wheel', (e) => { e.preventDefault(); zoom = Math.max(0.4, Math.min(4, zoom * Math.exp(-e.deltaY * 0.0015))); }, { passive: false });
  box.addEventListener('dblclick', () => { auto = true; zoom = 1; rx = -0.3; });
  raf = requestAnimationFrame(draw);
  return { el: box, stop: () => cancelAnimationFrame(raf) };
}

function memoryMap(items, onPick) {
  const box = h('div', { class: 'mem-map' });
  const pts = items.filter((i) => i.xyz).map((i) => ({ i, x: i.xyz[0], y: i.xyz[1], z: i.xyz[2] }));
  if (!pts.length) { box.append(h('div', { class: 'mem-empty-map', text: 'Ancora nessun ricordo. Scrivi ad Aura "ricordati che…" oppure aggiungine uno qui sotto.' })); return { el: box, stop() {}, pick() {} }; }
  // per ogni pallino, i 2 vicini piu' prossimi: le linee sottili disegnano la "rete" della memoria
  const links = [];
  pts.forEach((a, ai) => pts.map((b, bi) => [bi, (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2]).filter(([bi]) => bi !== ai)
    .sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([bi]) => { if (ai < bi || !links.some(([x, y]) => x === bi && y === ai)) links.push([ai, bi]); }));
  const cv = h('canvas'), tip = h('div', { class: 'mem-tip hidden' });
  box.append(cv, tip);
  let rx = -0.35, ry = 0.5, auto = true, drag = null, hover = -1, picked = -1, raf = 0, last = performance.now(), proj = [];
  const draw = (now) => {
    const dt = Math.min(64, now - last); last = now;
    if (auto && !drag) ry += dt * 0.00018;
    const dpr = devicePixelRatio || 1, w = box.clientWidth, hh = box.clientHeight;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr); }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, hh);
    const R = Math.min(w, hh) * 0.36, cx = w / 2, cy = hh / 2, cr = Math.cos(rx), sr = Math.sin(rx), cyw = Math.cos(ry), syw = Math.sin(ry);
    proj = pts.map((p, k) => {
      const x1 = p.x * cyw + p.z * syw, z1 = -p.x * syw + p.z * cyw, y1 = p.y * cr - z1 * sr, z2 = p.y * sr + z1 * cr;
      const f = 2.8 / (3.4 - z2);
      return { k, sx: cx + x1 * f * R, sy: cy + y1 * f * R, z: z2, f };
    });
    const text = getComputedStyle(document.documentElement).getPropertyValue('--text-3');
    g.lineWidth = 1;
    links.forEach(([a, b]) => { const A = proj[a], B = proj[b]; g.strokeStyle = text; g.globalAlpha = 0.12 + 0.12 * ((A.z + B.z) / 2 + 1) / 2; g.beginPath(); g.moveTo(A.sx, A.sy); g.lineTo(B.sx, B.sy); g.stroke(); });
    [...proj].sort((a, b) => a.z - b.z).forEach((q) => {
      const it = pts[q.k].i, col = MEM_COLORS[it.kind] || MEM_COLORS.ricordo, on = q.k === hover || q.k === picked;
      const r = (4.2 + 3.6 * (q.z + 1) / 2) * (on ? 1.6 : 1);
      g.globalAlpha = 0.35 + 0.65 * (q.z + 1) / 2;
      if (on) { g.fillStyle = col; g.globalAlpha = 0.22; g.beginPath(); g.arc(q.sx, q.sy, r * 2.6, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      g.fillStyle = col; g.beginPath(); g.arc(q.sx, q.sy, r, 0, Math.PI * 2); g.fill();
    });
    g.globalAlpha = 1;
    if (hover >= 0) { const q = proj[hover]; tip.style.left = q.sx + 'px'; tip.style.top = q.sy + 'px'; }
    raf = requestAnimationFrame(draw);
  };
  const nearest = (e) => {
    const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = -1, bd = 14 * 14;
    proj.forEach((q) => { const d = (q.sx - mx) ** 2 + (q.sy - my) ** 2; if (d < bd) { bd = d; best = q.k; } });
    return best;
  };
  box.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, rx, ry, moved: false }; box.setPointerCapture(e.pointerId); });
  box.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) { drag.moved = true; auto = false; }
      ry = drag.ry + dx * 0.008; rx = Math.max(-1.4, Math.min(1.4, drag.rx + dy * 0.008));
      return;
    }
    hover = nearest(e);
    tip.classList.toggle('hidden', hover < 0);
    if (hover >= 0) { const it = pts[hover].i; tip.textContent = (it.kind === 'documento' ? `📄 ${it.title}: ` : '') + it.text.slice(0, 160) + (it.text.length > 160 ? '…' : ''); }
  });
  box.addEventListener('pointerup', (e) => { const was = drag; drag = null; if (was && !was.moved) { const k = nearest(e); if (k >= 0) { picked = k; onPick(pts[k].i.id); } } });
  box.addEventListener('pointerleave', () => { hover = -1; tip.classList.add('hidden'); });
  box.addEventListener('dblclick', () => { auto = true; });
  raf = requestAnimationFrame(draw);
  return { el: box, stop: () => cancelAnimationFrame(raf), pick: (id) => { picked = pts.findIndex((p) => p.i.id === id); } };
}

function convCard() {
  const p = h('p', { text: 'Carico…' }), sw = h('div');
  const card = h('section', { class: 'card row-card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Conversazioni passate' }), p), sw);
  (async () => {
    try {
      const d = await (await api('/api/memory/conversations')).json();
      p.textContent = d.enabled
        ? `Aura ripesca da sola quello che le hai detto nelle altre chat quando serve. Indicizzati ${d.ready} scambi da ${d.chats} chat${d.pieces > d.ready ? ` (${d.pieces - d.ready} in attesa del PC acceso)` : ''}. Se cancelli una chat, sparisce anche da qui.`
        : 'Spenta: Aura usa solo i ricordi e la chat aperta.';
      sw.replaceChildren(segmented([['on', 'Attiva'], ['off', 'Spenta']], d.enabled ? 'on' : 'off', async (v) => {
        try { await api('/api/memory/conversations', { enabled: v === 'on' }, { method: 'PUT' }); toast(v === 'on' ? 'Memoria delle conversazioni attiva: indicizzo le chat' : 'Memoria delle conversazioni spenta e indice cancellato'); card.replaceWith(convCard()); }
        catch (e) { toast(e.message); }
      }, 'Memoria delle conversazioni'));
    } catch (e) { p.textContent = e.message; }
  })();
  return card;
}

async function renderMemory() {
  const root = $('#memoryView');
  root.replaceChildren(h('div', { class: 'set-wrap' }, h('div', { class: 'card list-empty', text: 'Carico la memoria…' })));
  let data, graph = { nodes: [], links: [] };
  const withDiary = pref.get('graphDiary', true) !== false;
  try { [data, graph] = await Promise.all([api('/api/memory').then((r) => r.json()), api(`/api/brain/graph?diary=${withDiary ? 1 : 0}`).then((r) => r.json()).catch(() => graph)]); }
  catch (e) { root.replaceChildren(h('div', { class: 'set-wrap' }, h('div', { class: 'card list-empty', text: e.message }))); return; }
  if (memStop) memStop();
  const items = data.items, ricordi = items.filter((i) => i.kind === 'ricordo');
  const docs = [...items.filter((i) => i.kind === 'documento').reduce((m, i) => m.set(i.doc_id, [...(m.get(i.doc_id) || []), i]), new Map()).values()];
  $('#memoryCount').textContent = ricordi.length || '';
  const listBox = h('div');
  const map = brainGraph(graph, (n) => { closeMemory(); n.kind === 'diary' ? openBrainDay(n.day) : openBrainFile(n.id); });
  memStop = map.stop;
  const kinds = Object.entries(GRAPH_KINDS).filter(([k]) => graph.nodes.some((n) => n.kind === k));

  const row = (it, score) => {
    const tx = h('div', { class: 'tx' }, it.text, h('small', { text: (it.kind === 'documento' ? `Dal documento «${it.title}» · ` : '') + 'aggiornato ' + fmtAgo(it.updated) }));
    const edit = h('button', { class: 'icon-btn sm', title: 'Modifica', 'aria-label': 'Modifica ricordo', html: icon('pencil', 'sm'), onclick: () => {
      const ta = h('textarea'); ta.value = it.text;
      const save = h('button', { class: 'btn sm primary', text: 'Salva', onclick: async () => { try { await api(`/api/memory/${it.id}`, { text: ta.value }, { method: 'PATCH' }); toast('Ricordo aggiornato'); renderMemory(); } catch (e) { toast(e.message); } } });
      tx.replaceChildren(ta, h('div', { class: 'form-actions', style: 'margin-top:8px' }, save, h('button', { class: 'btn sm', text: 'Annulla', onclick: () => renderMemory() })));
      ta.focus();
    } });
    const del = confirmIcon('trash', 'Dimentica', 'Dimentica?', async () => { try { await api(`/api/memory/${it.id}`, undefined, { method: 'DELETE' }); toast('Ricordo cancellato'); renderMemory(); } catch (e) { toast(e.message); } });
    return h('div', { class: 'mem-row', 'data-id': it.id }, h('span', { class: 'mem-dot', style: `background:${MEM_COLORS[it.kind]}` }), tx,
      score != null ? h('span', { class: 'mem-score', text: Math.round(score * 100) + '%' }) : null,
      it.kind === 'ricordo' ? h('div', { class: 'acts' }, edit, del) : null);
  };
  const showList = (rows, scores) => {
    listBox.replaceChildren(...(rows.length ? rows.map((r, k) => row(r, scores?.[k])) : [h('div', { class: 'list-empty', text: scores ? 'Niente di simile nella memoria.' : 'Nessun ricordo, per ora.' })]));
  };
  showList(ricordi);

  const q = h('input', { placeholder: 'Cerca per significato, es. "come si chiama la mia ragazza?"', 'aria-label': 'Cerca nella memoria' });
  const searchForm = h('form', { class: 'mem-search', onsubmit: async (e) => {
    e.preventDefault();
    if (!q.value.trim()) { showList(ricordi); return; }
    try { const res = (await (await api('/api/memory/search', { q: q.value })).json()).results; showList(res, res.map((r) => r.score)); }
    catch (ex) { toast(ex.message); }
  } }, q, h('button', { class: 'btn', type: 'submit', text: 'Cerca' }));

  const newText = h('textarea', { class: 'big', placeholder: 'Es. "Il locale chiude il lunedì" oppure "Giulia è vegetariana"' });
  const addBtn = h('button', { class: 'btn primary', type: 'submit', text: 'Aggiungi ricordo' });
  const addForm = h('form', { class: 'stack', style: 'max-width:none', onsubmit: async (e) => {
    e.preventDefault(); if (!newText.value.trim()) return;
    addBtn.disabled = true;
    try { const r = await (await api('/api/memory', { text: newText.value })).json(); toast(r.already ? `C'era già (in «${r.name}»): non l'ho salvato due volte` : 'Ricordo aggiunto'); renderMemory(); } catch (ex) { toast(ex.message); addBtn.disabled = false; }
  } }, newText, h('div', { class: 'form-actions' }, addBtn));

  const dTitle = h('input', { placeholder: 'Titolo, es. "Ricette di casa"' });
  const dText = h('textarea', { class: 'big', placeholder: 'Incolla qui il testo, oppure scegli un file .txt o .md' });
  const dFile = h('input', { type: 'file', accept: '.txt,.md,.csv,text/plain,text/markdown', onchange: async () => {
    const f = dFile.files[0]; if (!f) return;
    dText.value = await f.text(); if (!dTitle.value) dTitle.value = f.name.replace(/\.[^.]+$/, '');
  } });
  const dBtn = h('button', { class: 'btn primary', type: 'submit', text: 'Aggiungi documento' });
  const docForm = h('form', { class: 'stack', style: 'max-width:none', onsubmit: async (e) => {
    e.preventDefault();
    if (!dTitle.value.trim() || !dText.value.trim()) { toast('Servono titolo e testo'); return; }
    dBtn.disabled = true; dBtn.textContent = 'Leggo il documento…';
    try { const r = await (await api('/api/memory/document', { title: dTitle.value, text: dText.value })).json(); toast(`Documento salvato in ${r.chunks} pezzi`); renderMemory(); }
    catch (ex) { toast(ex.message); dBtn.disabled = false; dBtn.textContent = 'Aggiungi documento'; }
  } }, h('div', { class: 'field' }, dTitle), dText, h('div', { class: 'form-actions' }, dBtn, dFile));
  const docList = docs.map((parts) => h('div', { class: 'mem-row' }, h('span', { class: 'mem-dot', style: `background:${MEM_COLORS.documento}` }),
    h('div', { class: 'tx' }, h('b', { text: parts[0].title }), h('small', { text: `${parts.length} ${parts.length === 1 ? 'pezzo' : 'pezzi'} · aggiunto ${fmtAgo(parts[0].created)}` })),
    h('div', { class: 'acts' }, confirmIcon('trash', 'Elimina documento', 'Elimina?', async () => { await api(`/api/memory/document/${parts[0].doc_id}`, undefined, { method: 'DELETE' }); toast('Documento eliminato'); renderMemory(); }))));

  root.replaceChildren(h('div', { class: 'set-wrap' },
    h('div', { class: 'set-head' }, h('h1', { text: 'Memoria' }),
      h('button', { class: 'icon-btn', title: 'Chiudi', 'aria-label': 'Chiudi memoria', html: icon('x'), onclick: () => { closeMemory(); focusInput(); } })),
    h('div', { class: 'set-body' },
      h('section', { class: 'card' },
        h('div', { class: 'card-head graph-head' }, h('h2', { text: 'Il grafo del cervello' }),
          h('a', { class: 'btn sm', href: '/api/brain/export', download: '', title: 'Scarica il cervello com’è adesso: estrai lo zip e apri la cartella «cervello» in Obsidian',
            html: icon('unload', 'sm') + 'Esporta per Obsidian' }),
          h('p', { text: 'Come in Obsidian: ogni pallino è una scheda (o un giorno del diario), ogni linea un collegamento. Più linee ha, più è grande. Passa sopra per vedere i collegamenti, clicca per aprirla; trascina per ruotarlo, rotellina per lo zoom, doppio clic per farlo girare da solo.' })),
        map.el,
        h('div', { class: 'mem-legend' }, ...kinds.map(([k, [label, col]]) => h('span', {}, h('i', { style: `background:${col}` }), `${label} (${graph.nodes.filter((n) => n.kind === k).length})`)),
          h('label', { class: 'graph-opt' }, h('input', { type: 'checkbox', checked: withDiary, onchange: (e) => { pref.set('graphDiary', e.target.checked); renderMemory(); } }), 'Mostra il diario'))),
      h('section', { class: 'card flush' },
        h('div', { class: 'card-head pad' }, h('h2', {}, 'Ricordi ', h('span', { class: 'count', text: ricordi.length })),
          h('p', { text: 'Aura li ha sempre presenti quando parla con te. Puoi correggerli o cancellarli.' })),
        searchForm, listBox),
      convCard(),
      h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Aggiungi un ricordo' }), h('p', { text: 'Una frase breve su di te, le persone, il locale, le tue preferenze.' })), addForm),
      h('section', { class: 'card flush' },
        h('div', { class: 'card-head pad' }, h('h2', {}, 'Documenti ', h('span', { class: 'count', text: docs.length })),
          h('p', { text: 'Ricette, procedure, appunti: Aura li consulta quando una domanda ne ha bisogno.' })),
        docList.length ? h('div', {}, docList) : null,
        h('div', { style: 'padding:16px 22px 22px' }, docForm)))));
}

// ================================================================== posta
// Pagina Posta: a sinistra l'elenco (con selezione multipla), a destra cosa dice Cerini IA oppure la mail aperta.
const M = { box: 'inbox', q: '', items: [], next: null, sel: new Set(), open: null, triage: null, counts: null, email: '' };

function closeMail() { $('#main').classList.remove('mail-open'); }
async function openMail() {
  closeSide(); togglePicker(false); closeViews();
  $('#main').classList.add('mail-open');
  M.open = null; M.sel.clear();
  renderMailShell();
  await Promise.all([loadMailList(), loadMailCounts()]);
  if (!M.triage) runTriage();
}
$('#mailBtn').onclick = openMail;

async function loadMailCounts() {
  try {
    const d = await (await api('/api/mail/overview')).json();
    if (!d.connected) return;
    M.counts = d.counts; M.email = d.email;
    $('#mailCount').textContent = d.counts.unread || '';
    paintMailTabs();
  } catch {}
}
async function refreshMailBadge() {
  if (!S.me?.gmail) return;
  try { const d = await (await api('/api/mail/overview')).json(); if (d.connected) $('#mailCount').textContent = d.counts.unread || ''; } catch {}
}

const MAIL_BOXES = [['inbox', 'In arrivo'], ['unread', 'Non lette'], ['spam', 'Spam'], ['trash', 'Cestino']];
function renderMailShell() {
  const root = $('#mailView');
  const q = h('input', { type: 'search', placeholder: 'Cerca (come in Gmail, es. from:amazon)', 'aria-label': 'Cerca nella posta', value: M.q });
  root.replaceChildren(h('div', { class: 'mail-wrap' },
    h('div', { class: 'set-head' }, h('h1', {}, 'Posta', h('small', { id: 'mailEmail', text: M.email })),
      h('div', { class: 'form-actions' },
        h('button', { class: 'icon-btn', title: 'Aggiorna', 'aria-label': 'Aggiorna la posta', html: icon('retry'), onclick: () => { M.triage = null; openMail(); } }),
        h('button', { class: 'icon-btn', title: 'Chiudi', 'aria-label': 'Chiudi la posta', html: icon('x'), onclick: () => { closeMail(); focusInput(); } }))),
    h('div', { class: 'mail-grid' + (M.open ? ' reading' : '') },
      h('section', { class: 'mail-list card flush' },
        h('div', { class: 'mail-tabs-row' }, h('div', { class: 'mail-tabs', id: 'mailTabs', role: 'tablist' }), h('div', { id: 'mailTabsEnd' })),
        h('form', { class: 'mail-search', onsubmit: (e) => { e.preventDefault(); M.q = q.value.trim(); loadMailList(); } }, q),
        h('div', { id: 'mailBar' }),
        h('div', { id: 'mailRows' }, h('div', { class: 'list-empty', text: 'Carico la posta…' }))),
      h('section', { class: 'mail-side', id: 'mailSide' }))));
  paintMailTabs(); paintMailSide();
}
function paintMailTabs() {
  const tabs = $('#mailTabs'); if (!tabs) return;
  const n = { inbox: M.counts?.unread, spam: M.counts?.spam, trash: M.counts?.trash };
  tabs.replaceChildren(...MAIL_BOXES.map(([k, label]) => h('button', { role: 'tab', 'aria-selected': String(M.box === k), class: 'mail-tab',
    onclick: () => { M.box = k; M.sel.clear(); M.q = ''; renderMailShell(); loadMailList(); } }, label, n[k] ? h('span', { class: 'n tnum', text: n[k] }) : null)));
}

async function loadMailList(more = false) {
  const rows = $('#mailRows'); if (!rows) return;
  try {
    const p = new URLSearchParams({ box: M.box, q: M.q }); if (more && M.next) p.set('page', M.next);
    const d = await (await api('/api/mail/list?' + p)).json();
    M.items = more ? [...M.items, ...d.items] : d.items; M.next = d.next;
    paintMailRows();
  } catch (e) { rows.replaceChildren(h('div', { class: 'list-empty', text: e.message })); }
}
// iniziale del mittente su un colore suo (sempre lo stesso per lo stesso indirizzo); tocco = seleziona
function mailAvatar(name, key, picked, toggle) {
  let hue = 0; for (const ch of String(key)) hue = (hue * 31 + ch.charCodeAt(0)) % 360;
  const letter = (String(name || '?').replace(/[^\p{L}\p{N}]/gu, '')[0] || '?').toUpperCase();
  return h('button', { type: 'button', class: 'mail-av' + (picked ? ' on' : ''), style: `--h:${hue}`, 'aria-pressed': String(picked),
    'aria-label': picked ? 'Deseleziona' : 'Seleziona', onclick: (e) => { e.stopPropagation(); toggle(); } },
    h('span', { class: 'mail-av-l', text: letter }), h('span', { class: 'mail-av-c', html: icon('check', 'sm') }));
}
function fmtMailDate(ts) {
  const d = new Date(ts * 1000), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}
function paintMailRows() {
  const rows = $('#mailRows'); if (!rows) return;
  if (!M.items.length) {
    rows.replaceChildren(h('div', { class: 'list-empty', text: M.q ? 'Nessuna mail per questa ricerca.' : { inbox: 'La posta in arrivo è vuota. 🎉', unread: 'Hai letto tutto.', spam: 'Lo spam è vuoto.', trash: 'Il cestino è vuoto.' }[M.box] }));
  } else {
    rows.classList.toggle('selecting', M.sel.size > 0);
    rows.replaceChildren(...M.items.map((m) => {
      const av = mailAvatar(m.from, m.email || m.from, M.sel.has(m.id), () => { M.sel.has(m.id) ? M.sel.delete(m.id) : M.sel.add(m.id); paintMailRows(); });
      return h('div', { class: 'mail-row' + (m.unread ? ' unread' : '') + (M.open?.id === m.id ? ' on' : '') + (M.sel.has(m.id) ? ' picked' : ''), tabindex: '0', role: 'button',
        onclick: () => (M.sel.size ? av.click() : openMailMessage(m.id)), onkeydown: (e) => { if (e.key === 'Enter') openMailMessage(m.id); } },
        av,
        h('div', { class: 'mail-main' },
          h('div', { class: 'mail-top' }, h('b', { text: m.from }), h('span', { class: 'mail-date tnum', text: fmtMailDate(m.date) })),
          h('div', { class: 'mail-subj', text: m.subject }),
          h('div', { class: 'mail-snip', text: m.snippet })));
    }));
    if (M.next) rows.append(h('div', { class: 'mail-more' }, h('button', { class: 'btn sm', text: 'Carica altre', onclick: () => loadMailList(true) })));
  }
  paintMailBar();
}

async function mailDo(action, ids, msg) {
  try {
    const d = await (await api('/api/mail/action', { action, ids })).json();
    toast(msg ? msg(d.done) : 'Fatto');
    M.sel.clear(); M.triage = M.triage && { ...M.triage, items: M.triage.items.filter((x) => !ids.includes(x.id)) };
    if (M.open && ids.includes(M.open.id) && action !== 'read' && action !== 'unread') M.open = null;
    renderMailShell(); loadMailList(); loadMailCounts();
  } catch (e) { toast(e.message); }
}
const MAIL_ACTIONS = {
  trash: ['trash', 'Cestina', (n) => `${n} mail nel cestino`],
  archive: ['down', 'Archivia', (n) => `${n} mail archiviate`],
  spam: ['shield', 'Spam', (n) => `${n} mail segnate come spam`],
  read: ['check', 'Letta', (n) => `${n} mail segnate come lette`],
  untrash: ['retry', 'Ripristina', (n) => `${n} mail rimesse nella posta`],
  notspam: ['check', 'Non è spam', (n) => `${n} mail rimesse nella posta`],
};
function mailBtns(ids, keys) {
  return keys.map((k) => { const [ic, label, msg] = MAIL_ACTIONS[k]; return h('button', { class: 'btn sm', html: icon(ic, 'sm') + label, onclick: () => mailDo(k, ids, msg) }); });
}
function paintMailBar() {
  const bar = $('#mailBar'); if (!bar) return;
  const ids = [...M.sel];
  const all = h('input', { type: 'checkbox', 'aria-label': 'Seleziona tutte', checked: ids.length && ids.length === M.items.length ? true : null,
    onchange: (e) => { M.sel = new Set(e.target.checked ? M.items.map((m) => m.id) : []); paintMailRows(); } });
  const keys = M.box === 'trash' ? ['untrash'] : M.box === 'spam' ? ['notspam', 'trash'] : ['trash', 'archive', 'spam', 'read'];
  const empty = M.box === 'trash' || M.box === 'spam'
    ? confirmIcon('trash', M.box === 'trash' ? 'Svuota il cestino' : 'Svuota lo spam', 'Cancellare per sempre?', async () => {
        try { const d = await (await api('/api/mail/action', { action: M.box === 'trash' ? 'empty_trash' : 'empty_spam' })).json(); toast(`${d.done} mail cancellate per sempre`); loadMailList(); loadMailCounts(); }
        catch (e) { toast(e.message); } })
    : null;
  bar.className = 'mail-bar' + (ids.length ? ' sel' : '');
  const tabsEnd = $('#mailTabsEnd'); if (tabsEnd) tabsEnd.replaceChildren(...(empty ? [empty] : []));
  if (!ids.length) { bar.replaceChildren(); return; }
  bar.replaceChildren(h('button', { class: 'icon-btn sm', title: 'Annulla la selezione', 'aria-label': 'Annulla la selezione', html: icon('x', 'sm'),
      onclick: () => { M.sel.clear(); paintMailRows(); } }),
    h('span', { class: 'tnum mail-bar-n', text: `${ids.length} ${ids.length === 1 ? 'selezionata' : 'selezionate'}` }),
    h('label', { class: 'mail-bar-all' }, all, h('span', { text: 'tutte' })),
    h('div', { class: 'mail-bar-acts' }, ...mailBtns(ids, keys)));
}

async function openMailMessage(id) {
  M.open = { id, loading: true }; renderMailShell(); paintMailRows();
  try {
    const m = await (await api(`/api/mail/message/${id}`)).json();
    M.open = m;
    const it = M.items.find((x) => x.id === id); if (it && it.unread) { it.unread = false; loadMailCounts(); }
  } catch (e) { M.open = null; toast(e.message); }
  renderMailShell(); paintMailRows();
}

function askCerini(text) {
  closeMail(); newChat();
  input.value = text; input.dispatchEvent(new Event('input')); input.focus();
}

function paintMailSide() {
  const side = $('#mailSide'); if (!side) return;
  if (M.open) {
    const m = M.open;
    if (m.loading) { side.replaceChildren(h('div', { class: 'card list-empty', text: 'Apro la mail…' })); return; }
    const keys = M.box === 'trash' ? ['untrash'] : M.box === 'spam' ? ['notspam', 'trash'] : ['trash', 'archive', 'spam'];
    const av = mailAvatar(m.from, m.email, false, () => {}); av.tabIndex = -1; av.disabled = true;
    side.replaceChildren(h('article', { class: 'card mail-read' },
      h('div', { class: 'mail-read-head' }, h('h2', { text: m.subject || '(senza oggetto)' }),
        h('button', { class: 'icon-btn sm', title: 'Chiudi la mail', 'aria-label': 'Chiudi la mail', html: icon('x', 'sm'), onclick: () => { M.open = null; renderMailShell(); paintMailRows(); } })),
      h('div', { class: 'mail-meta' }, av, h('div', { class: 'mail-meta-tx' },
        h('div', {}, h('b', { text: m.from }), h('span', { class: 'muted', text: ` <${m.email}>` })),
        h('div', { class: 'muted', text: `a ${m.to} · ${new Date(m.date * 1000).toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })}` }))),
      h('div', { class: 'form-actions mail-acts' }, ...mailBtns([m.id], keys),
        h('button', { class: 'btn sm primary', html: icon('brain', 'sm') + 'Chiedi ad Aura',
          onclick: () => askCerini(`Guarda la mail n.${m.n} da ${m.from} («${m.subject}»): cosa ne facciamo?`) }),
        h('button', { class: 'btn sm', html: icon('pencil', 'sm') + 'Rispondi con Aura',
          onclick: () => askCerini(`Aiutami a rispondere alla mail n.${m.n} da ${m.from} («${m.subject}»): `) })),
      m.attachments?.length ? h('div', { class: 'mail-att' }, icon('clip', 'sm') ? h('span', { html: icon('clip', 'sm') }) : null, m.attachments.join(', ')) : null,
      h('div', { class: 'mail-body', text: m.text || '(mail vuota)' })));
    return;
  }
  // nessuna mail aperta: il riepilogo di Cerini IA
  const t = M.triage;
  if (!t || t.loading || t.error) {
    side.replaceChildren(h('section', { class: 'card mail-ai' },
      h('div', { class: 'mail-ai-head' }, h('span', { html: icon('brain', 'sm') }), h('b', { text: 'Aura' })),
      t?.error ? h('p', { text: t.error }) : h('p', { class: 'live-label', text: 'Sto guardando la posta…' }),
      t?.error ? h('button', { class: 'btn sm', text: 'Riprova', onclick: runTriage }) : null));
    return;
  }
  const imp = t.items.filter((x) => x.tipo === 'importante'), junk = t.items.filter((x) => x.tipo === 'inutile');
  const groups = [...junk.reduce((g, x) => g.set(x.email, [...(g.get(x.email) || []), x]), new Map()).values()].sort((a, b) => b.length - a.length);
  const item = (x) => h('button', { class: 'mail-ai-item', onclick: () => openMailMessage(x.id) },
    h('b', { text: x.from }), h('span', { text: x.subject }), x.perche ? h('small', { text: x.perche }) : null);
  side.replaceChildren(h('section', { class: 'card mail-ai' },
    h('div', { class: 'mail-ai-head' }, h('span', { html: icon('brain', 'sm') }), h('b', { text: 'Aura' })),
    h('p', { class: 'mail-ai-sum', text: t.summary || 'Ecco com\'è la posta.' }),
    imp.length ? h('div', { class: 'mail-ai-sec' }, h('h3', { text: 'Da guardare' }), ...imp.map(item)) : null,
    groups.length ? h('div', { class: 'mail-ai-sec' },
      h('div', { class: 'mail-ai-sec-head' }, h('h3', { text: 'Si possono buttare' }),
        h('button', { class: 'btn sm', html: icon('trash', 'sm') + `Cestina tutte (${junk.length})`,
          onclick: () => mailDo('trash', junk.map((x) => x.id), (n) => `${n} mail nel cestino`) })),
      ...groups.map((g) => h('div', { class: 'mail-ai-group' },
        h('div', { class: 'tx' }, h('b', { text: g[0].from }), h('small', { text: `${g.length} ${g.length === 1 ? 'mail' : 'mail'} · ${g[0].perche || g[0].subject}` })),
        h('button', { class: 'btn sm', title: `Cestina tutte le mail di ${g[0].email}, anche quelle più vecchie`, text: 'Cestina tutte', onclick: async () => {
          try { const d = await (await api('/api/mail/action', { action: 'trash', query: `from:${g[0].email}` })).json(); toast(`${d.done} mail di ${g[0].from} nel cestino`); M.triage = null; openMail(); }
          catch (e) { toast(e.message); } } })))) : null,
    !imp.length && !groups.length ? h('p', { class: 'muted', text: 'Niente di speciale da segnalare.' }) : null));
}

async function runTriage() {
  M.triage = { loading: true }; paintMailSide();
  try { M.triage = await (await api('/api/mail/triage', {})).json(); }
  catch (e) { M.triage = { error: e.message }; }
  paintMailSide();
}

// ================================================================== clienti (siti vetrina)
// Le attivita' della zona (scelta nelle impostazioni) senza sito o con un sito da rifare: numero, mail, motivo e una mail pronta da mandare.
const CL = { tab: 'nuovo', q: '', town: '', shown: 60 };
const CL_TABS = [['nuovo', 'Da contattare'], ['contattato', 'Contattati'], ['risposto', 'Hanno risposto'], ['cliente', 'Clienti'], ['no', 'Non interessa'], ['tutti', 'Tutti']];
const CL_STATUS = [['nuovo', 'Da contattare'], ['contattato', 'Contattato'], ['risposto', 'Ha risposto'], ['cliente', 'Cliente'], ['no', 'Non interessa']];
function closeClienti() { $('#main').classList.remove('clienti-open'); clearTimeout(CL.timer); }
async function openClienti() {
  closeSide(); togglePicker(false); closeViews();
  $('#main').classList.add('clienti-open');
  await renderClienti();
}
$('#clientiBtn').onclick = openClienti;
async function renderClienti() {
  const root = $('#clientiView');
  clearTimeout(CL.timer);
  const ps = new URLSearchParams();
  if (['nosite', 'bad'].includes(CL.kind)) ps.set('kind', CL.kind);
  if (CL.tab !== 'tutti') ps.set('status', CL.tab);
  let d;
  try { d = CL.data = await (await api('/api/clienti?' + ps)).json(); }
  catch (e) { root.replaceChildren(h('div', { class: 'cl-wrap' }, h('div', { class: 'cl-empty', text: e.message }))); return; }
  const cnt = (f) => Object.entries(d.counts || {}).filter(([k]) => f(...k.split(':'))).reduce((t, [, n]) => t + n, 0);
  const job = d.job;
  const head = h('div', { class: 'cl-head' },
    h('div', { class: 'tx' }, h('h1', { text: 'Clienti per siti vetrina' }),
      h('p', { text: `Attività ${d.zona?.nome ? d.zona.nome + ' ' : 'della tua zona '}senza un sito o con un sito da rifare. Contattale una per volta: la mail la prepara Aura, la mandi tu.` }),
      h('div', { class: 'cl-src' + (d.has_key ? '' : ' warn'), html: icon(d.has_key ? 'check' : 'globe', 'sm') +
        (d.has_key ? 'Dati da Google Maps' : 'Dati dai siti dei Comuni e dalle ricerche sul web (Google, DuckDuckGo, Brave)') })),
    h('div', { class: 'acts' },
      h('button', { class: 'btn primary', html: icon('retry', 'sm') + (job?.running ? 'Sto cercando…' : 'Cerca in zona'), disabled: !!job?.running, onclick: async () => {
        try { await api('/api/clienti/cerca', {}); } catch (e) { toast(e.message); } renderClienti(); } }),
      h('button', { class: 'icon-btn', title: 'Impostazioni', 'aria-label': 'Impostazioni dei clienti', html: icon('settings'), onclick: () => clientiSettings(d) }),
      h('button', { class: 'icon-btn', title: 'Chiudi', 'aria-label': 'Chiudi', html: icon('x'), onclick: () => { closeClienti(); focusInput(); } })));
  const jobEl = job && (job.running || job.error) ? h('div', { class: 'cl-job' + (job.error ? ' err' : '') },
    h('div', { text: job.error ? 'La ricerca si è fermata: ' + job.error : `${job.phase} ${job.total ? job.done + ' di ' + job.total : ''}` }),
    job.running ? h('div', { class: 'bar' }, h('i', { style: `width:${job.total ? Math.round((100 * job.done) / job.total) : 5}%` })) : null) : null;
  const stat = (cls, label, n, kind, tab) => h('button', { class: 'cl-stat ' + cls + ((CL.kind || '') === (kind || '') && CL.tab === tab ? ' on' : ''), onclick: () => { CL.kind = kind; CL.tab = tab; CL.shown = 60; renderClienti(); } },
    h('small', { text: label }), h('b', { class: 'tnum', text: String(n) }));
  const stats = h('div', { class: 'cl-stats' },
    stat('s-nosite', 'Senza sito', cnt((k, s) => k === 'nosite' && s === 'nuovo'), 'nosite', 'nuovo'),
    stat('s-bad', 'Sito da rifare', cnt((k, s) => k === 'bad' && s === 'nuovo'), 'bad', 'nuovo'),
    stat('s-cont', 'Contattati', cnt((k, s) => k !== 'ok' && ['contattato', 'risposto'].includes(s)), '', 'contattato'),
    stat('s-cli', 'Clienti', cnt((k, s) => s === 'cliente'), '', 'cliente'));
  const towns = [...new Set((d.leads || []).map((l) => l.town).filter(Boolean))].sort();
  const search = h('input', { class: 'ag-in', type: 'search', placeholder: 'Cerca per nome, mestiere o paese', value: CL.q, 'aria-label': 'Cerca',
    oninput: (e) => { CL.q = e.target.value; paintList(); } });
  const town = h('select', { class: 'ag-in', 'aria-label': 'Paese', onchange: (e) => { CL.town = e.target.value; paintList(); } },
    h('option', { value: '', text: 'Tutti i paesi' }), ...towns.map((t) => h('option', { value: t, text: t, selected: CL.town === t ? true : null })));
  const tabs = segmented(CL_TABS.map(([v, t]) => [v, t]), CL.tab, (v) => { CL.tab = v; CL.kind = ''; CL.shown = 60; renderClienti(); }, 'Stato');
  const list = h('div', { class: 'cl-list' });
  function paintList() {
    const q = CL.q.trim().toLowerCase();
    const rows = (d.leads || []).filter((l) => (!CL.town || l.town === CL.town) && (!q || `${l.name} ${l.category} ${l.town}`.toLowerCase().includes(q)));
    list.replaceChildren(...(rows.length ? rows.slice(0, CL.shown).map(leadCard) : [h('div', { class: 'cl-empty', text: (d.leads || []).length
      ? 'Nessuna attività con questi filtri.' : 'Ancora niente qui. Premi «Cerca in zona»: in qualche minuto trovo le attività e controllo i loro siti.' })]),
      rows.length > CL.shown ? h('button', { class: 'btn cl-more', text: `Mostra altre ${Math.min(60, rows.length - CL.shown)} (di ${rows.length - CL.shown})`, onclick: () => { CL.shown += 60; paintList(); } }) : '');
  }
  paintList();
  root.replaceChildren(h('div', { class: 'cl-wrap' }, head, jobEl, stats, h('div', { class: 'cl-bar' }, tabs), h('div', { class: 'cl-bar' }, search, towns.length ? town : null), list));
  if (job?.running) CL.timer = setTimeout(() => { if ($('#main').classList.contains('clienti-open')) renderClienti(); }, 2500);
}
function leadCard(l) {
  const patch = async (body) => {
    try { Object.assign(l, await (await api(`/api/clienti/${l.id}`, body, { method: 'PATCH' })).json()); } catch (e) { toast(e.message); }
    renderClienti();
  };
  const gq = encodeURIComponent(`${l.name} ${l.town || ''}`);
  const st = h('select', { 'aria-label': 'Stato', onchange: (e) => patch({ status: e.target.value }) },
    ...CL_STATUS.map(([v, t]) => h('option', { value: v, text: t, selected: l.status === v ? true : null })));
  return h('div', { class: `cl-card k-${l.kind} st-${l.status}` },
    h('div', { class: 'cl-top' },
      h('div', { class: 'cl-name' }, h('b', { text: l.name }), h('small', { text: [l.category, l.town].filter(Boolean).join(' · ') + (l.reviews ? ` · ${l.rating ?? ''}★ (${l.reviews})` : '') })),
      h('span', { class: 'cl-badge', text: l.kind === 'nosite' ? 'Senza sito' : `Sito da rifare · ${l.score}/100` })),
    l.issues?.length ? h('ul', { class: 'cl-issues' }, ...l.issues.slice(0, 5).map((i) => h('li', { text: i }))) : null,
    h('div', { class: 'cl-links' },
      l.phone ? h('a', { class: 'cl-link tel', href: 'tel:' + l.phone.replace(/\s+/g, '') }, h('i', { html: icon('phone', 'sm') }), h('span', { text: l.phone }))
        : h('a', { class: 'cl-link', href: `https://www.google.com/search?q=${gq}+telefono`, target: '_blank', rel: 'noopener', html: icon('globe', 'sm') + '<span>Cerca il numero</span>' }),
      l.email ? h('a', { class: 'cl-link', href: 'mailto:' + l.email }, h('i', { html: icon('mail', 'sm') }), h('span', { text: l.email })) : null,
      l.website ? h('a', { class: 'cl-link', href: l.website, target: '_blank', rel: 'noopener', html: icon('globe', 'sm') + `<span>${l.kind === 'nosite' ? 'La loro pagina' : 'Il loro sito'}</span>` }) : null,
      h('a', { class: 'cl-link', href: l.maps_url || `https://www.google.com/maps/search/${gq}`, target: '_blank', rel: 'noopener', html: icon('pin', 'sm') + '<span>Maps</span>' }),
      !l.website || l.kind === 'nosite' ? h('a', { class: 'cl-link', href: `https://www.google.com/search?q=${gq}`, target: '_blank', rel: 'noopener', html: icon('globe', 'sm') + '<span>Cerca su Google</span>' }) : null),
    l.note ? h('div', { class: 'cl-note', text: '📝 ' + l.note }) : null,
    h('div', { class: 'cl-acts' },
      h('button', { class: 'btn primary sm', html: icon('mail', 'sm') + 'Prepara mail', onclick: () => clientiMail(l) }), st,
      h('button', { class: 'btn sm', html: icon('pencil', 'sm') + 'Nota', onclick: () => { const n = prompt('Nota su ' + l.name, l.note || ''); if (n !== null) patch({ note: n }); } })));
}
// La mail per proporre il sito: Aura la scrive, tu la guardi, la cambi e la mandi (o la salvi in bozze)
async function clientiMail(l) {
  const close = () => modal.remove();
  const to = h('input', { class: 'ag-in', value: l.email || '', placeholder: l.email ? '' : 'Non ho trovato la loro mail: scrivila tu', 'aria-label': 'A' });
  const subj = h('input', { class: 'ag-in', 'aria-label': 'Oggetto', disabled: true, value: 'Scrivo la mail…' });
  const body = h('textarea', { class: 'ag-in', rows: 12, 'aria-label': 'Testo', disabled: true });
  const gm = !!CL.data?.gmail;
  const send = (kind) => async (e) => {
    const b = e.currentTarget; b.disabled = true;
    try {
      await api(`/api/mail/compose/${kind}`, { to: to.value.trim(), subject: subj.value, body: body.value, attachments: [] });
      if (kind === 'send') await api(`/api/clienti/${l.id}`, { status: 'contattato', ...(to.value.trim() && to.value.trim() !== l.email ? { email: to.value.trim() } : {}) }, { method: 'PATCH' });
      toast(kind === 'send' ? `Mail inviata a ${l.name}: segnato come contattato` : 'Salvata nelle bozze di Gmail');
      close(); renderClienti();
    } catch (ex) { b.disabled = false; toast(ex.message); }
  };
  const modal = h('div', { class: 'ag-modal', onclick: (e) => { if (e.target === modal) close(); } },
    h('div', { class: 'ag-sheet cl-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Mail per ' + l.name },
      h('div', { class: 'ag-sheet-h' }, h('b', { text: 'Mail per ' + l.name }), h('span', { class: 'grow' }),
        h('button', { class: 'icon-btn sm', 'aria-label': 'Chiudi', html: icon('x', 'sm'), onclick: close })),
      h('label', { class: 'ag-f' }, h('span', { text: 'A' }), to), h('label', { class: 'ag-f' }, h('span', { text: 'Oggetto' }), subj),
      h('label', { class: 'ag-f' }, h('span', { text: 'Testo' }), body),
      h('div', { class: 'ag-sheet-f' },
        h('button', { class: 'btn sm', html: icon('copy', 'sm') + 'Copia', onclick: () => copyText(`${subj.value}\n\n${body.value}`) }),
        h('span', { class: 'grow' }),
        gm ? h('button', { class: 'btn', text: 'Salva in bozze', onclick: send('draft') }) : null,
        gm ? h('button', { class: 'btn primary', html: icon('mail', 'sm') + 'Invia', onclick: send('send') }) : h('small', { text: 'Collega Gmail per inviarla da qui' }))));
  document.body.append(modal);
  try {
    const m = await (await api(`/api/clienti/${l.id}/mail`, {})).json();
    subj.value = m.subject; body.value = m.body; to.value = to.value || m.to || '';
  } catch (e) { subj.value = ''; toast('Non sono riuscito a scriverla: ' + e.message); }
  subj.disabled = false; body.disabled = false; body.focus();
}
function clientiSettings(d) {
  const close = () => modal.remove();
  const f = d.firma || {};
  const key = h('input', { class: 'ag-in', type: 'password', autocomplete: 'off', placeholder: d.has_key ? 'Chiave salvata: lascia vuoto per tenerla' : 'Incolla la chiave di Google Places', 'aria-label': 'Chiave Google Places' });
  const nome = h('input', { class: 'ag-in', value: f.nome || '', placeholder: 'Come ti firmi' });
  const tel = h('input', { class: 'ag-in', value: f.telefono || '', placeholder: 'Il tuo numero' });
  const sito = h('input', { class: 'ag-in', value: f.sito || '', placeholder: 'Il tuo sito o portfolio (facoltativo)' });
  const off = h('textarea', { class: 'ag-in', rows: 2, placeholder: 'Es. sito vetrina da 390 €, pronto in 2 settimane (vuoto = niente prezzi nella mail)' }); off.value = d.offerta || '';
  const mest = h('textarea', { class: 'ag-in', rows: 4 }); mest.value = (d.mestieri || []).join(', ');
  const z = d.zona || {};
  const zNome = h('input', { class: 'ag-in', value: z.nome || '', placeholder: 'Es. tra Paese A e Paese B' });
  const zCom = h('textarea', { class: 'ag-in', rows: 2, placeholder: 'I comuni dove cercare, separati da virgola' }); zCom.value = (z.comuni || []).join(', ');
  const zAree = h('input', { class: 'ag-in', value: (z.aree || []).join(', '), placeholder: 'Facoltativo: dove fare le ricerche web (di base i comuni)' });
  const zProv = h('input', { class: 'ag-in', value: z.provincia || '', maxlength: 2, placeholder: 'Es. mi' });
  const csv = (el) => el.value.split(',').map((x) => x.trim()).filter(Boolean);
  const modal = h('div', { class: 'ag-modal', onclick: (e) => { if (e.target === modal) close(); } },
    h('div', { class: 'ag-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Impostazioni clienti' },
      h('div', { class: 'ag-sheet-h' }, h('b', { text: 'Impostazioni' }), h('span', { class: 'grow' }), h('button', { class: 'icon-btn sm', 'aria-label': 'Chiudi', html: icon('x', 'sm'), onclick: close })),
      h('label', { class: 'ag-f' }, h('span', { text: 'Zona (come la chiami nelle mail)' }), zNome),
      h('label', { class: 'ag-f' }, h('span', { text: 'Comuni' }), zCom),
      h('div', { class: 'ag-row2' }, h('label', { class: 'ag-f' }, h('span', { text: 'Aree di ricerca' }), zAree), h('label', { class: 'ag-f' }, h('span', { text: 'Sigla provincia' }), zProv)),
      h('label', { class: 'ag-f' }, h('span', { text: 'Chiave Google Places (facoltativa, resta sul server)' }), key),
      h('div', { class: 'ag-row2' }, h('label', { class: 'ag-f' }, h('span', { text: 'Firma: nome' }), nome), h('label', { class: 'ag-f' }, h('span', { text: 'Telefono' }), tel)),
      h('label', { class: 'ag-f' }, h('span', { text: 'Sito o portfolio' }), sito),
      h('label', { class: 'ag-f' }, h('span', { text: 'Offerta da citare nella mail' }), off),
      h('label', { class: 'ag-f' }, h('span', { text: 'Mestieri da cercare (con Google), separati da virgola' }), mest),
      h('div', { class: 'ag-sheet-f' }, h('span', { class: 'grow' }), h('button', { class: 'btn', text: 'Annulla', onclick: close }),
        h('button', { class: 'btn primary', text: 'Salva', onclick: async () => {
          try {
            await api('/api/clienti/config', { places_key: key.value.trim(), firma: { nome: nome.value, telefono: tel.value, sito: sito.value }, offerta: off.value,
              mestieri: mest.value.split(',').map((x) => x.trim()).filter(Boolean),
              zona: { nome: zNome.value, comuni: csv(zCom), aree: csv(zAree), provincia: zProv.value } }, { method: 'PUT' });
            toast('Salvato'); close(); renderClienti();
          } catch (e) { toast(e.message); } } }))));
  document.body.append(modal);
}

// ================================================================== agenda
// I prossimi giorni del calendario Google: gli impegni li crea Aura (o tu, da Google Calendar).
function closeAgenda() { $('#main').classList.remove('agenda-open'); }
async function openAgenda() {
  closeSide(); togglePicker(false); closeViews();
  $('#main').classList.add('agenda-open');
  await renderAgenda();
}
$('#agendaBtn').onclick = openAgenda;
$('#calChip').onclick = openAgenda;
setInterval(() => { if (S.me && !document.hidden) loadToday(); }, 300000);

function agendaDayLabel(iso) {
  const d = new Date(iso + 'T12:00:00'), t = new Date(); t.setHours(12, 0, 0, 0);
  const diff = Math.round((d - t) / 86400000);
  const name = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  return diff === 0 ? `Oggi · ${name}` : diff === 1 ? `Domani · ${name}` : name.charAt(0).toUpperCase() + name.slice(1);
}
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const mondayOf = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const DOW = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
const DOW_LONG = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const AVVISI = [[-1, 'Nessun avviso'], [0, 'All\'ora giusta'], [5, '5 minuti prima'], [10, '10 minuti prima'], [15, '15 minuti prima'], [30, '30 minuti prima'],
  [60, '1 ora prima'], [120, '2 ore prima'], [1440, '1 giorno prima']];
const dayTitle = (iso) => { const s = new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }); return s.charAt(0).toUpperCase() + s.slice(1); };
const evTime = (e) => (e.allday ? 'Tutto il giorno' : e.time + (e.end_time ? `–${e.end_time}` : ''));

// L'agenda di Aura: mese, settimana o elenco; a destra (sotto, sul telefono) il giorno scelto. Gli impegni si aggiungono e modificano qui.
async function renderAgenda() {
  const root = $('#agendaView'), today = new Date(), todayIso = isoDay(today);
  const A = S.ag = S.ag || { view: 'month', anchor: new Date(today.getFullYear(), today.getMonth(), 1), sel: todayIso };
  let start, days, label;
  if (A.view === 'month') {
    A.anchor = new Date(A.anchor.getFullYear(), A.anchor.getMonth(), 1);
    start = mondayOf(A.anchor); days = 42; label = `${MESI[A.anchor.getMonth()]} ${A.anchor.getFullYear()}`;
  } else if (A.view === 'week') {
    A.anchor = mondayOf(A.anchor); start = A.anchor; days = 7;
    const end = addDays(start, 6);
    label = `${start.getDate()} ${start.getMonth() !== end.getMonth() ? MESI[start.getMonth()].slice(0, 3) + ' ' : ''}– ${end.getDate()} ${MESI[end.getMonth()]}`;
  } else { start = new Date(today.getFullYear(), today.getMonth(), today.getDate()); days = 60; label = 'Prossimi 60 giorni'; }
  let evs = [];
  try { evs = (await (await api(`/api/calendar/agenda?start=${isoDay(start)}&days=${days}`)).json()).events; }
  catch (e) { root.replaceChildren(h('div', { class: 'set-wrap' }, h('div', { class: 'card list-empty', text: e.message }))); return; }
  const byDay = evs.reduce((m, e) => m.set(e.day, [...(m.get(e.day) || []), e]), new Map());
  const move = (n) => {
    if (A.view === 'month') A.anchor = new Date(A.anchor.getFullYear(), A.anchor.getMonth() + n, 1);
    else if (A.view === 'week') A.anchor = addDays(A.anchor, 7 * n);
    renderAgenda();
  };
  const goToday = () => { A.anchor = A.view === 'week' ? mondayOf(today) : new Date(today.getFullYear(), today.getMonth(), 1); A.sel = todayIso; renderAgenda(); };
  const pill = (e) => h('button', { class: 'ag-pill k-' + e.kind + (e.done ? ' done' : ''), title: `${e.done ? 'Fatto · ' : ''}${evTime(e)} · ${e.title}`,
      onclick: (ev) => { ev.stopPropagation(); eventEditor(e); } },
    e.done ? h('i', { class: 'ag-pill-ok', html: icon('check', 'sm') }) : null,
    e.allday ? null : h('b', { class: 'tnum', text: e.time }), h('span', { text: e.title }));

  const head = h('div', { class: 'ag-head' },
    h('h1', { text: 'Agenda' }),
    h('button', { class: 'btn primary ag-new', html: icon('edit', 'sm') + 'Nuovo', onclick: () => eventEditor(null, A.sel) }),
    h('button', { class: 'icon-btn', title: 'Chiudi', 'aria-label': 'Chiudi agenda', html: icon('x'), onclick: () => { closeAgenda(); focusInput(); } }));
  const bar = h('div', { class: 'ag-bar' },
    A.view !== 'list' ? h('div', { class: 'ag-nav' },
      h('button', { class: 'icon-btn sm', title: 'Indietro', 'aria-label': 'Indietro', html: icon('chevron', 'sm'), style: 'transform:rotate(90deg)', onclick: () => move(-1) }),
      h('button', { class: 'btn sm', text: 'Oggi', onclick: goToday }),
      h('button', { class: 'icon-btn sm', title: 'Avanti', 'aria-label': 'Avanti', html: icon('chevron', 'sm'), style: 'transform:rotate(-90deg)', onclick: () => move(1) })) : null,
    h('b', { class: 'ag-label', text: label }),
    segmented([['month', 'Mese'], ['week', 'Settimana'], ['list', 'Elenco']], A.view, (v) => {
      A.view = v; A.anchor = v === 'week' ? mondayOf(new Date(A.sel + 'T12:00:00')) : new Date(A.sel.slice(0, 4), +A.sel.slice(5, 7) - 1, 1); renderAgenda();
    }, 'Vista'));

  let main;
  if (A.view === 'month') {
    const cells = [];
    for (let k = 0; k < 42; k++) {
      const d = addDays(start, k), key = isoDay(d), list = byDay.get(key) || [];
      cells.push(h('div', { class: 'ag-cell' + (d.getMonth() !== A.anchor.getMonth() ? ' out' : '') + (key === todayIso ? ' today' : '') + (key === A.sel ? ' sel' : ''),
        role: 'button', tabindex: 0, 'aria-label': `${dayTitle(key)}${list.length ? `, ${list.length} impegni` : ''}`,
        onclick: () => { A.sel = key; renderAgenda(); }, ondblclick: () => eventEditor(null, key),
        onkeydown: (e) => { if (e.key === 'Enter') { A.sel = key; renderAgenda(); } } },
        h('span', { class: 'ag-n tnum', text: String(d.getDate()) }),
        h('div', { class: 'ag-pills' }, ...list.slice(0, 3).map(pill), list.length > 3 ? h('span', { class: 'ag-more', text: `+${list.length - 3}` }) : null),
        h('div', { class: 'ag-dots' }, ...list.slice(0, 4).map((e) => h('i', { class: 'k-' + e.kind + (e.done ? ' done' : '') })))));
    }
    main = h('section', { class: 'ag-cal' }, h('div', { class: 'ag-grid' }, ...DOW_LONG.map((x) => h('span', { class: 'ag-dow', text: x })), ...cells));
  } else if (A.view === 'week') {
    main = h('section', { class: 'ag-week' }, ...Array.from({ length: 7 }, (_, k) => {
      const d = addDays(start, k), key = isoDay(d), list = byDay.get(key) || [];
      return h('div', { class: 'ag-wday' + (key === todayIso ? ' today' : '') + (key === A.sel ? ' sel' : ''), onclick: () => { A.sel = key; renderAgenda(); } },
        h('div', { class: 'ag-wh' }, h('span', { text: DOW_LONG[k] }), h('b', { class: 'tnum', text: String(d.getDate()) }),
          h('button', { class: 'icon-btn sm', title: 'Aggiungi', 'aria-label': `Aggiungi il ${dayTitle(key)}`, html: icon('edit', 'sm'), onclick: (ev) => { ev.stopPropagation(); eventEditor(null, key); } })),
        ...(list.length ? list.map(pill) : [h('span', { class: 'ag-none', text: '—' })]));
    }));
  } else {
    const keys = [...byDay.keys()].sort();
    main = h('section', { class: 'ag-list' }, ...(keys.length ? keys.map((key) => h('div', { class: 'ag-lday' },
      h('div', { class: 'ag-lh' + (key === todayIso ? ' today' : ''), text: key === todayIso ? 'Oggi · ' + dayTitle(key) : dayTitle(key) }),
      ...byDay.get(key).map(eventRow))) : [h('div', { class: 'ag-empty', text: 'Niente in programma nei prossimi 60 giorni.' })]));
  }

  // il giorno scelto: i suoi impegni e il tasto per aggiungerne
  const sel = byDay.get(A.sel) || [];
  const side = A.view === 'list' ? null : h('aside', { class: 'ag-day' },
    h('div', { class: 'ag-day-h' }, h('b', { text: A.sel === todayIso ? 'Oggi' : dayTitle(A.sel).split(' ')[0] }), h('span', { text: dayTitle(A.sel).split(' ').slice(1).join(' ') })),
    ...(sel.length ? sel.map(eventRow) : [h('div', { class: 'ag-empty', text: 'Niente in programma.' })]),
    h('button', { class: 'ag-add', html: icon('edit', 'sm') + 'Aggiungi in questo giorno', onclick: () => eventEditor(null, A.sel) }),
    h('p', { class: 'ag-tip', text: 'Puoi anche dirlo ad Aura: «venerdì alle 15 ho il dentista», «ricordami domani di chiamare il dentista». All\'ora giusta ti scrive in Da Aura.' }));
  root.replaceChildren(h('div', { class: 'ag-wrap' }, head, bar, h('div', { class: 'ag-layout' + (side ? '' : ' one') }, main, side)));
}

async function toggleDone(e) {
  try {
    const r = await (await api(`/api/calendar/event/${encodeURIComponent(e.id)}/done`, { done: !e.done })).json();
    Object.assign(e, r); toast(r.done ? 'Fatto!' : 'Riaperto');
    loadToday(); if ($('#main').classList.contains('agenda-open')) renderAgenda(); if (BP.tree) renderBrainPanel();
  } catch (err) { toast(err.message); }
}
function eventRow(e) {
  const check = e.kind === 'promemoria' ? h('span', { class: 'ag-done' + (e.done ? ' on' : ''), role: 'checkbox', 'aria-checked': String(!!e.done), tabindex: 0,
    title: e.done ? 'Segna da fare' : 'Segna fatto', html: e.done ? icon('check', 'sm') : '',
    onclick: (ev) => { ev.stopPropagation(); toggleDone(e); }, onkeydown: (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); toggleDone(e); } } }) : null;
  return h('button', { class: 'ag-ev k-' + e.kind + (e.done ? ' done' : ''), onclick: () => eventEditor(e) },
    check || h('span', { class: 'ag-ev-bar' }),
    // sopra l'ora (colorata) e i dettagli, sotto il titolo che prende tutta la larghezza
    h('span', { class: 'ag-ev-tx' },
      h('span', { class: 'ag-ev-meta' }, h('span', { class: 'ag-ev-time tnum', text: evTime(e) }),
        ...[e.kind === 'promemoria' ? 'Promemoria' : '', e.location].filter(Boolean).map((x) => h('span', { text: '· ' + x })),
        e.reminder ? h('span', { class: 'ag-ev-bell', title: e.remind_min > 0 ? `avviso ${AVVISI.find(([m]) => m === e.remind_min)?.[1] || e.remind_min + ' min prima'}` : 'avviso all\'ora giusta', html: icon('bell', 'sm') }) : null),
      h('b', { text: e.title })));
}

// Il modulo per un impegno o un promemoria: nuovo (con il giorno scelto) o da modificare
function eventEditor(e, dayIso) {
  $('#agModal')?.remove();
  const isNew = !e;
  const v = e ? { tipo: e.kind, titolo: e.title, data: e.day, ora: e.allday ? '' : e.time, fine: e.allday ? '' : e.end_hm, allday: e.allday,
    luogo: e.location || '', note: e.notes || '', avviso: e.remind_min ?? -1 }
    : { tipo: 'evento', titolo: '', data: dayIso || isoDay(new Date()), ora: '09:00', fine: '10:00', allday: false, luogo: '', note: '', avviso: 30 };
  const title = h('input', { class: 'ag-in big', value: v.titolo, placeholder: 'Cosa devi fare?', 'aria-label': 'Titolo' });
  const date = h('input', { class: 'ag-in', type: 'date', value: v.data, 'aria-label': 'Data' });
  const t1 = h('input', { class: 'ag-in', type: 'time', value: v.ora || '09:00', 'aria-label': 'Ora' });
  const t2 = h('input', { class: 'ag-in', type: 'time', value: v.fine || '', 'aria-label': 'Fine' });
  const allday = h('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(!!v.allday), 'aria-label': 'Tutto il giorno',
    onclick: () => { allday.setAttribute('aria-checked', String(allday.getAttribute('aria-checked') !== 'true')); paint(); } }, h('span'));
  const where = h('input', { class: 'ag-in', value: v.luogo, placeholder: 'Luogo (facoltativo)', 'aria-label': 'Luogo' });
  const notes = h('textarea', { class: 'ag-in', rows: 3, placeholder: 'Note (facoltative)', 'aria-label': 'Note' }); notes.value = v.note;
  const avviso = h('select', { class: 'ag-in', 'aria-label': 'Avviso' }, ...AVVISI.map(([m, t]) => h('option', { value: String(m), text: t })));
  avviso.value = String(AVVISI.some(([m]) => m === v.avviso) ? v.avviso : 30);
  const kind = segmented([['evento', 'Impegno', 'calendar'], ['promemoria', 'Promemoria', 'bell']], v.tipo, () => paint(), 'Tipo');
  const timeRow = h('div', { class: 'ag-row2' }, h('label', { class: 'ag-f' }, h('span', { text: 'Ora' }), t1), h('label', { class: 'ag-f ag-end' }, h('span', { text: 'Fine' }), t2));
  const paint = () => {
    const ad = allday.getAttribute('aria-checked') === 'true';
    timeRow.classList.toggle('hidden', ad);
    $('.ag-end', timeRow).classList.toggle('hidden', kind.value() === 'promemoria');
  };
  const close = () => modal.remove();
  const save = async (btn) => {
    if (!title.value.trim()) { title.focus(); toast('Scrivi cosa devi fare'); return; }
    const ad = allday.getAttribute('aria-checked') === 'true';
    const body = { titolo: title.value.trim(), data: date.value, ora: ad ? '' : t1.value, fine: ad || kind.value() === 'promemoria' ? '' : t2.value,
      tipo: kind.value(), luogo: where.value.trim(), note: notes.value.trim(), avviso: +avviso.value };
    btn.disabled = true;
    try {
      await api(isNew ? '/api/calendar/event' : `/api/calendar/event/${encodeURIComponent(e.id)}`, body, isNew ? {} : { method: 'PUT' });
      toast(isNew ? 'Aggiunto in agenda' : 'Modifiche salvate');
      close(); if (S.ag) S.ag.sel = date.value; renderAgenda(); loadToday();
    } catch (ex) { btn.disabled = false; toast(ex.message); }
  };
  const saveBtn = h('button', { class: 'btn primary', text: isNew ? 'Aggiungi' : 'Salva', onclick: () => save(saveBtn) });
  const modal = h('div', { class: 'ag-modal', id: 'agModal', onclick: (ev) => { if (ev.target === modal) close(); } },
    h('div', { class: 'ag-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': isNew ? 'Nuovo impegno' : 'Modifica impegno' },
      h('div', { class: 'ag-sheet-h' }, h('b', { text: isNew ? 'Nuovo' : 'Modifica' }), kind,
        h('button', { class: 'icon-btn sm', title: 'Chiudi', 'aria-label': 'Chiudi', html: icon('x', 'sm'), onclick: close })),
      title,
      h('div', { class: 'ag-row2' }, h('label', { class: 'ag-f' }, h('span', { text: 'Giorno' }), date),
        h('div', { class: 'ag-f ag-ad' }, h('span', { text: 'Tutto il giorno' }), allday)),
      timeRow,
      h('label', { class: 'ag-f' }, h('span', { text: 'Avviso in Da Aura' }), avviso),
      where, notes,
      h('div', { class: 'ag-sheet-f' },
        !isNew ? confirmIcon('trash', 'Elimina', 'Eliminare?', async () => {
          try { await api(`/api/calendar/event/${encodeURIComponent(e.id)}`, undefined, { method: 'DELETE' }); toast('Tolto dall\'agenda'); close(); renderAgenda(); loadToday(); }
          catch (ex) { toast(ex.message); } }) : null,
        h('span', { class: 'grow' }),
        h('button', { class: 'btn', text: 'Annulla', onclick: close }), saveBtn)));
  modal.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') close(); if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') save(saveBtn); });
  document.body.append(modal); paint();
  if (isNew) setTimeout(() => title.focus(), 30);
}

// Il calendario piccolo in alto a destra: la settimana corrente, con un puntino nei giorni con qualcosa in agenda
async function loadToday() {
  if (!S.me?.calendar) return;
  const now = new Date(), mon = mondayOf(now);
  try {
    const d = await (await api(`/api/calendar/agenda?start=${isoDay(mon)}&days=7`)).json();
    S.week = d.events; S.today = d.events.filter((e) => e.day === isoDay(now) && !e.done);
  } catch { S.week = S.week || []; }
  renderCalChip();
  if ($('#main').classList.contains('empty')) renderHero();
}
function renderCalChip() {
  const chip = $('#calChip'); if (!chip) return;
  chip.classList.toggle('hidden', !S.me?.calendar);
  const now = new Date(), mon = mondayOf(now), days = new Set((S.week || []).map((e) => e.day));
  chip.replaceChildren(...DOW.map((x, k) => {
    const d = new Date(mon); d.setDate(mon.getDate() + k);
    const key = isoDay(d);
    return h('span', { class: 'cc-day' + (key === isoDay(now) ? ' today' : '') + (days.has(key) ? ' has' : '') }, h('i', { text: x }), h('b', { class: 'tnum', text: String(d.getDate()) }));
  }), h('span', { class: 'cc-count', text: S.today?.length ? String(S.today.length) : '' }));
  chip.title = S.today?.length ? `Oggi: ${S.today.map((e) => (e.allday ? '' : e.time + ' ') + e.title).join(', ')}` : 'Agenda: niente oggi';
}

// ================================================================ da Aura
// Qui e' Aura a scrivere per primo: codici di verifica, mail interessanti o sospette, mail spostate nel cestino (con ripristino).
// Le stesse cose arrivano come notifica sul telefono, se su quel dispositivo le hai attivate.
// «Da Aura» e' una chat: Aura ci scrive per primo (promemoria, codici, posta…) e tu gli rispondi lì, con tutti i suoi strumenti.
// Le impostazioni (posta, notifiche, accensione del PC) stanno nella pagina che si apre dall'ingranaggio.
const isAuraChat = (c) => !!c && !!S.me?.aura_chat && c.id === S.me.aura_chat;
function closeAura() { $('#main').classList.remove('aura-open'); }
async function loadAuraFeed() {
  const d = await (await api('/api/aura/feed')).json();
  S.feed = Object.fromEntries(d.items.map((i) => [i.id, i])); S.feedInfo = d;
  return d;
}
async function openAura() {
  closeSide(); togglePicker(false); closeViews();
  const id = S.me?.aura_chat; if (!id) return;
  try {
    await loadAuraFeed();
    let c = S.chats.find((x) => x.id === id);
    if (!c) { c = { id, title: 'Aura', created: Date.now() }; S.chats.push(c); }
    Object.assign(c, await Store.get(id));
    S.currentId = id; S.editing = null; S.attachments = [];
  } catch (e) { toast('Non riesco ad aprire Da Aura: ' + e.message); return; }
  renderAll(); scrollToBottom(true); focusInput();
  api('/api/aura/feed/read', {}).then(() => { $('#auraCount').textContent = ''; }).catch(() => {});
}
$('#auraBtn').onclick = openAura;
async function refreshAuraBadge() {
  try {
    const before = S.feed ? Object.keys(S.feed).length : -1;
    const d = await loadAuraFeed();
    $('#auraCount').textContent = isAuraChat(current()) ? '' : d.unread || '';
    // Da Aura aperta e c'e' un messaggio nuovo: lo si mostra subito
    if (isAuraChat(current()) && !S.stream && before >= 0 && d.items.length !== before) {
      Object.assign(current(), await Store.get(S.me.aura_chat));
      renderThread(); keepFollowing();
      api('/api/aura/feed/read', {}).catch(() => {});
    }
  } catch {}
}
const b64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
async function pushState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !window.isSecureContext) return isIOS() && !isStandalone() ? 'ios' : 'unsupported';
  try {
    // getRegistration e non .ready: se il service worker non si registra, .ready resterebbe in attesa per sempre
    const reg = await navigator.serviceWorker.getRegistration('/');
    if (reg && await reg.pushManager.getSubscription()) return 'on';
  } catch {}
  return Notification.permission === 'denied' ? 'denied' : 'off';
}
async function swReady() {
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  return reg.active ? reg : Promise.race([navigator.serviceWorker.ready,
    new Promise((_, rej) => setTimeout(() => rej(new Error('il servizio delle notifiche non parte in questo browser')), 10000))]);
}
async function pushEnable() {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast('Notifiche non permesse: abilitale dalle impostazioni del sito e riprova.'); return; }
  try {
    const reg = await swReady();
    const { key } = await (await api('/api/push/key')).json();
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(key) });
    await api('/api/push/subscribe', sub.toJSON());
    await api('/api/push/test', { delay: 0, endpoint: sub.endpoint });
    toast('Notifiche attive su questo dispositivo: te ne ho mandata una di prova');
  } catch (e) { toast('Non riesco ad attivare le notifiche: ' + e.message); }
}
// Diagnosi delle notifiche su questo dispositivo: permesso, servizio in background, iscrizione conosciuta dal server
async function pushDiagRow() {
  const box = h('div', { class: 'push-diag' }, h('small', { text: 'Controllo…' }));
  (async () => {
    let reg = null, sub = null;
    try { reg = await navigator.serviceWorker.getRegistration('/'); sub = reg && await reg.pushManager.getSubscription(); } catch {}
    let st = {};
    try { st = await (await api('/api/push/status')).json(); } catch {}
    const known = sub && (st.devices || []).some((d) => d.endpoint === sub.endpoint);
    const perm = 'Notification' in window ? Notification.permission : 'n/d';
    const line = (ok, txt) => h('div', { class: 'pd-line' + (ok ? ' ok' : ' no'), html: icon(ok ? 'check' : 'x', 'sm') + `<span>${txt}</span>` });
    const last = st.last ? `Ultima notifica: ${st.last.ok ? 'consegnata a Google' : st.last.detail} alle ${new Date(st.last.at * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : '';
    const test = h('button', { class: 'btn sm primary', html: icon('bell', 'sm') + 'Prova tra 30 secondi', disabled: !known, onclick: async () => {
      try { await api('/api/push/test', { delay: 30, endpoint: sub.endpoint }); toast('Ora chiudi l\'app e blocca il telefono: tra 30 secondi arriva la prova'); }
      catch (e) { toast(e.message); } } });
    const redo = h('button', { class: 'btn sm', text: 'Rifai l\'iscrizione', onclick: async () => {
      try { if (sub) { await api('/api/push/unsubscribe', sub.toJSON()).catch(() => {}); await sub.unsubscribe(); } } catch {}
      await pushEnable(); renderAuraSettings(); } });
    box.replaceChildren(
      line(perm === 'granted', perm === 'granted' ? 'Permesso concesso' : perm === 'denied' ? 'Permesso bloccato dal browser' : 'Permesso non ancora dato'),
      line(!!reg?.active, reg?.active ? 'Servizio notifiche attivo' : 'Servizio notifiche non attivo su questo dispositivo'),
      line(!!known, known ? 'Questo dispositivo è iscritto e il server lo conosce' : sub ? 'Iscrizione vecchia: il server non la conosce (rifai l\'iscrizione)' : 'Questo dispositivo non è iscritto'),
      last ? h('small', { class: 'pd-last', text: last }) : null,
      h('div', { class: 'form-actions' }, test, redo));
  })();
  return box;
}
async function pushDisable() {
  try {
    const reg = await navigator.serviceWorker.getRegistration('/'), sub = reg && await reg.pushManager.getSubscription();
    if (sub) { await api('/api/push/unsubscribe', sub.toJSON()).catch(() => {}); await sub.unsubscribe(); }
    toast('Notifiche spente su questo dispositivo');
  } catch (e) { toast(e.message); }
}

async function feedAct(it, action, mid, extra) {
  try {
    const r = await (await api(`/api/aura/feed/${it.id}/act`, { action, mid, ...(extra || {}) })).json();
    if (r.message) toast(r.message);
  } catch (e) { toast(e.message); }
  try { await loadAuraFeed(); } catch {}
  if (isAuraChat(current())) renderThread();
}
const AURA_KIND = { code: ['Codice', 'key'], mail: ['Posta', 'mail'], suspect: ['Attenzione', 'shield'], trashed: ['Pulizia', 'trash'],
  reminder: ['Promemoria', 'bell'], brief: ['Buongiorno', 'sun'], power: ['PC', 'power'], deadline: ['Scadenza', 'calendar'],
  parcel: ['Pacco', 'box'], checked: ['Posta controllata', 'check'], homebase: ['Homebase', 'home'] };
const PARCEL_STEPS = ['ordinato', 'spedito', 'in consegna', 'consegnato'];
const hhmm = (sec) => new Date(sec * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const shortDay = (iso) => { const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'numeric' }); };
const daysTo = (iso) => Math.round((new Date(iso + 'T12:00:00') - new Date(new Date().toDateString() + ' 12:00')) / 86400000);
function daySep(ts) {
  const d = new Date(ts), t = new Date(), y = new Date(Date.now() - 86400000);
  const txt = d.toDateString() === t.toDateString() ? 'Oggi' : d.toDateString() === y.toDateString() ? 'Ieri'
    : d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  return h('div', { class: 'au-day', role: 'separator' }, h('span', { text: txt }));
}
// Il pacco: i quattro passaggi, con quello attuale acceso
function parcelTrack(status) {
  const k = PARCEL_STEPS.indexOf(status), bad = status === 'problema';
  return h('div', { class: 'au-track' + (bad ? ' bad' : ''), 'aria-label': 'Stato: ' + status },
    ...PARCEL_STEPS.map((st, n) => h('div', { class: 'au-step' + (n <= k ? ' on' : '') + (n === k ? ' now' : '') }, h('i'), h('span', { text: st }))));
}
// ------------------------------------------------------------------ Homebase (amministrazione)
// Le richieste della Homebase in «Da Aura» e le risposte degli strumenti admin in chat: con lo stile della Homebase
const HB_KIND = { reg: ['Nuova registrazione', 'user', 'amber'], pwd: ['Password dimenticata', 'key', 'violet'], msg: ['Messaggio di un utente', 'mail', 'blue'] };
const HB_DONE = { hb_approved: ['Approvato: ora può entrare', 'green'], hb_rejected: ['Registrazione rifiutata', 'red'], hb_pwd_done: ['Password nuova creata', 'green'],
  hb_done: ['Richiesta completata', 'green'], hb_completato: ['Risposta inviata, completato', 'green'], hb_in_valutazione: ['In valutazione', 'blue'],
  hb_archiviato: ['Archiviato', 'gray'], hb_nuovo: ['Rimesso come nuovo', 'blue'], hb_elsewhere: ['Gestita direttamente nella Homebase', 'gray'] };
const initials = (s) => String(s || '?').replace(/^@/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
function hbHead(title, time) {
  return h('div', { class: 'hb-top' }, h('span', { class: 'hb-logo', html: icon('home', 'sm') }), h('b', { text: 'HomeBase' }),
    h('span', { class: 'hb-sub', text: title }), time ? h('span', { class: 'hb-time tnum', text: time }) : null);
}
function hbCard(it) {
  const d = it.data || {}, [label, ic, tone] = HB_KIND[d.hb] || ['Richiesta', 'home', 'blue'];
  const done = HB_DONE[it.status];
  const btn = (txt, cls, ic2, fn) => h('button', { class: 'hb-btn ' + cls, html: (ic2 ? icon(ic2, 'sm') : '') + txt, onclick: async (e) => {
    const b = e.currentTarget; b.disabled = true; b.classList.add('busy'); await fn(); } });
  const body = [hbHead('Amministrazione', hhmm(it.at)),
    h('div', { class: 'hb-kind t-' + tone, html: icon(ic, 'sm') + label }),
    h('div', { class: 'hb-person' }, h('span', { class: 'hb-av t-' + tone, text: initials(d.nome) }),
      h('div', { class: 'tx' }, h('b', { text: d.nome || '@' + (d.username || '') }), h('small', { text: ['@' + (d.username || ''), d.email].filter(Boolean).join(' · ') })))];
  const acts = [];
  if (d.hb === 'msg') {
    body.push(h('div', { class: 'hb-tags' }, d.tipo ? h('span', { class: 'hb-tag', text: d.tipo }) : null,
      d.priorita ? h('span', { class: 'hb-tag p-' + d.priorita, text: 'priorità ' + d.priorita }) : null));
    body.push(h('div', { class: 'hb-subj', text: d.oggetto || '' }), h('div', { class: 'hb-msg', text: d.messaggio || '' }));
    if (d.risposta) body.push(h('div', { class: 'hb-reply-done' }, h('small', { text: 'La tua risposta' }), h('div', { text: d.risposta })));
    if (!done) {
      const ta = h('textarea', { class: 'hb-reply', rows: 2, placeholder: `Rispondi a @${d.username || ''}…`, 'aria-label': 'Risposta' });
      body.push(ta);
      acts.push(btn('Rispondi e completa', 'hb-btn--primary', 'check', () => feedAct(it, 'hb_reply', null, { text: ta.value, value: 'completato' })),
        btn('In valutazione', '', 'eye', () => feedAct(it, 'hb_msg_state', null, { value: 'in_valutazione' })),
        btn('Archivia', '', null, () => feedAct(it, 'hb_msg_state', null, { value: 'archiviato' })));
    }
  } else if (d.hb === 'reg') {
    body.push(h('div', { class: 'hb-msg', text: 'Chiede di entrare nella Homebase. Se approvi, gli preparo la dashboard iniziale.' }));
    if (!done) acts.push(btn('Approva', 'hb-btn--success', 'check', () => feedAct(it, 'hb_approve')), btn('Rifiuta', 'hb-btn--danger', 'x', () => feedAct(it, 'hb_reject')));
  } else if (d.hb === 'pwd') {
    body.push(h('div', { class: 'hb-msg', text: 'Ha chiesto di reimpostare la password. La genera la Homebase e te la do dentro un link segreto da mandargli: si apre una volta sola.' }));
    if (!done) acts.push(btn('Crea password e link', 'hb-btn--primary', 'key', () => feedAct(it, 'hb_pwd_reset')),
      btn('Segna come fatta', '', 'check', () => feedAct(it, 'hb_pwd_done')));
  }
  if (d.secret_link && it.status === 'hb_pwd_done') {
    body.push(h('div', { class: 'hb-secret' }, h('small', { text: 'Link segreto per @' + (d.username || '') + ' (una sola apertura, 24 ore)' }),
      h('div', { class: 'hb-secret-row' }, h('code', { class: 'mono', text: d.secret_link }),
        h('button', { class: 'hb-btn hb-btn--sm', html: icon('copy', 'sm') + 'Copia', onclick: () => navigator.clipboard.writeText(d.secret_link).then(() => toast('Link copiato')) }))));
  }
  if (done) body.push(h('div', { class: 'hb-done t-' + done[1], html: icon('check', 'sm') + done[0] }));
  if (acts.length) body.push(h('div', { class: 'hb-actions' }, ...acts));
  if (d.admin_url) body.push(h('a', { class: 'hb-open', href: d.admin_url, target: '_blank', rel: 'noopener', html: 'Apri nella Homebase ' + icon('chevron', 'sm') }));
  return h('div', { class: 'msg au-row ak-homebase' + (it.unread ? ' unread' : '') }, h('span', { class: 'au-mini', 'aria-hidden': 'true' }, h('span')),
    h('div', { class: 'hb-card' }, ...body));
}
// Risposta di homebase_admin in chat: un pannello con le righe (utenti, richieste, strumenti, accessi…)
// Consuntivo di un giorno: voci con i tempi a mezz'ore, barra verso le 8 ore, testo da copiare nel gestionale
function consView(v) {
  const hm = (m) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`;
  const day = `${v.day.slice(8)}/${v.day.slice(5, 7)}/${v.day.slice(0, 4)}`;
  const text = (v.rows || []).map((r) => `${r.what}\t${r.client}\t${hm(r.min)}`).join('\n') + `\nTotale\t\t${hm(v.total)}`;
  const pct = Math.min(100, Math.round((v.total / (v.target || 480)) * 100));
  return h('div', { class: 'cs-card' },
    h('div', { class: 'cs-head' }, h('b', { text: `Consuntivo del ${day}` }),
      (v.rows || []).length ? h('button', { class: 'cs-copy', 'data-label': '1', title: 'Copia per il gestionale', html: icon('copy', 'sm') + 'Copia', onclick: (e) => copyText(text, e.currentTarget) }) : null),
    (v.rows || []).length ? h('div', { class: 'cs-rows' }, ...v.rows.map((r) => h('div', { class: 'cs-row' },
      h('div', { class: 'tx' }, h('span', { text: r.what }), h('small', { text: r.client })), h('span', { class: 'cs-time', text: hm(r.min) })))) : null,
    h('div', { class: 'cs-total' }, h('span', { text: 'Totale' }), h('b', { text: `${hm(v.total)} su ${hm(v.target || 480)}` })),
    h('div', { class: 'cs-bar' + (v.total > (v.target || 480) ? ' over' : v.total === (v.target || 480) ? ' full' : '') }, h('i', { style: `width:${pct}%` })),
    v.note ? h('div', { class: 'cs-note', text: v.note }) : null,
    (v.excluded || []).length ? h('details', { class: 'cs-ex' }, h('summary', { text: `Lasciati fuori (${v.excluded.length}): non sono lavoro` }),
      h('ul', {}, ...v.excluded.map((x) => h('li', { text: x })))) : null);
}
function hbView(v) {
  return h('div', { class: 'hb-card hb-view' }, hbHead(v.title || 'Amministrazione'),
    v.note ? h('div', { class: 'hb-note', text: v.note }) : null,
    (v.rows || []).length ? h('div', { class: 'hb-rows' }, ...v.rows.map((r) => h('div', { class: 'hb-row' + (r.open ? ' can-open' : ''),
      onclick: r.open ? () => openHbDoc(r.open) : null },
      h('i', { class: 'hb-dot t-' + (r.tone || 'gray') }),
      h('div', { class: 'tx' }, h('b', { text: r.title || '' }), r.sub ? h('small', { text: r.sub }) : null),
      r.badge ? h('span', { class: 'hb-tag t-' + (r.tone || 'gray'), text: r.badge }) : null,
      r.open ? h('button', { class: 'hb-btn hb-btn--sm', text: 'Apri', onclick: (e) => { e.stopPropagation(); openHbDoc(r.open); } })
        : r.url ? h('a', { class: 'hb-btn hb-btn--sm', href: r.url, target: '_blank', rel: 'noopener', text: 'Homebase', onclick: (e) => e.stopPropagation() }) : null))) : null,
    v.url ? h('a', { class: 'hb-open', href: v.url, target: '_blank', rel: 'noopener', html: 'Apri nella Homebase ' + icon('chevron', 'sm') }) : null);
}
// Procedura o nota della Homebase, dentro Aura: passaggi da spuntare, comandi da copiare, avvisi colorati
const HB_BLOCK = { note: ['Nota', 'blue'], warning: ['Attenzione', 'amber'], important: ['Importante', 'violet'], prerequisite: ['Prima di iniziare', 'violet'],
  expected: ['Risultato atteso', 'green'], verify: ['Verifica', 'blue'], error: ['Errore comune', 'red'], fix: ['Soluzione', 'green'] };
function hbBlock(b) {
  const copyBtn = (txt) => h('button', { class: 'hb-btn hb-btn--sm hb-copy', html: icon('copy', 'sm') + 'Copia', onclick: (e) => copyText(txt, e.currentTarget) });
  if (b.t === 'title' || b.t === 'section') return h('h4', { class: 'hb-h', text: b.c });
  if (b.t === 'subsection') return h('h5', { class: 'hb-h sub', text: b.c });
  if (b.t === 'separator') return h('hr', { class: 'hb-hr' });
  if (b.t === 'space' || b.t === 'group' || b.t === 'group_end') return null;
  if (b.t === 'command' || b.t === 'code' || b.t === 'registry') return h('div', { class: 'hb-code' },
    h('div', { class: 'hb-code-h' }, h('span', { text: b.lang || (b.t === 'registry' ? 'registro' : b.t === 'command' ? 'comando' : 'codice') }), copyBtn(b.c)),
    h('pre', { class: 'mono', text: b.c }), b.desc ? h('small', { class: 'hb-desc', text: b.desc }) : null);
  if (b.t === 'path' || b.t === 'parameter') return h('div', { class: 'hb-path' }, h('code', { class: 'mono', text: b.c }), copyBtn(b.c));
  if (b.t === 'output') return h('div', { class: 'hb-output' }, h('div', { class: 'hb-code-h' }, h('span', { text: 'Testo' }), copyBtn(b.c)), h('div', { text: b.c }));
  if (b.t === 'link') return h('a', { class: 'hb-link', href: b.c, target: '_blank', rel: 'noopener', text: b.c });
  if (b.t === 'list') return h('ul', { class: 'hb-list' }, ...(b.items || []).map((x) => h('li', { text: x })));
  if ((b.t === 'table' || b.t === 'keyvalue') && b.rows?.length) {
    const rows = b.rows.map((r) => (Array.isArray(r) ? r : Object.values(r || {})));
    return h('div', { class: 'hb-table-w' }, h('table', { class: 'hb-table' }, ...rows.map((r, i) => h('tr', {}, ...r.map((c) => h(b.header && i === 0 ? 'th' : 'td', { text: String(c ?? '') }))))));
  }
  if (b.t === 'screenshot') return h('div', { class: 'hb-note-s', text: '📷 Immagine: la trovi nella procedura sulla Homebase' });
  const box = HB_BLOCK[b.t];
  if (box) return h('div', { class: 'hb-callout t-' + box[1] }, h('b', { text: box[0] }), h('div', { text: b.c }));
  return b.c.trim() ? h('div', { class: 'hb-text', text: b.c }) : null;
}
function hbDocView(v, onChange) {
  const done = (v._done ||= []);
  const steps = (v.steps || []).map((s, i) => {
    const chk = h('input', { type: 'checkbox', checked: done.includes(i) || null, 'aria-label': 'Passo fatto', onchange: (e) => {
      if (e.target.checked) { if (!done.includes(i)) done.push(i); } else done.splice(done.indexOf(i), 1);
      el.classList.toggle('done', e.target.checked); bar.firstChild.style.width = `${Math.round((100 * done.length) / (v.steps.length || 1))}%`;
      prog.textContent = `${done.length} di ${v.steps.length} passaggi`; onChange?.(); } });
    const el = h('div', { class: 'hb-step' + (done.includes(i) ? ' done' : '') },
      h('label', { class: 'hb-step-h' }, chk, h('span', { class: 'hb-step-n', text: String(s.n ?? i + 1) }), h('b', { text: s.title })),
      h('div', { class: 'hb-step-b' }, ...s.blocks.map(hbBlock).filter(Boolean)));
    return el;
  });
  const bar = h('div', { class: 'hb-prog' }, h('i', { style: `width:${Math.round((100 * done.length) / ((v.steps || []).length || 1))}%` }));
  const prog = h('small', { text: `${done.length} di ${(v.steps || []).length} passaggi` });
  return h('div', { class: 'hb-card hb-view hb-doc' }, hbHead(v.doc === 'nota' ? 'Nota' : v.doc === 'runbook' ? 'Runbook' : 'Procedura', ''),
    h('div', { class: 'hb-doc-h' }, h('h3', { text: v.title }),
      h('div', { class: 'hb-tags' }, v.category ? h('span', { class: 'hb-tag t-blue', text: v.category }) : null, v.updated ? h('span', { class: 'hb-tag', text: 'agg. ' + v.updated }) : null)),
    v.description ? h('div', { class: 'hb-msg', text: v.description }) : null,
    v.doc === 'nota' ? h('div', { class: 'hb-text md', html: renderMarkdown(v.text || '') }) : null,
    steps.length ? h('div', { class: 'hb-doc-prog' }, bar, prog) : null,
    ...steps,
    v.url ? h('a', { class: 'hb-open', href: v.url, target: '_blank', rel: 'noopener', html: 'Apri nella Homebase ' + icon('chevron', 'sm') }) : null);
}
async function openHbDoc(o) {
  const close = () => modal.remove();
  const body = h('div', { class: 'list-empty', text: 'Apro…' });
  const modal = h('div', { class: 'ag-modal', onclick: (e) => { if (e.target === modal) close(); } },
    h('div', { class: 'ag-sheet hb-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Homebase' },
      h('div', { class: 'ag-sheet-h' }, h('span', { class: 'grow' }), h('button', { class: 'icon-btn sm', 'aria-label': 'Chiudi', html: icon('x', 'sm'), onclick: close })), body));
  document.body.append(modal);
  try { body.replaceWith(hbDocView(await (await api(`/api/homebase/doc?tipo=${o.tipo}&id=${o.id}`)).json())); }
  catch (e) { body.textContent = e.message; }
}
function feedCard(it) {
  if (it.kind === 'homebase') return hbCard(it);
  const d = it.data || {};
  const done = { keep: 'Segnato come interessante', junk: 'Non ti interessa: d\'ora in poi le cestino', restored: 'Rimesse nella posta in arrivo',
    dismissed: 'Fatto', snoozed: 'Te lo ricordo tra 10 minuti', added: 'Promemoria messo', delivered: 'Consegnato' }[it.status];
  const chip = (txt, ic, fn, primary) => h('button', { class: 'au-chip' + (primary ? ' primary' : ''), html: (ic ? icon(ic, 'sm') : '') + txt, onclick: fn });
  const link = d.link ? h('a', { class: 'au-chip', href: d.link, target: '_blank', rel: 'noopener', html: icon('mail', 'sm') + 'Apri la mail' }) : null;
  const [kind, kic] = AURA_KIND[it.kind] || ['Aura', 'bell'];
  const body = [h('div', { class: 'au-meta' }, h('span', { class: 'au-kind', html: icon(kic, 'sm') + kind }), h('span', { class: 'au-time tnum', text: hhmm(it.at) }))];
  const title = it.title.replace(/^[^\p{L}\p{N}]+/u, '');
  const chips = [];
  if (it.kind === 'code' && d.code) {
    body.push(h('div', { class: 'au-code-row' }, h('span', { class: 'au-codebox mono', text: d.code }),
      chip('Copia', 'copy', () => navigator.clipboard.writeText(d.code).then(() => toast('Codice copiato')), true)));
    body.push(h('div', { class: 'au-sub', text: `Da ${d.from || ''}${d.subject ? ' · ' + d.subject : ''}` }));
  } else if (it.kind === 'deadline') {
    const due = d.due ? new Date(d.due + 'T12:00:00') : null, left = d.due ? daysTo(d.due) : null;
    body.push(h('div', { class: 'au-due' },
      due ? h('div', { class: 'au-cal' + (left <= 2 ? ' soon' : '') }, h('small', { text: due.toLocaleDateString('it-IT', { month: 'short' }) }), h('b', { class: 'tnum', text: String(due.getDate()) })) : null,
      h('div', { class: 'au-due-tx' }, h('div', { class: 'au-title', text: d.cosa || title }),
        h('div', { class: 'au-sub', text: [d.amount, left == null ? '' : left < 0 ? 'scaduta' : left === 0 ? 'scade oggi' : left === 1 ? 'scade domani' : `tra ${left} giorni`].filter(Boolean).join(' · ') }))));
    if (!d.agenda_id && !done) chips.push(chip('Mettimi un promemoria', 'bell', () => feedAct(it, 'deadline_add'), true));
    else if (d.agenda_id && !done) body.push(h('div', { class: 'feed-done', html: icon('check', 'sm') + 'Promemoria in agenda' }));
    if (link) chips.push(link);
  } else if (it.kind === 'parcel') {
    const p = (S.feedInfo?.parcels || []).find((x) => x.id === d.parcel_id);
    body.push(h('div', { class: 'au-title', text: title }));
    if (it.body) body.push(h('div', { class: 'au-text', text: it.body }));
    body.push(parcelTrack(p?.status || d.status));
    if (p?.tracking || p?.carrier) body.push(h('div', { class: 'au-sub mono', text: [p.carrier, p.tracking].filter(Boolean).join(' · ') }));
    if (p && p.status !== 'consegnato' && !done) chips.push(chip('L\'ho ricevuto', 'check', () => feedAct(it, 'parcel_done')));
    if (link) chips.push(link);
  } else if (it.kind === 'checked') {
    const items = d.items || [];
    const open = !!S.auOpenChecked?.[it.id];
    const det = h('details', { class: 'au-checked', open: open || null, ontoggle: () => { (S.auOpenChecked ||= {})[it.id] = det.open; } },
      h('summary', {}, h('span', { text: `Ho guardato altre ${items.length} ${items.length === 1 ? 'mail' : 'mail'}: niente di urgente` }), h('span', { class: 'chev', html: icon('chevron', 'sm') })),
      h('ul', { class: 'feed-trash au-list' }, ...items.map((t) => h('li', {},
        h('span', { class: 'au-ini', 'aria-hidden': 'true', text: initials(t.from) }),
        h('div', { class: 'tx' }, h('b', { text: t.from }), h('small', { text: t.why || t.subject, title: t.why || t.subject })),
        t.link ? h('a', { class: 'au-chip sm', href: t.link, target: '_blank', rel: 'noopener', text: 'Apri' }) : null))));
    body.push(det);
  } else {
    if (!['reminder', 'brief', 'power'].includes(it.kind) || !it.body) body.push(h('div', { class: 'au-title', text: title }));
    if (it.body && it.kind !== 'trashed') body.push(h('div', { class: 'au-text', text: it.body }));
  }
  if (it.kind === 'trashed') {
    const items = d.items || [];
    body.push(h('ul', { class: 'feed-trash au-list' }, ...items.map((t) => h('li', { class: t.restored ? 'restored' : '' },
      h('span', { class: 'au-ini', 'aria-hidden': 'true', text: initials(t.from) }),
      h('div', { class: 'tx' }, h('b', { text: t.from }), h('small', { text: t.subject, title: t.subject })),
      t.restored ? h('small', { class: 'ok', html: icon('check', 'sm') + 'rimessa' })
        : h('button', { class: 'au-chip sm', html: icon('retry', 'sm') + 'Ripristina', title: 'Rimettila nella posta in arrivo', onclick: () => feedAct(it, 'restore', t.mid) })))));
    if (items.filter((t) => !t.restored).length > 1) chips.push(chip('Ripristina tutte', null, () => feedAct(it, 'restore')));
  } else if ((it.kind === 'mail' || it.kind === 'suspect') && !done) {
    if (it.kind === 'mail') chips.push(chip('Interessante', 'check', () => feedAct(it, 'keep'), true));
    chips.push(chip('Non mi interessa', 'trash', () => feedAct(it, 'junk')));
    if (link) chips.push(link);
  } else if (it.kind === 'reminder' && !done) {
    chips.push(chip('Fatto', 'check', async () => { await feedAct(it, 'dismiss'); loadToday(); if (BP.tree) renderBrainPanel(); }, true),
      chip('Tra 10 minuti', 'calendar', () => feedAct(it, 'snooze')));
  } else if (link && !['deadline', 'parcel'].includes(it.kind)) chips.push(link);
  if (done) body.push(h('div', { class: 'feed-done', html: icon('check', 'sm') + done }));
  if (chips.length) body.push(h('div', { class: 'au-chips' }, ...chips));
  return h('div', { class: 'msg au-row ak-' + it.kind + (it.unread ? ' unread' : '') },
    h('span', { class: 'au-mini', 'aria-hidden': 'true' }, h('span')),
    h('div', { class: 'au-bubble' }, h('span', { class: 'au-badge', 'aria-hidden': 'true', html: icon(kic, 'sm') }), h('div', { class: 'au-body' }, ...body)));
}
// In cima a «Da Aura»: il saluto, cosa sta guardando Aura e quattro riquadri (agenda, posta, pacchi, scadenze)
function auraBanner() {
  const f = S.feedInfo || {}, w = f.watch || {}, today = S.today || [], mt = f.mail_today || {};
  const parcels = (f.parcels || []).filter((p) => p.status !== 'consegnato'), dls = f.deadlines || [];
  const hr = new Date().getHours();
  const hi = hr < 6 ? 'Ancora sveglio?' : hr < 13 ? 'Buongiorno' : hr < 18 ? 'Buon pomeriggio' : 'Buonasera';
  const status = w.error ? `Problema con la posta: ${w.error}` : w.enabled ? `Tengo d'occhio posta e agenda${w.last ? ' · ultimo controllo alle ' + hhmm(w.last) : ''}` : 'Tengo d\'occhio la tua agenda';
  const tile = (cls, ic, label, value, sub, onclick, extra) => h('button', { class: 'au-tile ' + cls + (S.auDrawer === cls ? ' on' : ''), type: 'button', onclick },
    h('span', { class: 'au-tile-top' }, h('span', { class: 'au-tile-ic', html: icon(ic, 'sm') }), h('span', { class: 'au-tile-l', text: label })),
    h('b', { class: 'au-tile-v tnum', text: value }), h('small', { class: 'au-tile-s', text: sub }), extra || null);
  const drawer = (k) => () => { S.auDrawer = S.auDrawer === k ? null : k; renderThread(); };
  const seg = (n, cls) => n ? h('i', { class: cls, style: `flex:${n}` }) : null;
  const tiles = [
    tile('t-agenda', 'calendar', 'Agenda di oggi', String(today.length), today.length ? today.slice(0, 2).map((e) => (e.allday ? '' : e.time + ' ') + e.title).join(' · ') : 'Giornata libera', openAgenda),
    w.gmail ? tile('t-mail', 'mail', 'Mail di oggi', String(mt.total || 0),
      mt.total ? [`${mt.interessante || 0} per te`, mt.inutile ? `${mt.inutile} nel cestino` : '', mt.codice ? `${mt.codice} codici` : ''].filter(Boolean).join(' · ') : 'Ancora niente oggi',
      openAuraSettings, mt.total ? h('span', { class: 'au-bar' }, seg(mt.interessante, 'b-int'), seg(mt.codice, 'b-code'), seg(mt.normale, 'b-norm'), seg(mt.sospetta, 'b-sus'), seg(mt.inutile, 'b-junk')) : null) : null,
    w.gmail ? tile('t-parcels', 'box', 'In arrivo', String(parcels.length), parcels.length ? `${parcels[0].title} · ${parcels[0].status}` : 'Nessuno in viaggio', drawer('t-parcels')) : null,
    w.gmail ? tile('t-dead', 'bell', 'Scadenze', dls[0] ? shortDay(dls[0].due) : '—', dls[0] ? dls[0].title + (dls[0].amount ? ' · ' + dls[0].amount : '') : 'Nessuna in vista', drawer('t-dead')) : null,
  ].filter(Boolean);
  let panel = null;
  if (S.auDrawer === 't-parcels') {
    const all = f.parcels || [];
    panel = h('div', { class: 'au-drawer' }, all.length ? all.map((p) => h('div', { class: 'au-dr-row' },
      h('div', { class: 'tx' }, h('b', { text: p.title }), h('small', { text: [p.shop, p.carrier, p.eta && p.status !== 'consegnato' ? 'arrivo ' + shortDay(p.eta) : ''].filter(Boolean).join(' · ') })),
      parcelTrack(p.status), p.link ? h('a', { class: 'au-chip sm', href: p.link, target: '_blank', rel: 'noopener', text: 'Mail' }) : null))
      : h('div', { class: 'au-dr-empty', text: 'Quando nelle mail arriva un ordine o una spedizione, lo segno qui e ti dico quando arriva.' }));
  } else if (S.auDrawer === 't-dead') {
    panel = h('div', { class: 'au-drawer' }, dls.length ? dls.map((x) => { const left = daysTo(x.due);
      return h('div', { class: 'au-dr-row' },
        h('div', { class: 'au-cal sm' + (left <= 2 ? ' soon' : '') }, h('small', { text: new Date(x.due + 'T12:00:00').toLocaleDateString('it-IT', { month: 'short' }) }), h('b', { class: 'tnum', text: String(new Date(x.due + 'T12:00:00').getDate()) })),
        h('div', { class: 'tx' }, h('b', { text: x.title }), h('small', { text: [x.amount, left === 0 ? 'oggi' : left === 1 ? 'domani' : `tra ${left} giorni`].filter(Boolean).join(' · ') })),
        h('a', { class: 'au-chip sm', href: x.link, target: '_blank', rel: 'noopener', text: 'Mail' })); })
      : h('div', { class: 'au-dr-empty', text: 'Bollette, fatture e rinnovi che arrivano per mail: li segno qui e ti metto un promemoria il giorno prima.' }));
  }
  return h('div', { class: 'au-banner' },
    h('div', { class: 'au-glow', 'aria-hidden': 'true' }),
    h('div', { class: 'au-head' },
      h('div', { class: 'au-avatar', 'aria-hidden': 'true' }, h('span')),
      h('div', { class: 'au-who' }, h('b', { text: `${hi}, sono Aura` }), h('small', { class: w.error ? 'err' : '', text: status })),
      h('button', { class: 'icon-btn', title: 'Impostazioni', 'aria-label': 'Impostazioni di Aura', html: icon('settings'), onclick: openAuraSettings })),
    h('div', { class: 'au-tiles' + (tiles.length < 4 ? ' few' : '') }, ...tiles), panel);
}
// Accensione automatica del PC (ESP32): ora, giorni e interruttore
function powerRow(p) {
  const save = async (patch) => {
    try { await api('/api/power/schedule', { enabled: !!p.enabled, at: p.at, days: p.days, ...patch }, { method: 'PUT' }); toast('Accensione automatica aggiornata'); }
    catch (e) { toast(e.message); }
    renderAuraSettings();
  };
  const sw = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(!!p.enabled), 'aria-label': 'Accensione automatica del PC',
    onclick: () => save({ enabled: !p.enabled }) }, h('span'));
  const time = h('input', { type: 'time', class: 'au-time-in', value: p.at, 'aria-label': 'Ora di accensione', onchange: (e) => e.target.value && save({ at: e.target.value }) });
  const days = segmented([['1234567', 'Ogni giorno'], ['12345', 'Lun–Ven']], p.days === '12345' ? '12345' : '1234567', (v) => save({ days: v }), 'Giorni');
  return h('div', { class: 'feed-set-row' },
    h('div', { class: 'tx' }, h('b', { text: 'Accendo il PC da solo' }),
      h('small', { text: p.enabled ? `${p.days === '12345' ? 'Dal lunedì al venerdì' : 'Ogni giorno'} alle ${p.at}, solo se è spento: così mi metto al lavoro sulla posta.` : 'Spento: il PC lo accendi tu.' })),
    h('div', { class: 'form-actions' }, p.enabled ? time : null, p.enabled ? days : null, sw));
}
async function openAuraSettings() {
  closeSide(); $('#main').classList.add('aura-open');
  await renderAuraSettings();
}
async function renderAuraSettings() {
  const root = $('#auraView');
  let d;
  try { d = await loadAuraFeed(); }
  catch (e) { root.replaceChildren(h('div', { class: 'set-wrap' }, h('div', { class: 'card list-empty', text: e.message }))); return; }
  const ps = await pushState(), w = d.watch;
  const head = h('div', { class: 'set-head' }, h('h1', { text: 'Impostazioni di Aura' }),
    h('button', { class: 'icon-btn', title: 'Chiudi', 'aria-label': 'Chiudi', html: icon('x'), onclick: () => { closeAura(); focusInput(); } }));
  const pushCtl = ps === 'on' ? h('button', { class: 'btn sm', text: 'Spegni qui', onclick: async () => { await pushDisable(); renderAuraSettings(); } })
    : ps === 'off' ? h('button', { class: 'btn sm primary', html: icon('bell', 'sm') + 'Attiva', onclick: async () => { await pushEnable(); renderAuraSettings(); } }) : null;
  const pushTxt = { on: 'Attive su questo dispositivo.', off: 'Spente su questo dispositivo: attivale per ricevere i miei messaggi anche a app chiusa.',
    denied: 'Bloccate dal browser: riattivale dalle impostazioni del sito.', ios: 'Su iPhone: Condividi → Aggiungi alla schermata Home, poi apri Cerini IA da lì e attivale.',
    unsupported: 'Questo browser non supporta le notifiche.' }[ps];
  const mail = w.gmail ? h('div', { class: 'feed-set-row' },
    h('div', { class: 'tx' }, h('b', { text: 'Gestisco la posta da solo' }),
      h('small', { text: w.enabled ? (w.error ? `Ultimo problema: ${w.error}` : 'Guardo ogni mail appena arriva: i codici te li mando subito, anche a PC spento.') : 'Spento: non tocco la posta.' })),
    h('div', { class: 'form-actions' },
      w.enabled ? h('button', { class: 'btn sm', text: 'Controlla adesso', onclick: async (e) => {
        e.target.disabled = true; e.target.textContent = 'Controllo…';
        try { const r = await (await api('/api/aura/watch/now', {})).json(); toast(r.busy ? 'Sto già controllando' : `Fatto: ${r.codici || 0} codici, ${r.interessanti || 0} interessanti, ${r.cestinate || 0} nel cestino` + (r.rimandate ? `, ${r.rimandate} le guardo a PC acceso` : '')); }
        catch (ex) { toast(ex.message); }
        renderAuraSettings(); } }) : null,
      h('button', { class: 'switch', role: 'switch', 'aria-checked': String(!!w.enabled), 'aria-label': 'Gestione automatica della posta', onclick: async () => {
        try { await api('/api/aura/watch', { enabled: !w.enabled }, { method: 'PUT' }); } catch (ex) { toast(ex.message); }
        renderAuraSettings(); } }, h('span'))))
    : h('div', { class: 'feed-set-row' }, h('div', { class: 'tx' }, h('b', { text: 'Posta' }), h('small', { text: 'Collega Gmail da Impostazioni → Collegamenti e la controllo io.' })));
  root.replaceChildren(h('div', { class: 'set-wrap' }, head, h('div', { class: 'set-body' },
    h('section', { class: 'card au-settings' }, mail,
      h('div', { class: 'feed-set-row' }, h('div', { class: 'tx' }, h('b', { text: 'Notifiche sul telefono' }), h('small', { text: pushTxt })), pushCtl),
      ps === 'on' || ps === 'off' ? await pushDiagRow() : null,
      d.power ? powerRow(d.power) : null))));
}

// Il telefono riceve le notifiche anche a pagina chiusa: il service worker resta registrato
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  navigator.serviceWorker.addEventListener('message', (e) => { if (e.data?.type === 'aura-open') { openAura(); refreshAuraBadge(); } });
}
setInterval(() => { if (S.me && !document.hidden && !isAuraChat(current())) refreshAuraBadge(); }, 60000);
setInterval(() => { if (S.me && !document.hidden && isAuraChat(current()) && !S.stream) refreshAuraBadge(); }, 10000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.me) refreshAuraBadge(); });

// ================================================================ cervello (Brain Protocol)
// Pannello a destra: il diario (calendario del mese + le voci del giorno), la wiki (Progetti / Persone / Altro) e le skill.
// Cliccando si apre il file al centro: si legge, si modifica, si spuntano le cose fatte, si torna a una versione vecchia.
const BP = { month: null, sel: null, tab: 'projects', other: null, tree: null, day: null };
const bpOpen = () => document.getElementById('app').classList.contains('brain-on');
function toggleBrain(force) {
  const on = force ?? !bpOpen();
  $('#app').classList.toggle('brain-on', on);
  if (!isMobile()) pref.set('brainPanel', on);
  if (on) renderBrainPanel();
}
$('#brainToggle').onclick = () => toggleBrain();
$('#brainScrim').onclick = () => toggleBrain(false);

async function renderBrainPanel() {
  const root = $('#brainPanel');
  if (!$('#brainResize')) document.body.append(h('div', { id: 'brainResize', title: 'Trascina per allargare · doppio clic per tornare stretto' }));
  const now = new Date();
  BP.month = BP.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  BP.sel = BP.sel || isoDay(now);
  try { BP.tree = await (await api(`/api/brain/tree?month=${BP.month}`)).json(); }
  catch (e) { root.replaceChildren(h('div', { class: 'bp-err', text: e.message })); return; }
  try { BP.day = await (await api(`/api/brain/day/${BP.sel}`)).json(); } catch { BP.day = { entries: [], agenda: [] }; }
  const [y, m] = BP.month.split('-').map(Number);
  const first = new Date(y, m - 1, 1), start = mondayOf(first), todayIso = isoDay(now);
  const shift = (n) => { const d = new Date(y, m - 1 + n, 1); BP.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; renderBrainPanel(); };
  const cells = [];
  for (let k = 0; k < 42; k++) {
    const d = addDays(start, k), key = isoDay(d), info = BP.tree.days[key];
    cells.push(h('button', { class: 'bp-d' + (d.getMonth() !== m - 1 ? ' out' : '') + (key === todayIso ? ' today' : '') + (key === BP.sel ? ' sel' : '')
      + (info?.n ? ' has' : info?.log ? ' log' : '') + (info?.open ? ' open' : ''), title: info ? `${info.n} voci${info.open ? `, ${info.open} da fare` : ''}` : '',
      onclick: () => { BP.sel = key; renderBrainPanel(); } }, h('span', { text: String(d.getDate()) })));
  }
  const cal = h('div', { class: 'bp-cal' },
    h('div', { class: 'bp-cal-h' },
      h('button', { class: 'bp-nav', 'aria-label': 'Mese prima', text: '‹', onclick: () => shift(-1) }),
      h('b', { text: `${MESI[m - 1].charAt(0).toUpperCase() + MESI[m - 1].slice(1)} ${y}` }),
      h('button', { class: 'bp-nav', 'aria-label': 'Mese dopo', text: '›', onclick: () => shift(1) })),
    h('div', { class: 'bp-grid' }, ...DOW.map((x) => h('i', { text: x })), ...cells));
  const dayItems = [];
  for (const e of BP.day.entries || []) {
    dayItems.push(h('button', { class: 'bp-item' + (e.log ? ' log' : ''), onclick: () => openBrainFile(e.path) },
      h('span', { class: 'bp-dot' + (e.todo.length ? ' open' : '') }),
      h('span', { class: 'bp-t', text: e.log ? 'Giornata (cosa ha fatto Aura)' : e.title }),
      e.project ? h('span', { class: 'bp-tag', text: e.project }) : null,
      e.todo.length ? h('span', { class: 'bp-n', text: String(e.todo.length) }) : null));
  }
  const agRow = (a) => h('div', { class: 'bp-item ag' + (a.done ? ' done' : '') },
    a.kind === 'promemoria'
      ? h('button', { class: 'bp-check' + (a.done ? ' on' : ''), title: a.done ? 'Segna da fare' : 'Segna fatto', 'aria-label': a.done ? 'Segna da fare' : 'Segna fatto',
          html: a.done ? icon('check', 'sm') : '', onclick: () => toggleDone(a) })
      : h('span', { class: 'bp-dot cal' }),
    h('button', { class: 'bp-t', text: `${a.allday ? '' : a.time + ' '}${a.title}`, onclick: openAgenda }));
  const ag = BP.day.agenda || [];   // l'agenda da fare in cima (prima del diario), quella fatta in fondo
  dayItems.unshift(...ag.filter((a) => !a.done).map(agRow));
  dayItems.push(...ag.filter((a) => a.done).map(agRow));
  const MAX_DAY = 5, extra = dayItems.length - MAX_DAY;
  const dayBox = h('div', { class: 'bp-day' },
    h('div', { class: 'bp-day-h' }, h('span', { text: BP.sel === todayIso ? 'Oggi' : dayTitle(BP.sel) }),
      h('button', { class: 'bp-add', title: 'Nuova voce del diario', 'aria-label': 'Nuova voce del diario', html: icon('edit', 'sm'), onclick: () => brainNew('diario') })),
    ...(dayItems.length ? dayItems.slice(0, MAX_DAY) : [h('div', { class: 'bp-empty', text: 'Niente in questo giorno.' })]),
    (BP.day.entries || []).length > 1 || extra > 0 ? h('button', { class: 'bp-link', text: extra > 0 ? `+${extra} altre · leggi tutta la giornata` : 'Leggi tutta la giornata', onclick: () => openBrainDay(BP.sel) }) : null);

  const kinds = BP.tree.kinds, others = Object.keys(kinds).filter((k) => !['projects', 'people'].includes(k));
  const tab = (k, label) => h('button', { class: 'bp-tab' + (BP.tab === k ? ' on' : ''), text: label, onclick: () => { BP.tab = k; renderBrainPanel(); } });
  const otherSel = h('select', { class: 'bp-tab bp-other' + (others.includes(BP.tab) ? ' on' : ''), 'aria-label': 'Altri tipi', onchange: (e) => { BP.tab = e.target.value; renderBrainPanel(); } },
    h('option', { value: '', text: others.includes(BP.tab) ? kinds[BP.tab] : 'Altri tipi' }), ...others.map((k) => h('option', { value: k, text: kinds[k] })));
  const list = BP.tree.entities.filter((e) => e.kind === BP.tab);
  const wiki = h('div', { class: 'bp-sec' },
    h('div', { class: 'bp-h' }, h('span', { text: 'WIKI' }),
      h('button', { class: 'bp-add', title: 'Nuova scheda', 'aria-label': 'Nuova scheda', html: icon('edit', 'sm'), onclick: () => brainNew(BP.tab) })),
    h('div', { class: 'bp-tabs' }, tab('projects', 'Progetti'), tab('people', 'Persone'), otherSel),
    ...(list.length ? list.map((e) => h('button', { class: 'bp-item', onclick: () => openBrainFile(e.path) },
      h('span', { class: 'bp-t', text: e.name }), e.status ? h('span', { class: 'bp-badge ' + e.status, text: e.status.toUpperCase() }) : null))
      : [h('div', { class: 'bp-empty', text: 'Ancora niente qui.' })]));
  root.replaceChildren(
    h('div', { class: 'bp-top' }, h('b', { html: icon('brain', 'sm') + 'Cervello' }),
      h('button', { class: 'icon-btn sm', title: 'Chiudi', 'aria-label': 'Chiudi il cervello', html: icon('x', 'sm'), onclick: () => toggleBrain(false) })),
    h('div', { class: 'bp-scroll' },
      h('div', { class: 'bp-sec' }, h('div', { class: 'bp-h' }, h('span', { text: 'DIARIO' })), cal, dayBox),
      wiki),
    h('div', { class: 'bp-foot' },
      h('button', { class: 'bp-skill', html: icon('bulb', 'sm') + 'Skill', onclick: openBrainSkills }),
      h('button', { class: 'bp-boot', title: 'Chi sono io e chi sei tu (boot/)', html: icon('auto', 'sm') + 'Boot', onclick: () => openBrainFile('boot/user.md') })));
}

// ---- la pagina al centro: un file del cervello
function closeBrainView() { $('#main').classList.remove('brain-open'); }
function brainShell(title, actions, ...body) {
  closeSide(); togglePicker(false); closeViews();
  $('#main').classList.add('brain-open');
  if (isMobile()) toggleBrain(false);
  $('#brainView').replaceChildren(h('div', { class: 'set-wrap bv-wrap' },
    h('div', { class: 'set-head' }, h('h1', { text: title }),
      h('div', { class: 'form-actions' }, ...actions,
        h('button', { class: 'icon-btn', title: 'Chiudi', 'aria-label': 'Chiudi', html: icon('x'), onclick: () => { closeBrainView(); focusInput(); } }))),
    ...body));
}
function bvRender(md, path) {
  // i link «chat:ID» il filtro di sicurezza li toglierebbe: diventano «#chat=ID» e li apre la pagina
  const box = h('div', { class: 'md bv-md', html: renderMarkdown(md.replace(/\]\(chat:([\w-]+)\)/g, '](#chat=$1)').replace(/\]\(wiki:([\w\/.-]+)\)/g, '](#brain=$1)')
    .replace(/\[\[([^\]|#\n]+)(?:#[^\]|\n]*)?(?:\|([^\]\n]*))?\]\]/g, (_, p, n) => `[${n || p.split('/').pop()}](#brain=${p.endsWith('.md') ? p : p + '.md'})`)) });
  box.querySelectorAll('a[href^="#brain="]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openBrainFile(a.getAttribute('href').slice(7)); }));
  // le caselle «- [ ]» si spuntano davvero (nel diario)
  box.querySelectorAll('li').forEach((li) => {
    const cb = li.querySelector('input[type="checkbox"]');
    let done, item;
    if (cb) { done = cb.checked; cb.remove(); item = li.textContent.trim(); }
    else {
      const m = li.textContent.match(/^\[( |x|X)\]\s*(.*)$/s);
      if (!m) return;
      done = m[1] !== ' '; item = m[2].trim();
    }
    li.classList.add('bv-check'); li.replaceChildren(h('button', { class: 'bv-box' + (done ? ' on' : ''), 'aria-label': done ? 'Segna da fare' : 'Segna fatto', html: done ? icon('check', 'sm') : '',
      onclick: async () => {
        try { const r = await (await api('/api/brain/check', { path, item, done: !done })).json(); toast(done ? 'Riaperta' : 'Fatta!'); openBrainFile(r.path); renderBrainPanel(); }
        catch (e) { toast(e.message); } } }), h('span', { class: done ? 'done' : '', text: item }));
  });
  box.querySelectorAll('a[href^="#chat="]').forEach((a) => {   // col titolo della chat, non «chat chat chat»
    const c = S.chats.find((x) => x.id === a.getAttribute('href').slice(6));
    if (c?.title) a.textContent = c.title;
    a.classList.add('bv-chatlink');
    a.addEventListener('click', (e) => { e.preventDefault(); closeBrainView(); openChat(a.getAttribute('href').slice(6)); });
  });
  return box;
}
function bvSections(md, path) {
  const parts = md.split(/^## (.+)$/m);
  const intro = parts[0].trim(), secs = [];
  for (let i = 1; i < parts.length; i += 2) secs.push({ title: parts[i].trim(), body: (parts[i + 1] || '').trim() });
  const full = secs.filter((s) => s.body && s.body !== '(da scrivere)'), empty = secs.filter((s) => !full.includes(s));
  const out = [];
  if (intro) out.push(h('section', { class: 'card bv-intro' }, bvRender(intro, path)));
  for (const s of full) {
    if (/^stato( attuale)?$/i.test(s.title)) {
      const steps = s.body.split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
      const fmt = (l) => l.replace(/^\[(\d{4})-(\d{2})-(\d{2})\]\s*/, (_, y, m, dd) => `${dd}/${m} · `);
      const last = steps.pop() || '';
      out.push(h('section', { class: 'bv-status' }, h('span', { class: 'bv-status-l', text: 'Stato' }), h('div', { class: 'bv-status-t', text: fmt(last) }),
        steps.length ? h('details', { class: 'bv-status-old' }, h('summary', { text: `Passi precedenti (${steps.length})` }),
          h('ul', {}, ...steps.reverse().map((l) => h('li', { text: fmt(l) })))) : null));
      continue;
    }
    const box = bvRender(s.body, path);
    if (/^chat$/i.test(s.title)) {   // i link alle chat col titolo della chat, non «Chat, Chat, Chat»
      box.querySelectorAll('a[href^="#chat="]').forEach((a) => { const c = S.chats.find((x) => x.id === a.getAttribute('href').slice(6)); a.textContent = c?.title || 'Apri la chat'; });
    }
    out.push(h('section', { class: 'card bv-sec' }, h('h2', { class: 'bv-sec-h', text: s.title }), box));
  }
  if (empty.length) out.push(h('p', { class: 'bv-empty', text: `Ancora vuote: ${empty.map((s) => s.title).join(' · ')}. Le riempie Aura man mano, o tu con «Modifica».` }));
  return out;
}
function brainLabel(path) {
  const day = path.match(/^diary\/\d{4}\/(\d{4})-(\d{2})-(\d{2})\.md$/);
  if (day) return ['📄', `diario del ${day[3]}/${day[2]}`];
  const id = path.split('/').slice(-1)[0] === 'index.md' ? path.split('/').slice(-2)[0] : path.split('/').pop().replace(/\.md$/, '');
  const e = BP.tree?.entities?.find((x) => x.path === path);
  return [path.startsWith('wiki/projects/') ? '📁' : path.startsWith('wiki/people/') ? '👤' : '📝', e?.name || id.replace(/-/g, ' ')];
}
function noteEl(m) {
  return h('div', { class: 'msg note' }, h('div', { class: 'brain-note' },
    h('span', { class: 'bn-h', text: m.content || '💾 salvato nel brain' }),
    h('div', { class: 'bn-files' }, ...(m.paths || []).map((p) => { const [ic, label] = brainLabel(p);
      return h('button', { class: 'bn-file', title: p, onclick: () => openBrainFile(p) }, h('span', { text: ic }), h('span', { text: label })); }))));
}
// le ricevute le scrive il server qualche minuto dopo la chat: se la chat e' aperta, arrivano da sole
setInterval(async () => {
  const c = current();
  if (!c || S.stream || document.hidden || isAuraChat(c) || !c.messages?.length) return;
  try {
    const { notes } = await (await api(`/api/chats/${encodeURIComponent(c.id)}/notes`)).json();
    const have = new Set(c.messages.filter((m) => m.role === 'note').map((m) => m.rid));
    const fresh = notes.filter((n) => !have.has(n.rid));
    if (fresh.length && current() === c) { c.messages.push(...fresh); renderThread(); keepFollowing?.(); if (BP.tree) renderBrainPanel(); }
  } catch {}
}, 20000);
async function openBrainFile(path) {
  let f;
  try { f = await (await api(`/api/brain/file?path=${encodeURIComponent(path)}`)).json(); } catch (e) { toast(e.message); return; }
  const meta = f.meta || {};
  const chips = Object.entries(meta).filter(([k, v]) => !['type', 'name', 'aliases', 'created_at', 'date'].includes(k) && v && (!Array.isArray(v) || v.length))
    .map(([k, v]) => h('span', { class: 'bv-chip', text: `${k}: ${Array.isArray(v) ? v.join(', ') : v}` }));
  const edit = h('button', { class: 'btn sm', html: icon('pencil', 'sm') + 'Modifica', onclick: () => {
    const ta = h('textarea', { class: 'bv-edit', spellcheck: 'false' }); ta.value = f.raw;
    brainShell(path, [h('button', { class: 'btn sm primary', text: 'Salva', onclick: async () => {
      try { await api('/api/brain/file', { path, raw: ta.value }, { method: 'PUT' }); toast('Salvato nel cervello'); openBrainFile(path); renderBrainPanel(); }
      catch (e) { toast(e.message); } } }), h('button', { class: 'btn sm', text: 'Annulla', onclick: () => openBrainFile(path) })], ta);
    ta.focus(); } });
  const hist = h('button', { class: 'btn sm', html: icon('retry', 'sm') + 'Cronologia', onclick: async () => {
    let v; try { v = (await (await api(`/api/brain/history?path=${encodeURIComponent(path)}`)).json()).versions; } catch (e) { toast(e.message); return; }
    brainShell('Cronologia', [h('button', { class: 'btn sm', text: 'Indietro', onclick: () => openBrainFile(path) })],
      h('p', { class: 'bv-path mono', text: path }),
      h('section', { class: 'card flush' }, ...v.map((x, i) => h('div', { class: 'bv-ver' },
        h('div', { class: 'tx' }, h('b', { text: x.msg }), h('small', { text: new Date(x.at * 1000).toLocaleString('it-IT') })),
        i ? h('button', { class: 'btn sm', text: 'Ripristina', onclick: async () => {
          try { await api('/api/brain/restore', { path, rev: x.rev }); toast('Versione ripristinata'); openBrainFile(path); renderBrainPanel(); } catch (e) { toast(e.message); } } })
          : h('small', { class: 'bv-now', text: 'attuale' })))));
  } });
  const acts = [edit, hist];
  if (path.startsWith('diary/') && !path.includes('-giornata')) {
    const date = h('input', { type: 'date', class: 'ag-in bv-date', value: path.split('/').pop().slice(0, 10), 'aria-label': 'Rimanda a' });
    acts.unshift(h('label', { class: 'bv-move', title: 'Rimanda: sposta la voce a un altro giorno' }, h('span', { text: 'Rimanda' }), date));
    date.onchange = async () => { try { const r = await (await api('/api/brain/move', { path, day: date.value })).json(); toast('Rimandata'); openBrainFile(r.path); renderBrainPanel(); } catch (e) { toast(e.message); } };
  }
  const title = meta.name || (f.body.match(/^# (.+)$/m) || [])[1] || path.split('/').pop();
  const body = f.body.replace(/^# .+\n+/, '');
  const linked = f.linked?.length ? h('section', { class: 'card bv-linked' }, h('div', { class: 'card-head' }, h('h2', { text: 'Diario del progetto' })),
    ...f.linked.slice().reverse().map((e) => h('button', { class: 'bp-item', onclick: () => openBrainFile(e.path) },
      h('span', { class: 'bp-dot' + (e.todo.length ? ' open' : '') }), h('span', { class: 'bp-t', text: `${e.day.slice(8)}/${e.day.slice(5, 7)} · ${e.title}` })))) : null;
  brainShell(title, acts, h('p', { class: 'bv-path mono', text: path }), chips.length ? h('div', { class: 'bv-chips' }, ...chips) : null,
    ...bvSections(body, path), linked);
}
async function openBrainDay(day) {
  let d; try { d = await (await api(`/api/brain/day/${day}`)).json(); } catch (e) { toast(e.message); return; }
  const logs = d.entries.filter((e) => e.log), rest = d.entries.filter((e) => !e.log);
  brainShell(dayTitle(day), [], ...rest.map((e) => h('section', { class: 'card bv-day' },
    h('div', { class: 'card-head' }, h('h2', { text: e.title }), e.project ? h('span', { class: 'bv-chip', text: e.project }) : null),
    h('div', { class: 'bv-day-body' }, ...bvSections(e.text.replace(/^# .+\n+/, ''), e.path)))),
    ...logs.map((e) => h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Cosa ha fatto Aura' })), auraLog(e.text))),
    d.agenda.length ? h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'In agenda' })), ...d.agenda.map(eventRow)) : null);
}
// righe «- HH:MM 🧠 testo» del registro della giornata -> righe con ora, icona e testo
function auraLog(text) {
  const rows = [...text.matchAll(/^- (\d{1,2}:\d{2}) (.+)$/gm)].map(([, t, rest]) => {
    const m = rest.match(/^(\p{Extended_Pictographic}\uFE0F?)\s*(.*)$/u);
    return h('li', { class: 'al-row' }, h('span', { class: 'al-t tnum', text: t }), h('span', { class: 'al-i', text: m ? m[1] : '•' }),
      h('span', { class: 'al-x', text: m ? m[2] : rest }));
  });
  return rows.length ? h('ul', { class: 'al-list' }, ...rows.reverse()) : h('p', { class: 'bp-empty', text: 'Niente.' });
}
async function openBrainSkills() {
  if (!BP.tree) { try { BP.tree = await (await api('/api/brain/tree')).json(); } catch (e) { toast(e.message); return; } }
  brainShell('Skill', [h('button', { class: 'btn sm primary', html: icon('edit', 'sm') + 'Nuova skill', onclick: () => brainNew('skill') })],
    h('p', { class: 'field-hint', text: 'Procedure che Aura segue da solo quando nel messaggio ci sono le parole di attivazione. Per chiamarne una al volo scrivi /nome all’inizio del messaggio (es. «/homebase apri il foglio spesa»).' }),
    ...BP.tree.skills.map((s) => h('button', { class: 'card bv-skill', onclick: () => openBrainFile(s.path) },
      h('div', { class: 'bv-skill-h' }, h('b', { text: s.name }), h('code', { text: '/' + s.slug })),
      h('span', { text: s.summary }),
      h('small', { text: s.trigger.length ? 'da solo con: ' + s.trigger.join(', ') : 'solo con /' + s.slug }))));
}
function brainNew(kind) {
  $('#agModal')?.remove();
  const label = kind === 'diario' ? 'Nuova voce del diario' : kind === 'skill' ? 'Nuova skill' : `Nuova scheda · ${BP.tree?.kinds?.[kind] || kind}`;
  const name = h('input', { class: 'ag-in big', placeholder: kind === 'diario' ? 'Cosa è successo / cosa devi fare' : 'Nome', 'aria-label': 'Nome' });
  const day = h('input', { class: 'ag-in', type: 'date', value: BP.sel || isoDay(new Date()), 'aria-label': 'Giorno' });
  const text = h('textarea', { class: 'ag-in', rows: 5, placeholder: kind === 'diario' ? 'Testo. Le righe che iniziano con «- » diventano cose da fare.' : 'Testo (facoltativo)' });
  const close = () => modal.remove();
  const ok = h('button', { class: 'btn primary', text: 'Crea', onclick: async () => {
    if (!name.value.trim()) { name.focus(); return; }
    ok.disabled = true;
    try {
      const r = await (await api('/api/brain/new', { kind, name: name.value.trim(), day: day.value, text: text.value })).json();
      close(); toast('Creato nel cervello'); await renderBrainPanel(); openBrainFile(r.path);
    } catch (e) { ok.disabled = false; toast(e.message); } } });
  const modal = h('div', { class: 'ag-modal', id: 'agModal', onclick: (e) => { if (e.target === modal) close(); } },
    h('div', { class: 'ag-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': label },
      h('div', { class: 'ag-sheet-h' }, h('b', { text: label }), h('button', { class: 'icon-btn sm', 'aria-label': 'Chiudi', html: icon('x', 'sm'), onclick: close })),
      name, kind === 'diario' ? h('label', { class: 'ag-f' }, h('span', { text: 'Giorno (quando riguardarla)' }), day) : null, text,
      h('div', { class: 'ag-sheet-f' }, h('span', { class: 'grow' }), h('button', { class: 'btn', text: 'Annulla', onclick: close }), ok)));
  document.body.append(modal); setTimeout(() => name.focus(), 30);
}
setInterval(() => { if (S.me && bpOpen() && !document.hidden) renderBrainPanel(); }, 60000);

// WhatsApp: Aura scrive dal tuo numero. Si collega col QR (come WhatsApp Web) e si scollega con «Dissocia».
function whatsappCard() {
  const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { html: icon('phone', 'sm') + 'WhatsApp' }),
    h('p', { text: 'Aura può mandare messaggi e file dal tuo numero alle persone della tua rubrica. Prima di ogni invio ti mostra il messaggio e aspetta il tuo «Conferma». Non legge le tue chat.' })),
    h('div', { class: 'wa-box' }, h('div', { class: 'list-empty', text: 'Controllo…' })));
  const box = card.lastChild;
  let timer = null;
  const paint = async () => {
    clearTimeout(timer);
    if (!document.body.contains(card) && box.dataset.ready) return;   // impostazioni chiuse: si smette di controllare
    box.dataset.ready = '1';
    let s;
    try { s = await (await api('/api/whatsapp')).json(); } catch (e) { box.replaceChildren(h('div', { class: 'form-msg err', text: e.message })); return; }
    const act = (label, cls, url, confirmTxt) => h('button', { class: 'btn ' + cls, text: label, onclick: async (e) => {
      if (confirmTxt && !confirm(confirmTxt)) return;
      e.currentTarget.disabled = true;
      try { await api(url, {}); } catch (ex) { toast(ex.message); }
      paint(); } });
    if (!s.installed) { box.replaceChildren(h('p', { class: 'wa-note', text: 'Il servizio WhatsApp non è installato sul server.' })); return; }
    if (s.status === 'connected') {
      box.replaceChildren(h('div', { class: 'wa-on' }, h('span', { class: 'wa-dot' }),
        h('div', { class: 'tx' }, h('b', { text: 'Collegato' + (s.me?.name ? ` · ${s.me.name}` : '') }),
          h('small', { text: `+${s.me?.id || ''} · ${s.contacts || 0} contatti in rubrica` })),
        act('Dissocia', 'danger', '/api/whatsapp/logout', 'Scollego Aura dal tuo WhatsApp? Per ricollegarla dovrai scansionare di nuovo il QR.')));
    } else if (s.status === 'qr' && s.qr) {
      box.replaceChildren(h('div', { class: 'wa-qr' }, h('img', { src: s.qr, alt: 'QR da scansionare con WhatsApp', width: 240, height: 240 }),
        h('ol', {}, h('li', { text: 'Apri WhatsApp sul telefono' }), h('li', { text: 'Impostazioni (o ⋮) → Dispositivi collegati' }),
          h('li', { text: 'Collega un dispositivo e inquadra questo codice' })),
        h('small', { class: 'wa-note', text: 'Il codice cambia ogni 20 secondi: si aggiorna da solo.' })));
      timer = setTimeout(paint, 3000);
    } else if (['starting', 'connecting'].includes(s.status)) {
      box.replaceChildren(h('div', { class: 'list-empty', text: s.status === 'connecting' ? 'Mi sto collegando…' : 'Preparo il codice…' }));
      timer = setTimeout(paint, 2000);
    } else {
      box.replaceChildren(h('div', { class: 'wa-off' }, h('div', { class: 'tx' }, h('b', { text: s.status === 'down' ? 'Il servizio non risponde' : 'Non collegato' }),
        h('small', { text: s.error || 'Premi «Collega» e inquadra il QR con WhatsApp.' })),
        act('Collega', 'primary', '/api/whatsapp/link')));
    }
  };
  paint();
  return card;
}

// Modello nel cloud (facoltativo): fornitore, chiave, modello. La chiave resta sul server: qui si vede solo se c'e'.
function cloudCard() {
  const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { html: icon('globe', 'sm') + 'Modello nel cloud' }),
    h('p', { text: 'Facoltativo: un modello grande a pagamento, per le cose difficili o quando il PC è spento. Lo scegli nel menu dei modelli in alto (☁).' })),
    h('div', { class: 'list-empty', text: 'Carico…' }));
  (async () => {
    let c;
    try { c = await (await api('/api/cloud')).json(); } catch (e) { card.lastChild.textContent = e.message; return; }
    const prov = h('select', { class: 'ag-in', 'aria-label': 'Fornitore' }, ...Object.entries(c.presets).map(([k, p]) => h('option', { value: k, text: p.name })));
    prov.value = c.provider || 'regolo';
    const base = h('input', { class: 'ag-in', value: c.base || '', placeholder: 'https://…/v1', 'aria-label': 'Indirizzo API' });
    const model = h('input', { class: 'ag-in', value: c.model || '', placeholder: 'nome del modello', list: 'cloudModels', 'aria-label': 'Modello' });
    const models = h('datalist', { id: 'cloudModels' });
    const key = h('input', { class: 'ag-in', type: 'password', autocomplete: 'off', placeholder: c.has_key ? `Chiave salvata (${c.key_hint}): lascia vuoto per tenerla` : 'Incolla qui la chiave API', 'aria-label': 'Chiave API' });
    const sw = (on, label) => { const b = h('button', { type: 'button', class: 'switch', role: 'switch', 'aria-checked': String(!!on), 'aria-label': label,
      onclick: () => b.setAttribute('aria-checked', String(b.getAttribute('aria-checked') !== 'true')) }, h('span')); return b; };
    const en = sw(c.enabled, 'Attivo'), bg = sw(c.background, 'Lavori in sottofondo');
    // i modelli consigliati del fornitore: un clic e il campo si riempie
    const note = h('small', { class: 'cloud-note' }), picks = h('div', { class: 'cloud-picks' });
    const showPicks = () => {
      const p = c.presets[prov.value] || {};
      note.textContent = p.note || '';
      picks.replaceChildren(...(p.models || []).map(([m, why]) => h('button', { type: 'button', class: 'cloud-pick' + (model.value === m ? ' on' : ''),
        onclick: () => { model.value = m; showPicks(); } }, h('b', { text: m }), why ? h('span', { text: why }) : '')));
    };
    const fill = () => { const p = c.presets[prov.value]; if (prov.value !== 'custom') { base.value = p.base; if (!model.value || Object.values(c.presets).some((x) => x.model === model.value || (x.models || []).some(([m]) => m === model.value))) model.value = p.model; } showPicks(); };
    prov.onchange = fill;
    model.oninput = showPicks;
    showPicks();
    if (!c.model) fill();
    const out = h('div', { class: 'form-msg', role: 'status' });
    const save = async () => {
      const body = { provider: prov.value, base: base.value.trim(), model: model.value.trim(), api_key: key.value.trim(),
        enabled: en.getAttribute('aria-checked') === 'true', background: bg.getAttribute('aria-checked') === 'true' };
      c = await (await api('/api/cloud', body, { method: 'PUT' })).json();
      key.value = ''; key.placeholder = c.has_key ? `Chiave salvata (${c.key_hint}): lascia vuoto per tenerla` : 'Incolla qui la chiave API';
      refresh();
    };
    const saveBtn = h('button', { class: 'btn primary', text: 'Salva', onclick: async () => { try { await save(); out.className = 'form-msg ok'; out.textContent = c.ready ? 'Salvato: lo trovi nel menu dei modelli (☁).' : 'Salvato.'; } catch (e) { out.className = 'form-msg err'; out.textContent = e.message; } } });
    const testBtn = h('button', { class: 'btn', text: 'Prova', onclick: async () => {
      testBtn.disabled = true; out.className = 'form-msg'; out.textContent = 'Provo…';
      try {
        await save();
        const r = await (await api('/api/cloud/test', {})).json();
        models.replaceChildren(...r.models.map((m) => h('option', { value: m })));
        out.className = 'form-msg ok';
        out.textContent = `Funziona${r.reply ? ` (ha risposto «${r.reply}»)` : ''}. ${r.models.length ? r.models.length + ' modelli disponibili: scrivi nel campo «modello» per sceglierne un altro.' : ''}`;
      } catch (e) { out.className = 'form-msg err'; out.textContent = e.message; }
      testBtn.disabled = false; } });
    card.lastChild.replaceWith(h('div', { class: 'stack cloud-form' },
      h('label', { class: 'ag-f' }, h('span', { text: 'Fornitore' }), prov, note),
      h('label', { class: 'ag-f' }, h('span', { text: 'Chiave API' }), key),
      h('label', { class: 'ag-f' }, h('span', { text: 'Modello' }), model, models), picks,
      h('details', { class: 'cloud-adv' }, h('summary', { text: 'Indirizzo dell\'API' }), base),
      h('div', { class: 'feed-set-row' }, h('div', { class: 'tx' }, h('b', { text: 'Attivo' }), h('small', { text: 'Compare nel menu dei modelli.' })), en),
      h('div', { class: 'feed-set-row' }, h('div', { class: 'tx' }, h('b', { text: 'Lavora anche in sottofondo' }),
        h('small', { text: 'A PC spento smista la posta, scrive il diario e i messaggi di Aura (consuma un po\' di credito).' })), bg),
      h('div', { class: 'form-actions' }, saveBtn, testBtn), out));
  })();
  return card;
}

// ================================================================ dettatura
// Registra nel browser, manda l'audio al pannello (che lo passa a Whisper sul PC) e mette il testo nella barra.
// Mentre si parla il modello veloce mostra il testo provvisorio; alla fine quello grande lo rifinisce.
const Rec = { stream: null, rec: null, chunks: [], ctx: null, analyser: null, raf: 0, t0: 0, timer: 0, live: 0, levels: [], cancelled: false };
const MAX_REC_S = 180;

function recUI(mode, text) {
  const bar = $('#recBar');
  comp.classList.toggle('recording', mode === 'rec');
  comp.classList.toggle('transcribing', mode === 'busy');
  if (mode === 'rec') {
    bar.replaceChildren(h('span', { class: 'rec-dot', 'aria-hidden': 'true' }), h('canvas', { class: 'rec-wave', id: 'recWave' }),
      h('span', { class: 'rec-time', id: 'recTime', text: '0:00' }),
      h('button', { type: 'button', class: 'icon-btn', title: 'Annulla (Esc)', 'aria-label': 'Annulla registrazione', html: icon('x'), onclick: () => stopRec(true) }),
      h('button', { type: 'button', class: 'rec-ok', title: 'Fine: trascrivi', 'aria-label': 'Fine, trascrivi', html: icon('check'), onclick: () => stopRec(false) }));
  } else if (mode === 'busy') {
    bar.replaceChildren(h('div', { class: 'rec-status' }, h('span', { class: 'spinner' }), h('span', { text: text || 'Trascrivo…' })));
  } else bar.replaceChildren();
}

function drawWave() {
  const cv = $('#recWave'); if (!cv || !Rec.analyser) return;
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, hgt = cv.clientHeight;
  if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = hgt * dpr; }
  const buf = new Uint8Array(Rec.analyser.fftSize);
  Rec.analyser.getByteTimeDomainData(buf);
  let sum = 0; for (const v of buf) sum += (v - 128) ** 2;
  Rec.levels.push(Math.min(1, Math.sqrt(sum / buf.length) / 40));
  const g = cv.getContext('2d'), bw = 3 * dpr, gap = 2 * dpr, n = Math.floor(cv.width / (bw + gap));
  if (Rec.levels.length > n) Rec.levels.splice(0, Rec.levels.length - n);
  g.clearRect(0, 0, cv.width, cv.height);
  g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-2');
  Rec.levels.forEach((lv, i) => {
    const bh = Math.max(2 * dpr, lv * cv.height);
    const x = cv.width - (Rec.levels.length - i) * (bw + gap);
    g.beginPath(); g.roundRect(x, (cv.height - bh) / 2, bw, bh, bw / 2); g.fill();
  });
}

async function startRec() {
  if (Rec.rec || S.stream) return;
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch (e) { micError(e); return; }
  const mime = recMime();
  Object.assign(Rec, { stream, chunks: [], levels: [], cancelled: false, t0: Date.now() });
  Rec.rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  Rec.rec.ondataavailable = (e) => { if (e.data.size) Rec.chunks.push(e.data); };
  Rec.rec.onstop = finishRec;
  Rec.rec.start(250);
  $('#recLive').textContent = '';
  Rec.live = startLive(Rec, (t) => { $('#recLive').textContent = t; }, () => true);
  try {
    Rec.ctx = new AudioContext();
    Rec.analyser = Rec.ctx.createAnalyser(); Rec.analyser.fftSize = 1024;
    Rec.ctx.createMediaStreamSource(stream).connect(Rec.analyser);
  } catch { Rec.analyser = null; }
  // A intervalli fissi, non a ogni fotogramma: l'onda scorre alla stessa velocita' su ogni schermo
  recUI('rec'); Rec.raf = setInterval(drawWave, 50);
  Rec.timer = setInterval(() => {
    const s = Math.floor((Date.now() - Rec.t0) / 1000);
    const t = $('#recTime'); if (t) t.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    if (s >= MAX_REC_S) stopRec(false);
  }, 250);
}

function stopRec(cancel) {
  if (!Rec.rec) return;
  Rec.cancelled = cancel;
  clearInterval(Rec.timer); clearInterval(Rec.raf); clearInterval(Rec.live);
  if (Rec.rec.state !== 'inactive') Rec.rec.stop(); else finishRec();
}

async function finishRec() {
  const type = (Rec.rec?.mimeType || 'audio/webm').split(';')[0];
  const blob = new Blob(Rec.chunks, { type });
  const secs = (Date.now() - Rec.t0) / 1000;
  Rec.stream?.getTracks().forEach((t) => t.stop());
  try { Rec.ctx?.close(); } catch {}
  const cancelled = Rec.cancelled;
  Object.assign(Rec, { stream: null, rec: null, chunks: [], ctx: null, analyser: null });
  const liveText = $('#recLive').textContent.trim();
  if (cancelled) { $('#recLive').textContent = ''; recUI(null); focusInput(); return; }
  if (secs < 0.6 || !blob.size) { $('#recLive').textContent = ''; recUI(null); toast('Registrazione troppo corta: tieni premuto un attimo di più.'); return; }
  recUI('busy', liveText ? 'Rifinisco il testo…' : 'Trascrivo…');
  let text = '';
  try {
    const r = await api('/api/transcribe?lang=it', undefined, { method: 'POST', headers: { 'Content-Type': type }, body: blob });
    text = cleanHeard((await r.json()).text);
  } catch (e) { text = liveText; if (!text) toast(e.message); }
  if (!text) toast('Non ho sentito niente: riprova parlando più vicino al microfono.');
  else {
    const cur = input.value;
    input.value = cur && !/\s$/.test(cur) ? cur + ' ' + text : cur + text;
  }
  $('#recLive').textContent = '';
  recUI(null); autosize(); renderComposer();
  input.focus(); input.setSelectionRange(input.value.length, input.value.length);
}
$('#micBtn').onclick = () => startRec();

// Testo provvisorio mentre si parla: a ogni secondo circa di audio nuovo manda la registrazione al modello veloce di Whisper.
// Una richiesta alla volta: se il PC e' lento, gli aggiornamenti si diradano invece di accodarsi.
const cleanHeard = (t) => String(t || '').replace(/\s*sottotitoli[^.]*(amara\.org|a cura di)[^.]*\.?/gi, '').trim();
function startLive(R, onText, ready) {
  let busy = false, sent = 0;
  return setInterval(async () => {
    if (busy || !R.rec || !ready() || R.chunks.length - sent < 4) return;
    busy = true; sent = R.chunks.length;
    const type = (R.rec.mimeType || 'audio/webm').split(';')[0];
    try {
      const r = await api('/api/transcribe?lang=it&live=1', undefined, { method: 'POST', headers: { 'Content-Type': type }, body: new Blob(R.chunks, { type }) });
      const t = cleanHeard((await r.json()).text);
      if (R.rec && t) onText(t);
    } catch {}
    busy = false;
  }, 250);
}
const recMime = () => ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find((t) => MediaRecorder.isTypeSupported(t)) || '';
function micError(e) {
  toast(e.name === 'NotAllowedError' ? 'Il browser non ha il permesso di usare il microfono: abilitalo dalle impostazioni del sito.'
    : e.name === 'NotFoundError' ? 'Non trovo nessun microfono.' : 'Microfono non disponibile: ' + e.message);
}

// ================================================================ conversazione a voce
// Parli; quando fai una pausa Aura invia da sola, risponde a voce una frase alla volta mentre scrive, poi si rimette in ascolto.
// Si interrompe toccando il cerchio o parlandole sopra. Le conferme (mail, eventi, procedure) restano pulsanti sullo schermo.
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
const Voice = { on: false, state: 'off', stream: null, ctx: null, analyser: null, rec: null, chunks: [], audio: null, loop: 0, live: 0,
  queue: [], pending: '', inCode: false, textDone: true, playing: false, silenced: false, floor: 0.02, heardMs: 0, quietMs: 0,
  turnStart: 0, liveText: '', echo: 0, bargeMs: 0, playStart: 0 };
const VOICE_LABEL = { listening: 'Ti ascolto…', transcribing: 'Ho capito, un attimo…', thinking: 'Sto pensando…',
  speaking: 'Sto parlando', paused: 'In pausa' };

function voiceLevel() {
  if (!Voice.analyser) return 0;
  const buf = new Uint8Array(Voice.analyser.fftSize);
  Voice.analyser.getByteTimeDomainData(buf);
  let sum = 0; for (const v of buf) sum += (v - 128) ** 2;
  return Math.min(1, Math.sqrt(sum / buf.length) / 40);
}

async function voiceStart() {
  if (Voice.on || Rec.rec) return;
  if (!S.status?.online) { toast('Il PC è spento: la conversazione a voce usa Whisper e Gemma sul PC.'); return; }
  // Sbloccato dentro il tocco: su iPhone l'audio parte solo se avviato da un gesto dell'utente
  Voice.audio = new Audio(SILENT_WAV); Voice.audio.play().catch(() => {});
  try { Voice.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }); }
  catch (e) { micError(e); return; }
  try {
    Voice.ctx = new AudioContext();
    Voice.analyser = Voice.ctx.createAnalyser(); Voice.analyser.fftSize = 1024;
    Voice.ctx.createMediaStreamSource(Voice.stream).connect(Voice.analyser);
  } catch { Voice.stream.getTracks().forEach((t) => t.stop()); toast('Il browser non riesce ad ascoltare il microfono.'); return; }
  Object.assign(Voice, { on: true, floor: 0.02, queue: [], playing: false, textDone: true, silenced: false });
  comp.classList.add('voice-on'); renderComposer();
  Voice.loop = setInterval(voiceTick, 50);
  voiceListen();
}

function voiceStop() {
  if (!Voice.on) return;
  Voice.on = false;
  clearInterval(Voice.loop); clearInterval(Voice.live);
  try { if (Voice.rec && Voice.rec.state !== 'inactive') Voice.rec.stop(); } catch {}
  Voice.audio?.pause();
  Voice.queue.forEach((i) => { i.dropped = true; }); Voice.queue = []; Voice.playing = false;
  Voice.stream?.getTracks().forEach((t) => t.stop());
  try { Voice.ctx?.close(); } catch {}
  Object.assign(Voice, { rec: null, stream: null, ctx: null, analyser: null, state: 'off', liveText: '' });
  comp.classList.remove('voice-on'); renderVoice(); renderComposer();
}

function stopVoiceRec() {
  clearInterval(Voice.live);
  try { if (Voice.rec && Voice.rec.state !== 'inactive') { Voice.rec.ondataavailable = null; Voice.rec.onstop = null; Voice.rec.stop(); } } catch {}
  Voice.rec = null;
}

function voiceListen() {
  if (!Voice.on) return;
  stopVoiceRec();
  Object.assign(Voice, { state: 'listening', liveText: '', heardMs: 0, quietMs: 0, turnStart: Date.now(), chunks: [] });
  const mime = recMime();
  Voice.rec = new MediaRecorder(Voice.stream, mime ? { mimeType: mime } : undefined);
  Voice.rec.ondataavailable = (e) => { if (e.data.size) Voice.chunks.push(e.data); };
  Voice.rec.start(250);
  Voice.live = startLive(Voice, (t) => { if (Voice.state === 'listening') { Voice.liveText = t; renderVoice(); } }, () => Voice.heardMs >= 200);
  renderVoice();
}

function voiceTick() {
  if (!Voice.on) return;
  const lv = voiceLevel();
  $('#voiceOrb')?.style.setProperty('--lv', (Voice.state === 'listening' ? lv : 0).toFixed(3));
  if (Voice.state === 'listening') {
    const thr = Math.max(0.07, Voice.floor * 3);
    const wasHeard = Voice.heardMs >= 200;
    if (lv > thr) { Voice.heardMs += 50; Voice.quietMs = 0; }
    else if (!wasHeard) { Voice.heardMs = 0; Voice.floor = Voice.floor * 0.95 + lv * 0.05; }
    else Voice.quietMs += 50;
    if (!wasHeard && Voice.heardMs >= 200) renderVoice();
    const age = Date.now() - Voice.turnStart;
    if (Voice.heardMs >= 200 && (Voice.quietMs >= 1100 || age > 90000)) voiceEndTurn();
    else if (Voice.heardMs < 200 && age > 20000) voiceListen();   // nessuno parla: ricomincia, cosi' la registrazione non cresce
  } else if (Voice.state === 'speaking' && Voice.playing) {
    // Parlarle sopra la interrompe: i primi istanti misurano quanto della sua voce rientra nel microfono
    if (Date.now() - Voice.playStart < 700) Voice.echo = Math.max(Voice.echo, lv);
    else if (lv > Math.max(0.22, Voice.echo * 2.5)) { Voice.bargeMs += 50; if (Voice.bargeMs >= 450) voiceInterrupt(); }
    else Voice.bargeMs = 0;
  }
}

async function voiceEndTurn() {
  if (Voice.state !== 'listening' || !Voice.rec) return;
  Voice.state = 'transcribing'; clearInterval(Voice.live); renderVoice();
  const rec = Voice.rec; Voice.rec = null;
  const type = (rec.mimeType || 'audio/webm').split(';')[0];
  const blob = await new Promise((res) => { rec.onstop = () => res(new Blob(Voice.chunks, { type })); rec.stop(); });
  if (!Voice.on) return;
  let text = '';
  try {
    const r = await api('/api/transcribe?lang=it', undefined, { method: 'POST', headers: { 'Content-Type': type }, body: blob });
    text = cleanHeard((await r.json()).text);
  } catch (e) { text = Voice.liveText; if (!text) toast(e.message); }
  if (!Voice.on || Voice.state !== 'transcribing') return;
  if (!text || S.stream) { voiceListen(); return; }
  Object.assign(Voice, { liveText: text, state: 'thinking', pending: '', inCode: false, textDone: false, silenced: false, spoke: false, queue: [], sent: current()?.messages.length || 0 });
  renderVoice();
  input.value = text; comp.requestSubmit();
  if (!S.stream) { Voice.textDone = true; input.value = ''; voiceListen(); }   // invio non partito (PC spento, modello mancante…)
}

// Il testo della risposta arriva a pezzi: si legge una frase alla volta appena e' completa (i blocchi di codice no)
function voiceFeed(t) {
  if (!Voice.on || Voice.silenced || !t) return;
  Voice.pending += t;
  voiceCut(false);
}
const speakable = (s) => s.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, '')
  .replace(/`([^`]*)`/g, '$1').replace(/^\s*([-•*]|\d+[.)])\s+/gm, '').replace(/[*_#>|~]+/g, ' ').replace(/\s+/g, ' ').trim();
function voiceCut(final) {
  let p = Voice.pending, say = '';
  for (;;) {
    const i = p.indexOf('```');
    if (Voice.inCode) { if (i < 0) { p = ''; break; } p = p.slice(i + 3); Voice.inCode = false; continue; }
    if (i < 0) break;
    say += p.slice(0, i) + '\n'; p = p.slice(i + 3); Voice.inCode = true;
  }
  if (!Voice.inCode) {
    if (final) { say += p; p = ''; }
    else {
      let end = -1, m;
      const re = /[.!?…;:](?=\s)|\n/g;
      while ((m = re.exec(p))) end = m.index + 1;
      if (end > 0) { say += p.slice(0, end); p = p.slice(end); }
    }
  }
  // Frasi troppo corte si uniscono alla successiva: meno pause tra un pezzo e l'altro
  let buf = '';
  for (const part of say.split(/(?<=[.!?…;:])\s+|\n+/)) {
    if (!part.trim()) continue;
    buf = buf ? buf + ' ' + part : part;
    if (speakable(buf).length >= 30) { voiceSay(speakable(buf)); buf = ''; }
  }
  if (buf && final) { voiceSay(speakable(buf)); buf = ''; }
  Voice.pending = buf ? buf + ' ' + p : p;
}
function voiceSay(text) {
  if (!/[a-z0-9à-ú]/i.test(text)) return;
  const url = api('/api/tts', { text }).then((r) => r.blob()).then((b) => URL.createObjectURL(b)).catch(() => null);
  Voice.queue.push({ text, url });
  Voice.spoke = true;
  voicePump();
}
async function voicePump() {
  if (!Voice.on || Voice.playing) return;
  const item = Voice.queue.shift();
  if (!item) {
    if (Voice.textDone && (Voice.state === 'thinking' || Voice.state === 'speaking')) voiceListen();
    return;
  }
  Voice.playing = true;
  const url = await item.url;
  if (!Voice.on || item.dropped) { if (url) URL.revokeObjectURL(url); return; }
  if (!url) { Voice.playing = false; voicePump(); return; }
  Object.assign(Voice, { state: 'speaking', echo: 0, bargeMs: 0, playStart: Date.now() });
  renderVoice();
  let finished = false;
  const next = () => {
    if (finished) return;
    finished = true; URL.revokeObjectURL(url);
    if (item.dropped || !Voice.on) return;
    Voice.playing = false; voicePump();
  };
  Voice.cur = item;
  Voice.audio.onended = next; Voice.audio.onerror = next;
  Voice.audio.src = url;
  Voice.audio.play().catch(next);
}
function voiceStreamDone(chat) {
  if (!Voice.on) return;
  if (!Voice.silenced) {
    const last = chat.messages[chat.messages.length - 1];
    if (last?.role === 'error') Voice.pending += '\n' + last.content;
    voiceCut(true);
    // Solo una scheda (conferma, mail, procedura) e nessuna frase: lo dice, cosi' sa di guardare lo schermo
    const added = chat.messages.slice(Voice.sent || 0);
    if (!Voice.spoke && added.some((m) => m.role === 'confirm' || m.view))
      voiceSay(added.some((m) => m.role === 'confirm') ? 'Ti ho preparato la richiesta: confermala o annullala sullo schermo.' : 'Ti ho preparato l\'anteprima: la trovi sullo schermo.');
  }
  Voice.textDone = true;
  if (!Voice.playing && !Voice.queue.length && (Voice.state === 'thinking' || Voice.state === 'speaking')) voiceListen();
}
function voiceInterrupt() {
  Voice.silenced = true;   // il resto della risposta resta scritto, ma non si legge
  if (Voice.cur) Voice.cur.dropped = true;
  Voice.audio.pause();
  Voice.queue.forEach((i) => { i.dropped = true; }); Voice.queue = []; Voice.playing = false;
  voiceListen();
}
function voiceOrbTap() {
  if (Voice.state === 'listening' && Voice.heardMs >= 200) voiceEndTurn();
  else if (Voice.state === 'speaking' || Voice.state === 'thinking') voiceInterrupt();
  else if (Voice.state === 'paused') voiceListen();
}
function voicePause() {
  if (Voice.state === 'paused') { voiceListen(); return; }
  if (Voice.state === 'speaking' || Voice.state === 'thinking') voiceInterrupt();
  stopVoiceRec();
  Object.assign(Voice, { state: 'paused', liveText: '' });
  renderVoice();
}
function renderVoice() {
  const bar = $('#voiceBar');
  if (!Voice.on) { bar.replaceChildren(); return; }
  const st = Voice.state, paused = st === 'paused';
  const sub = st === 'listening' ? (Voice.liveText || (Voice.heardMs >= 200 ? '' : 'Parla pure: quando fai una pausa invio io'))
    : st === 'transcribing' || st === 'thinking' ? Voice.liveText
    : st === 'speaking' ? 'Tocca il cerchio o parlami sopra per interrompermi' : 'Tocca il cerchio per riprendere';
  bar.replaceChildren(
    h('button', { type: 'button', class: 'voice-orb ' + st, id: 'voiceOrb', onclick: voiceOrbTap,
      'aria-label': st === 'speaking' ? 'Interrompi' : st === 'listening' ? 'Ho finito di parlare' : 'Riprendi' }, h('span')),
    h('div', { class: 'voice-tx', 'aria-live': 'polite' }, h('b', { text: VOICE_LABEL[st] || '' }), h('span', { text: sub })),
    h('button', { type: 'button', class: 'icon-btn', title: paused ? 'Riprendi' : 'Pausa', 'aria-label': paused ? 'Riprendi' : 'Pausa',
      html: icon(paused ? 'mic' : 'pause'), onclick: voicePause }),
    h('button', { type: 'button', class: 'rec-ok', title: 'Chiudi la conversazione a voce', 'aria-label': 'Chiudi la conversazione a voce',
      html: icon('x'), onclick: voiceStop }));
}
$('#voiceBtn').onclick = () => voiceStart();

// ================================================================ conferme
// WhatsApp: l'anteprima del messaggio (e la chat letta) con la grafica di WhatsApp
const waTime = (ts) => new Date(ts || Date.now()).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
function waView(v, status) {
  const ticks = (st) => h('span', { class: 'wa-ticks ' + (st || ''), 'aria-label': st === 'sent' ? 'Inviato' : 'Da inviare',
    html: st === 'sent' ? '<svg viewBox="0 0 18 11" width="16" height="11"><path d="M1 6l3 3 6-7M7 9l1 1 8-9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg viewBox="0 0 12 12" width="12" height="12"><circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M6 3.4V6l1.8 1.1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>' });
  const bubble = (me, text, ts, st, extra) => h('div', { class: 'wa-b ' + (me ? 'out' : 'in') }, extra || null,
    text ? h('div', { class: 'wa-t', text }) : null,
    h('span', { class: 'wa-meta' }, h('span', { text: waTime(ts) }), me ? ticks(st) : null));
  const fileEl = (f) => (f.mime || '').startsWith('image/')
    ? h('img', { class: 'wa-img', src: `/api/files/${f.id}`, alt: f.name, loading: 'lazy' })
    : h('div', { class: 'wa-doc' }, h('span', { class: 'wa-doc-ic', text: (f.name.split('.').pop() || 'file').slice(0, 4).toUpperCase() }),
        h('div', {}, h('b', { text: f.name }), h('small', { text: f.mime || 'documento' })));
  let rows;
  if (v.mode === 'chat') rows = (v.messages || []).map((x) => bubble(x.me, x.text, x.ts, 'sent'));
  else {
    const st = status === 'done' ? 'sent' : '';
    const files = v.files || [];
    rows = files.length ? files.map((f, i) => bubble(true, i === 0 ? v.text : '', null, st, fileEl(f))) : [bubble(true, v.text, null, st)];
  }
  return h('div', { class: 'wa-box-chat' },
    h('div', { class: 'wa-head' }, h('span', { class: 'wa-av', text: initials(v.name || v.number) }),
      h('div', { class: 'wa-who' }, h('b', { text: v.name || v.number }), h('small', { text: v.name ? v.number : 'WhatsApp' })),
      h('span', { class: 'wa-logo', html: icon('phone', 'sm') })),
    h('div', { class: 'wa-body' }, ...rows));
}
function confirmEl(chat, m) {
  if (m.view?.kind === 'wa') return waConfirmEl(chat, m);
  const card = h('div', { class: 'confirm-card' },
    h('div', { class: 'ct', html: icon('shield', 'sm') + 'Serve la tua conferma' }),
    h('div', { class: 'md', html: renderMarkdown(m.summary || m.name) }),
    // Anteprima con la grafica del sito: come apparira' dopo la conferma
    m.view?.kind === 'site' ? h('div', { class: 'confirm-preview' }, h('div', { class: 'cp-label', text: 'Anteprima sul sito' }), siteView(m.view)) : null);
  if (m.status === 'pending') {
    card.append(h('div', { class: 'row' },
      h('button', { class: 'btn primary sm', text: 'Conferma', disabled: !!S.stream, onclick: () => decide(chat, m, true) }),
      h('button', { class: 'btn sm', text: 'Annulla', disabled: !!S.stream, onclick: () => decide(chat, m, false) })));
  } else if (m.status === 'working') {
    card.append(h('div', { class: 'st' }, h('span', { class: 'spinner' }), h('span', { text: 'Eseguo…' })));
  } else {
    const ok = m.status === 'done';
    card.append(h('div', { class: 'st ' + (ok ? 'ok' : 'no') }, h('span', { html: icon(ok ? 'check' : 'x', 'sm') }),
      h('span', { text: m.result || (ok ? 'Fatto' : m.status === 'failed' ? 'Non riuscito' : 'Annullato') })));
  }
  return h('div', { class: 'msg' }, card);
}
function waConfirmEl(chat, m) {
  const card = h('div', { class: 'wa-card' }, waView(m.view, m.status));
  if (m.status === 'pending') {
    card.append(h('div', { class: 'wa-actions' }, h('span', { class: 'wa-hint', text: 'Parte dal tuo numero quando premi Invia' }),
      h('button', { class: 'btn sm', text: 'Annulla', disabled: !!S.stream, onclick: () => decide(chat, m, false) }),
      h('button', { class: 'btn sm wa-send', html: icon('up', 'sm') + 'Invia', disabled: !!S.stream, onclick: () => decide(chat, m, true) })));
  } else if (m.status === 'working') {
    card.append(h('div', { class: 'wa-actions' }, h('span', { class: 'spinner' }), h('span', { class: 'wa-hint', text: 'Invio…' })));
  } else {
    const ok = m.status === 'done';
    card.append(h('div', { class: 'wa-actions st ' + (ok ? 'ok' : 'no') }, h('span', { html: icon(ok ? 'check' : 'x', 'sm') }),
      h('span', { text: m.result || (ok ? 'Inviato' : m.status === 'failed' ? 'Non inviato' : 'Annullato') })));
  }
  return h('div', { class: 'msg' }, card);
}
async function decide(chat, m, ok) {
  if (S.stream || m.status !== 'pending') return;
  m.status = 'working'; renderThread();
  try {
    const res = await (await api(`/api/tools/${m.id}/${ok ? 'confirm' : 'cancel'}`, {})).json();
    m.status = !ok ? 'cancelled' : res.failed ? 'failed' : 'done'; m.result = res.display;
    // Un risultato per ogni azione confermata (possono essere piu' piatti insieme)
    (res.messages || [res.message]).forEach((msg, i) => chat.messages.push({ ...msg, display: i ? undefined : res.display, fromConfirm: true, view: i ? undefined : res.view || undefined }));
    saveChat(chat); run(chat);
  } catch (e) {
    m.status = 'expired'; m.result = e.message;
    saveChat(chat); renderThread();
  }
}

// ================================================================ streaming
function regenerate(chat) {
  if (S.stream) return;
  while (chat.messages.length && chat.messages[chat.messages.length - 1].role !== 'user') chat.messages.pop();
  run(chat);
}

async function run(chat) {
  chat.messages = chat.messages.filter((m) => m.role !== 'error');
  let reply = { role: 'assistant', content: '', thinking: '', _streaming: true };
  chat.messages.push(reply);
  // Lo spostamento in cima della chat la mostra come "recente" nella barra laterale
  S.chats = [chat, ...S.chats.filter((c) => c !== chat)];
  const controller = new AbortController();
  S.stream = { chatId: chat.id, controller };
  renderAll(); scrollToBottom(true);

  // Al modello vanno solo i messaggi veri (utente, assistente, esiti degli strumenti), non le schede dell'interfaccia
  const history = chat.messages.slice(0, -1).filter((m) => ['user', 'assistant', 'tool'].includes(m.role) || (m.role === 'feed' && S.feed?.[m.fid])).map((m) => {
    if (m.role === 'feed') {
      const it = S.feed[m.fid], when = new Date(it.at * 1000).toLocaleString('it-IT', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
      return { role: 'assistant', content: `[Messaggio che hai scritto tu per primo, ${when}] ${it.title}\n${it.body || ''}`.trim() };
    }
    const o = { role: m.role, content: m.content || '' };
    if (m.images?.length) o.images = m.images.map((d) => d.slice(d.indexOf(',') + 1));
    if (m.tool_calls) o.tool_calls = m.tool_calls;
    if (m.files?.length) o.files = m.files.map((f) => ({ id: f.id, name: f.name, ...(f.image ? { image: true } : {}) }));
    if (m.tool_name) o.tool_name = m.tool_name;
    return o;
  });
  const model = chat.model || activeModel();
  let frame = 0, t0 = performance.now(), thinkStart = 0;
  const paint = () => {
    frame = 0;
    if (S.currentId !== chat.id) return;
    const el = $('#thread .msg.assistant.last');
    if (!el || !reply) return;
    paintAssistant(el, reply, chat, true);
    keepFollowing();
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

  try {
    const r = await api('/api/chat', { model, messages: history, chat_id: chat.id, think: hasCap('thinking') && S.think ? true : undefined,
      voice: Voice.on || undefined }, { signal: controller.signal });
    const reader = r.body.getReader(), dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line) continue;
        const d = JSON.parse(line);
        if (d.error) throw new Error(d.error);
        if (d.event === 'assistant_tool_calls') {
          reply.tool_calls = d.message.tool_calls; reply.content = d.message.content || reply.content;
          if (thinkStart && !reply.thinkMs) reply.thinkMs = performance.now() - thinkStart;
          delete reply._streaming;
          const slow = (d.message.tool_calls || []).map((t) => t.function?.name).find((n) => WORKING_LABEL[n]);
          if (slow) { reply = { role: 'assistant', content: '', thinking: '', _streaming: true, _reading: slow }; chat.messages.push(reply); renderThread(); keepFollowing(); }
          continue;
        }
        if (d.event === 'ping') continue;
        if (d.event === 'project') { chat.project = d.project || null; renderProjectChip(); continue; }
        if (d.event === 'tool_result') {
          if (reply && reply._streaming && !reply.content && !reply.thinking && !reply.tool_calls) chat.messages.splice(chat.messages.indexOf(reply), 1);
          chat.messages.push({ ...d.message, display: d.display, view: d.view || undefined, undo: d.undo || undefined, sources: d.sources || undefined, files: d.files || undefined, open: d.open || undefined });
          if (d.undo) refreshMemoryCount();
          reply = { role: 'assistant', content: '', thinking: '', _streaming: true, _reading: READ_TOOLS[d.message?.tool_name] ? d.message.tool_name : null };
          if (d.message?.tool_name?.startsWith('mail_')) refreshMailBadge();
          if (d.undo?.type === 'cal_event') loadToday();
          chat.messages.push(reply); thinkStart = 0;
          renderThread(); keepFollowing();
          continue;
        }
        if (d.event === 'confirm') {
          chat.messages.push({ role: 'confirm', id: d.id, name: d.name, args: d.args, summary: d.summary, view: d.view || undefined, status: 'pending' });
          reply = null;
          continue;
        }
        if (!reply) continue;
        if (d.message?.thinking) { if (!thinkStart) thinkStart = performance.now(); reply.thinking += d.message.thinking; }
        if (d.message?.content) {
          if (thinkStart && !reply.thinkMs) reply.thinkMs = performance.now() - thinkStart;
          reply.content += d.message.content;
          voiceFeed(d.message.content);
        }
        if (d.done) {
          const parts = [];
          if (d.eval_count && d.eval_duration) parts.push(`${(d.eval_count / (d.eval_duration / 1e9)).toFixed(1)} token/s`);
          if (d.eval_count) parts.push(`${d.eval_count} token`);
          if (d.load_duration > 1.5e9) parts.push(`caricato in ${(d.load_duration / 1e9).toFixed(1)} s`);
          reply.stats = parts.join(' · ');
        }
      }
      schedule();
    }
  } catch (err) {
    if (err.name === 'AbortError') { if (reply) reply.stats = 'Interrotta'; }
    else chat.messages.push({ role: 'error', content: friendlyError(err.message) });
  }
  if (frame) cancelAnimationFrame(frame);
  if (reply) {
    delete reply._streaming;
    if (thinkStart && !reply.thinkMs) reply.thinkMs = performance.now() - thinkStart;
    if (!reply.content && !reply.thinking && !reply.tool_calls) chat.messages.splice(chat.messages.indexOf(reply), 1);
  }
  S.stream = null;
  saveChat(chat);
  renderAll();
  if (S.currentId === chat.id) keepFollowing();
  refresh();
  voiceStreamDone(chat);
}
function friendlyError(msg) {
  if (/network error|Failed to fetch|NetworkError|\b52[2-4]\b/i.test(msg)) return 'La connessione si è interrotta prima della risposta. Riprova: se un’azione era partita, controlla prima se è già stata fatta.';
  if (/non raggiungibile|ConnectError|connect/i.test(msg)) return 'Non riesco a raggiungere il PC. Controlla che sia acceso e riprova.';
  if (/does not support thinking/i.test(msg)) return 'Questo modello non supporta il ragionamento: disattiva “Ragiona” e riprova.';
  if (/does not support|vision|image/i.test(msg)) return 'Questo modello non accetta immagini.';
  if (/memory|out of memory|CUDA/i.test(msg)) return 'Memoria insufficiente sul PC per questo modello. ' + msg;
  return msg;
}

// =============================================================== settings
const fmtDate = (ts) => (ts ? new Date(ts * 1000).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : 'mai');
function fmtAgo(ts) {
  if (!ts) return 'mai entrato';
  const m = Math.round((Date.now() / 1000 - ts) / 60);
  if (m < 2) return 'attivo ora';
  if (m < 60) return `${m} min fa`;
  if (m < 24 * 60) return `${Math.round(m / 60)} h fa`;
  if (m < 7 * 24 * 60) return `${Math.round(m / 1440)} giorni fa`;
  return fmtDate(ts);
}
// Colore dell'avatar ricavato dal nome: ognuno ha sempre il suo
const hueOf = (name) => [...name].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
const avatar = (name, cls = '') => h('span', { class: 'avatar c ' + cls, style: `--h:${hueOf(name)}`, text: (name[0] || '?') });

function closeSettings() { $('#main').classList.remove('settings-open'); }
function closeViews() { closeSettings(); if (typeof closeMemory === 'function') closeMemory(); if (typeof closeMail === 'function') closeMail(); if (typeof closeAgenda === 'function') closeAgenda(); if (typeof closeClienti === 'function') closeClienti(); if (typeof closeAura === 'function') closeAura(); if (typeof closeBrainView === 'function') closeBrainView(); }
async function openSettings(tab) {
  closeSide(); togglePicker(false); closeViews();
  $('#main').classList.add('settings-open');
  S.setTab = tab || S.setTab || 'account';
  if (S.setTab === 'people' && !isAdmin()) S.setTab = 'account';
  renderSettings();
}
$('#accountBtn').onclick = () => openSettings();

function field(label, attrs) {
  const id = 'f' + uid();
  const { tag = 'input', hint, ...rest } = attrs;
  return h('div', { class: 'field' }, h('label', { for: id, text: label }), h(tag, { id, ...rest }), hint ? h('div', { class: 'field-hint', text: hint }) : null);
}
function segmented(options, value, onChange, label) {
  const wrap = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label });
  const paint = (v) => wrap.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', b.dataset.v === v));
  options.forEach(([v, text, ic]) => wrap.append(h('button', { type: 'button', role: 'radio', 'data-v': v, html: (ic ? icon(ic, 'sm') : '') + text,
    onclick: () => { paint(v); onChange(v); } })));
  paint(value);
  wrap.value = () => wrap.querySelector('[aria-checked="true"]')?.dataset.v;
  return wrap;
}

function renderSettings() {
  const root = $('#settings');
  const tabs = [['account', 'Account']].concat(isAdmin() ? [['people', 'Persone']] : []);
  const body = h('div', { class: 'set-body' });
  const wrap = h('div', { class: 'set-wrap' },
    h('div', { class: 'set-head' }, h('h1', { text: 'Impostazioni' }),
      h('button', { class: 'icon-btn', title: 'Chiudi', 'aria-label': 'Chiudi impostazioni', html: icon('x'), onclick: () => { closeSettings(); focusInput(); } })),
    tabs.length > 1 ? h('div', { class: 'tabs', role: 'tablist' }, tabs.map(([k, t]) => h('button', { role: 'tab', class: 'tab', 'aria-selected': S.setTab === k, text: t,
      onclick: () => { S.setTab = k; renderSettings(); } }))) : null,
    body);
  root.replaceChildren(wrap);
  if (S.setTab === 'people') peopleTab(body); else accountTab(body);
}

// ------------------------------------------------------------------ account
// In alto il profilo; sotto una sezione alla volta (Aura, Sicurezza, Collegamenti, Aspetto): niente pagina infinita.
const ACC_SECTIONS = [['aura', 'Aura', 'brain'], ['usage', 'Consumi', 'chart'], ['security', 'Sicurezza', 'shield'], ['links', 'Collegamenti', 'link'], ['look', 'Aspetto', 'sun']];
function accountTab(body) {
  const sec = S.accSec = ACC_SECTIONS.some(([k]) => k === S.accSec) ? S.accSec : 'aura';
  const hero = h('section', { class: 'acc-hero' },
    avatar(S.me.user, 'xl'),
    h('div', { class: 'acc-id' },
      h('div', { class: 'p-name' }, S.me.user, h('span', { class: 'badge' + (isAdmin() ? ' admin' : ''), text: isAdmin() ? 'amministratore' : 'utente' })),
      h('div', { class: 'p-sub', text: S.me.email || 'Nessuna email collegata' })),
    h('button', { class: 'btn sm acc-out', html: icon('logout', 'sm') + 'Esci', onclick: () => $('#logoutBtn').click() }));
  const nav = h('div', { class: 'acc-nav', role: 'tablist' }, ...ACC_SECTIONS.filter(([k]) => k !== 'links' || isAdmin()).map(([k, t, ic]) =>
    h('button', { role: 'tab', class: 'acc-pill', 'aria-selected': String(sec === k), html: icon(ic, 'sm') + t, onclick: () => { S.accSec = k; renderSettings(); } })));
  const content = sec === 'aura' ? [personaCard(), startModelCard(), autonomyCard()] : sec === 'usage' ? usageCards() : sec === 'security' ? securityCards() : sec === 'links' ? [gmailCard(), whatsappCard(), cloudCard()] : lookCard();
  body.append(hero, nav, ...[content].flat(3));   // una sezione puo' avere piu' schede (anche liste dentro liste)
}

function securityCards() {
  const oldP = field('Password attuale', { type: 'password', autocomplete: 'current-password' });
  const newP = field('Nuova password', { type: 'password', autocomplete: 'new-password', minlength: 10, hint: 'Almeno 10 caratteri. Meglio una frase di più parole, facile da ricordare per te.' });
  const repP = field('Ripeti la nuova password', { type: 'password', autocomplete: 'new-password' });
  const msg = h('div', { class: 'form-msg', role: 'status' });
  const btn = h('button', { class: 'btn primary', type: 'submit', text: 'Aggiorna password' });
  const form = h('form', { class: 'stack', novalidate: true, onsubmit: async (e) => {
    e.preventDefault();
    const [o, n, r] = [oldP, newP, repP].map((f) => $('input', f).value);
    msg.className = 'form-msg err';
    if (!o) { msg.textContent = 'Scrivi la password attuale.'; return; }
    if (n.length < 10) { msg.textContent = 'La nuova password deve avere almeno 10 caratteri.'; return; }
    if (n !== r) { msg.textContent = 'Le due password nuove non coincidono.'; return; }
    btn.disabled = true; msg.textContent = '';
    try { await api('/api/me/password', { old: o, new: n }); form.reset(); msg.className = 'form-msg ok'; msg.innerHTML = icon('check', 'sm') + 'Password aggiornata. Sugli altri dispositivi dovrai accedere di nuovo.'; }
    catch (ex) { msg.textContent = ex.message; }
    btn.disabled = false;
  } }, oldP, newP, repP, h('div', { class: 'form-actions' }, btn), msg);
  return [
    h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { html: icon('key', 'sm') + 'Password' }), h('p', { text: 'Cambiala quando vuoi: ti chiediamo quella attuale per sicurezza.' })), form),
    h('section', { class: 'card row-card' }, h('div', { class: 'card-head' }, h('h2', { html: icon('logout', 'sm') + 'Sessioni' }),
      h('p', { text: 'Hai usato un computer non tuo o pensi che qualcuno abbia la tua password? Esci ovunque e poi cambiala.' })),
      confirmIcon('logout', 'Esci da tutti i dispositivi', 'Esci ovunque?', async () => {
        try { await api('/api/me/logout-all', {}); toast('Sessione chiusa su tutti i dispositivi'); } catch (e) { toast(e.message); }
        showLogin();
      })),
  ];
}

function lookCard() {
  const cur = pref.get('theme', 'auto');
  const tile = (v, t, ic) => h('button', { class: 'theme-tile t-' + v, 'aria-pressed': String(cur === v), onclick: () => { pref.set('theme', v); applyTheme(); renderSettings(); } },
    h('span', { class: 'theme-prev' }, h('i'), h('i'), h('i')), h('span', { class: 'theme-lbl', html: icon(ic, 'sm') + t }));
  return h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Aspetto' }), h('p', { text: 'Automatico segue le impostazioni del dispositivo.' })),
    h('div', { class: 'theme-tiles' }, tile('auto', 'Automatico', 'auto'), tile('light', 'Chiaro', 'sun'), tile('dark', 'Scuro', 'moon')));
}

function gmailCard() {
  const p = h('p', { text: 'Controllo…' }), actions = h('div', { class: 'form-actions' });
  const card = h('section', { class: 'card row-card' }, h('div', { class: 'card-head' }, h('h2', { html: icon('mail', 'sm') + 'Google: posta' }), p), actions);
  (async () => {
    try {
      const s = await (await api('/api/gmail/status')).json();
      if (!s.configured) { p.textContent = 'Non ancora configurato sul server (manca il progetto Google).'; return; }
      if (!s.connected) {
        p.textContent = 'Collega Gmail: Aura legge e smista la posta, prepara bozze, ti segnala le mail che contano e butta quelle inutili.';
        actions.append(h('a', { class: 'btn primary', href: '/api/gmail/connect', text: 'Collega Google' }));
        return;
      }
      p.textContent = s.ok === false ? `${s.email}: ${s.error}` : `Collegato: ${s.email}${s.messages != null ? ` · ${s.messages.toLocaleString('it-IT')} mail` : ''}`;
      if (s.ok === false) actions.append(h('a', { class: 'btn primary', href: '/api/gmail/connect', text: 'Ricollega' }));
      actions.append(confirmIcon('logout', 'Scollega Google', 'Scollegare?', async () => {
        try { await api('/api/gmail/disconnect', {}); toast('Gmail scollegato'); card.replaceWith(gmailCard()); } catch (e) { toast(e.message); }
      }));
    } catch (e) { p.textContent = e.message; }
  })();
  return card;
}

const AUTONOMY_LABELS = {
  memoria_salva: ['Salvare ricordi', 'Quando gli racconti qualcosa di importante su di te. In chat vedi cosa ha salvato e puoi cancellarlo.', 'Memoria'],
  memoria_cancella: ['Cancellare ricordi', 'Quando un ricordo non è più vero o gli chiedi di dimenticarlo.', 'Memoria'],
  calendario: ['Impegni e promemoria', 'Aggiungere o spostare impegni e promemoria nella sua agenda.', 'Agenda e posta'],
  calendario_elimina: ['Togliere dall\'agenda', 'Cancellare impegni o promemoria.', 'Agenda e posta'],
  mail_pulizia: ['Pulizia della posta in chat', 'Quando glielo chiedi in chat: cestino, spam, archivio. Inviare mail e svuotare il cestino chiedono sempre conferma.', 'Agenda e posta'],
  sito_menu: ['Menu e piatti', 'Aggiungere o modificare piatti, accenderli e spegnerli, pubblicare il menu del giorno.', 'Sito del locale'],
  sito_eventi: ['Eventi', 'Creare, modificare e ripetere serate e appuntamenti golosi.', 'Sito del locale'],
  sito_elimina: ['Eliminazioni', 'Cancellare piatti, eventi o il menu del giorno. Il sito tiene una copia di sicurezza al giorno.', 'Sito del locale'],
  utenti: ['Inviti', 'Creare inviti per nuovi account e mandarli per mail.', 'Persone'],
};
const PERSONA_LABELS = {
  tono: ['Tono', { amichevole: 'Amichevole', diretto: 'Diretto e asciutto', scherzoso: 'Scherzoso', professionale: 'Professionale' }],
  lunghezza: ['Lunghezza delle risposte', { brevissime: 'Brevissime', brevi: 'Brevi', normali: 'Normali', dettagliate: 'Dettagliate' }],
  spiegazioni: ['Spiegazioni', { tecniche: 'Tecniche (sono del mestiere)', semplici: 'Semplici, senza gergo' }],
  iniziativa: ['Iniziativa', { chiede: 'Chiede sempre prima', equilibrata: 'Fa da solo le cose sicure', proattivo: 'Proattivo: propone idee' }],
  registro: ['Ti dà del', { tu: 'Tu', lei: 'Lei' }],
  emoji: ['Emoji', { mai: 'Mai', poche: 'Ogni tanto', spesso: 'Spesso' }],
};
// Come si comporta Aura con te: lo decidi tu (finisce anche nel cervello, in boot/soul.md)
function personaCard() {
  const card = h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { html: icon('user', 'sm') + 'Come si comporta con te' }),
    h('p', { text: 'Il carattere di Aura lo scegli tu. Vale in tutte le chat e lo trovi anche nel cervello (boot/soul.md).' })),
    h('div', { class: 'list-empty', text: 'Carico…' }));
  (async () => {
    let d;
    try { d = await (await api('/api/me/persona')).json(); } catch (e) { card.lastChild.textContent = e.message; return; }
    const p = d.persona, fields = {};
    const nome = h('input', { class: 'ag-in', value: p.nome || '', placeholder: 'Come ti chiama', 'aria-label': 'Come ti chiama' });
    const extra = h('textarea', { class: 'ag-in', rows: 3, placeholder: 'Altre istruzioni, es. «quando parliamo di lavoro sii formale», «non propormi mai di accendere il PC»', 'aria-label': 'Altre istruzioni' });
    extra.value = p.extra || '';
    const rows = Object.entries(PERSONA_LABELS).map(([k, [label, names]]) => {
      fields[k] = h('select', { class: 'ag-in', 'aria-label': label }, ...(d.opts[k] || Object.keys(names)).map((v) => h('option', { value: v, text: names[v] || v })));
      fields[k].value = p[k];
      return h('label', { class: 'ag-f' }, h('span', { text: label }), fields[k]);
    });
    const out = h('div', { class: 'form-msg', role: 'status' });
    const save = h('button', { class: 'btn primary', text: 'Salva', onclick: async () => {
      save.disabled = true;
      try {
        const body = { nome: nome.value.trim(), extra: extra.value.trim() };
        for (const k in fields) body[k] = fields[k].value;
        const r = await (await api('/api/me/persona', body, { method: 'PUT' })).json();
        await r; out.className = 'form-msg ok'; out.textContent = 'Salvato';
      } catch (e) { out.className = 'form-msg err'; out.textContent = e.message; }
      save.disabled = false; } });
    card.lastChild.replaceWith(h('div', { class: 'stack persona-form' },
      h('label', { class: 'ag-f' }, h('span', { text: 'Come ti chiama' }), nome),
      h('div', { class: 'persona-grid' }, ...rows),
      h('label', { class: 'ag-f' }, h('span', { text: 'Altre istruzioni (facoltative)' }), extra),
      h('div', { class: 'form-actions' }, save), out));
  })();
  return card;
}
// ------------------------------------------------------------------ consumi
// Token usati da ogni modello (sul PC e nel cloud), quanto costano e quanto credito resta
const fmtTok = (n) => n >= 1e6 ? `${(n / 1e6).toLocaleString('it-IT', { maximumFractionDigits: 1 })} mln` : n >= 1e3 ? `${(n / 1e3).toLocaleString('it-IT', { maximumFractionDigits: 1 })} mila` : String(n || 0);
const fmtMoney = (x, cur = 'EUR') => x == null ? '—' : (Math.abs(x) > 0 && Math.abs(x) < 0.01 ? '< ' + (0.01).toLocaleString('it-IT', { style: 'currency', currency: cur })
  : x.toLocaleString('it-IT', { style: 'currency', currency: cur }));
const modelLabel = (n) => isCloudM(n) ? '☁ ' + n.slice(6) : n;
async function loadUsage() { try { S.usage = await (await api('/api/usage')).json(); } catch { S.usage = null; } return S.usage; }

function usageCards() {
  const wrap = h('div', { class: 'usage' }, h('section', { class: 'card' }, h('div', { class: 'list-empty', text: 'Carico i consumi…' })));
  (async () => {
    const u = await loadUsage();
    if (!u) { wrap.replaceChildren(h('section', { class: 'card' }, h('div', { class: 'list-empty', text: 'Non riesco a leggere i consumi.' }))); return; }
    const am = activeModel();
    const cur = u.models.find((m) => m.name === am) || { name: am, cloud: isCloudM(am), today: [0, 0, 0], month: [0, 0, 0], price: isCloudM(am) ? u.cloud_price : [0, 0], today_cost: 0, month_cost: 0, days: [] };
    const cost = (m, k) => !m.cloud ? 'Gratis' : m[k + '_cost'] == null ? 'prezzo da impostare' : fmtMoney(m[k + '_cost']);
    const risp = (n) => n === 1 ? '1 risposta' : `${n} risposte`;
    const stat = (label, val, sub) => h('div', { class: 'u-stat' }, h('small', { text: label }), h('b', { class: 'tnum', text: val }), sub ? h('span', { class: 'tnum', text: sub }) : null);
    // il modello attivo, in grande
    const active = h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { html: icon('chart', 'sm') + 'Modello attivo' }),
        h('p', { text: cur.cloud ? `${modelLabel(am)} · nel cloud${u.provider ? ' (' + u.provider + ')' : ''}: si paga a token.` : `${am || 'nessuno'} · sul PC di casa: non costa niente (solo corrente).` })),
      h('div', { class: 'u-stats' },
        stat('Oggi', fmtTok(cur.today[1] + cur.today[2]) + ' token', `${risp(cur.today[0])} · ${cost(cur, 'today')}`),
        stat('Questo mese', fmtTok(cur.month[1] + cur.month[2]) + ' token', `${risp(cur.month[0])} · ${cost(cur, 'month')}`),
        cur.cloud && cur.price ? stat('Prezzo', `${fmtMoney(cur.price[0])} / ${fmtMoney(cur.price[1])}`, 'per milione di token (entrata / uscita)') : null),
      usageBars(cur.days));
    const cards = [active];
    // il credito
    if (u.cloud || u.credit) {
      const c = u.credit;
      const low = c && c.left != null && c.total && c.left < c.total * 0.15;
      cards.push(h('section', { class: 'card' },
        h('div', { class: 'card-head' }, h('h2', { html: icon('globe', 'sm') + 'Credito nel cloud' }),
          h('p', { text: !c ? 'Scrivi qui sotto quanto credito hai caricato: Aura sottrae quello che spendi.'
            : c.real ? 'Il credito vero, letto dal fornitore.' : `Stimato: ${fmtMoney(c.total)} caricati dal ${new Date(c.since).toLocaleDateString('it-IT')}, meno ${fmtMoney(c.spent)} spesi da allora.` })),
        c ? h('div', { class: 'u-credit' + (low || c.left < 0 ? ' low' : '') }, h('b', { class: 'tnum', text: fmtMoney(c.left, c.currency) }), h('span', { text: c.left < 0 ? 'credito finito' : 'rimasti' }),
          c.total ? h('div', { class: 'u-meter' }, h('i', { style: `width:${Math.max(0, Math.min(100, (100 * c.left) / c.total))}%` })) : null) : null,
        isAdmin() ? usageCfgForm(u) : null));
    }
    // tutti i modelli
    cards.push(h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Tutti i modelli, questo mese' }),
        h('p', { text: 'Le risposte in chat e i lavori in sottofondo (posta, diario, ricordi). Entrata = quello che legge, uscita = quello che scrive.' })),
      u.models.length ? h('div', { class: 'u-table' },
        h('div', { class: 'u-row head' }, h('span', { text: 'Modello' }), h('span', { text: 'Risposte' }), h('span', { text: 'Entrata' }), h('span', { text: 'Uscita' }), h('span', { text: 'Costo' })),
        ...u.models.map((m) => h('div', { class: 'u-row' + (m.name === am ? ' on' : '') },
          h('span', { class: 'nm', text: modelLabel(m.name), title: `${m.chat || 0} in chat · ${m.sfondo || 0} in sottofondo` }),
          h('span', { class: 'tnum', text: String(m.month[0]) }), h('span', { class: 'tnum', text: fmtTok(m.month[1]) }), h('span', { class: 'tnum', text: fmtTok(m.month[2]) }),
          h('span', { class: 'tnum', text: cost(m, 'month') }))))
        : h('div', { class: 'list-empty', text: 'Ancora niente: i conti partono dalla prossima risposta.' })));
    wrap.replaceChildren(...cards);
  })();
  return wrap;
}
function usageBars(days) {
  if (!days?.length) return null;
  const max = Math.max(...days.map((d) => d[1]), 1);
  return h('div', { class: 'u-bars', 'aria-label': 'Token al giorno, ultimi 30 giorni' },
    ...days.map(([d, n]) => h('i', { style: `height:${Math.max(4, Math.round((100 * n) / max))}%`, title: `${new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}: ${fmtTok(n)} token` })));
}
function usageCfgForm(u) {
  const name = u.cloud ? u.cloud.slice(6) : '';
  const num = (v, ph, label) => h('input', { class: 'ag-in', type: 'number', step: '0.01', min: '0', value: v ?? '', placeholder: ph, 'aria-label': label });
  const pin = num(u.cloud_price?.[0], '0,00', 'Prezzo entrata'), pout = num(u.cloud_price?.[1], '0,00', 'Prezzo uscita');
  const cred = num(u.cfg_credit, 'es. 10', 'Credito caricato');
  const since = h('input', { class: 'ag-in', type: 'date', value: u.cfg_since || new Date().toISOString().slice(0, 10), 'aria-label': 'Caricato il' });
  const out = h('div', { class: 'form-msg', role: 'status' });
  const val = (el) => el.value === '' ? null : Number(el.value);
  return h('details', { class: 'cloud-adv' }, h('summary', { text: 'Prezzi e credito' }),
    h('div', { class: 'stack' },
      name ? h('div', { class: 'u-cfg' }, h('label', { class: 'ag-f' }, h('span', { text: `${name}: € per milione in entrata` }), pin),
        h('label', { class: 'ag-f' }, h('span', { text: '€ per milione in uscita' }), pout)) : null,
      h('div', { class: 'u-cfg' }, h('label', { class: 'ag-f' }, h('span', { text: 'Credito caricato (€)' }), cred), h('label', { class: 'ag-f' }, h('span', { text: 'Caricato il' }), since)),
      h('small', { class: 'cloud-note', text: 'I prezzi li trovi nel listino del fornitore. Il credito vero lo vedi solo sul suo sito: qui è una stima dai token contati.' }),
      h('div', { class: 'form-actions' }, h('button', { class: 'btn primary', text: 'Salva', onclick: async () => {
        try {
          await api('/api/usage/config', { prices: name ? { [name]: [val(pin), val(pout)] } : {}, credit: val(cred), credit_since: since.value }, { method: 'PUT' });
          toast('Salvato'); renderSettings();
        } catch (e) { out.className = 'form-msg err'; out.textContent = e.message; } } })), out));
}

// Quale modello parte da solo quando apri l'app: Gemma sul PC di casa o il modello nel cloud
function startModelCard() {
  const cloud = S.status?.cloud;
  const seg = segmented([['local', 'Gemma (PC di casa)'], ['cloud', 'Cloud']], S.me.start_model || 'local', async (v) => {
    try {
      S.me.start_model = (await (await api('/api/me/autonomy', { start_model: v }, { method: 'PUT' })).json()).start_model;
      // vale subito per le chat nuove
      S.model = v === 'cloud' && cloud ? cloud : (pref.get('model', '') && !isCloudM(pref.get('model', '')) ? pref.get('model', '') : null);
      if (!S.model) refresh(); else renderStatus();
      toast(v === 'cloud' ? (cloud ? "All'avvio parte il modello nel cloud" : 'Salvato: configura prima il cloud in Collegamenti') : "All'avvio parte Gemma sul PC di casa");
    } catch (e) { toast(e.message); }
  }, "Modello all'avvio");
  return h('section', { class: 'card row-card' }, h('div', { class: 'card-head' }, h('h2', { text: "Modello all'avvio" }),
    h('p', { text: cloud ? `Quello che parte quando apri Aura. Il cloud è ${cloud.slice(6)}; puoi sempre cambiarlo dal menu in alto.` : 'Quello che parte quando apri Aura. Per il cloud configuralo prima in Collegamenti.' })), seg);
}
function autonomyCard() {
  const groups = S.me.autonomy_groups || [];
  const byHead = new Map();
  for (const g of groups) {
    const [title, desc, headName] = AUTONOMY_LABELS[g] || [g, '', 'Altro'];
    const on = (S.me.autonomy?.[g] || 'ask') === 'auto';
    const sw = h('button', { class: 'switch', role: 'switch', 'aria-checked': String(on), 'aria-label': `${title}: fa da solo`, onclick: async () => {
      const v = sw.getAttribute('aria-checked') === 'true' ? 'ask' : 'auto';
      sw.setAttribute('aria-checked', v === 'auto');
      try { S.me.autonomy = (await (await api('/api/me/autonomy', { autonomy: { [g]: v } }, { method: 'PUT' })).json()).autonomy; toast(v === 'auto' ? `${title}: fa da solo` : `${title}: ti chiede conferma`); }
      catch (e) { sw.setAttribute('aria-checked', v !== 'auto'); toast(e.message); }
    } }, h('span'));
    const row = h('div', { class: 'auto-row' }, h('div', {}, h('b', { text: title }), h('small', { text: desc })), sw);
    byHead.set(headName, [...(byHead.get(headName) || []), row]);
  }
  const show = segmented([['list', 'Elenco'], ['icon', 'Solo simbolo']], S.me.mem_display || 'list', async (v) => {
    try { S.me.mem_display = (await (await api('/api/me/autonomy', { mem_display: v }, { method: 'PUT' })).json()).mem_display; renderThread(); }
    catch (e) { toast(e.message); }
  }, 'Ricordi in chat');
  return [
    h('section', { class: 'card' },
      h('div', { class: 'card-head' }, h('h2', { text: 'Cosa può fare da solo' }),
        h('p', { text: 'Acceso: Aura agisce subito e te lo dice. Spento: prima ti chiede conferma.' })),
      ...[...byHead].map(([name, rows]) => h('div', { class: 'auto-group' }, h('div', { class: 'auto-gh', text: name }), h('div', { class: 'auto-list' }, rows)))),
    h('section', { class: 'card row-card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Ricordi in chat' }),
      h('p', { text: 'Sotto la risposta: l\'elenco di cosa ha salvato, oppure solo un simbolo che apri con un clic.' })), show),
  ];
}

// ------------------------------------------------------------------ persone
function linkBox(res, username, email) {
  const linkIn = h('input', { readonly: true, value: res.link, 'aria-label': 'Link', onfocus: (e) => e.target.select() });
  const copyB = h('button', { class: 'btn sm', type: 'button', 'data-label': '1', html: icon('copy', 'sm') + 'Copia', onclick: () => copyText(res.link, copyB) });
  const hours = Math.round((res.expires * 1000 - Date.now()) / 3600e3);
  return h('div', { class: 'result' + (res.mailed ? ' ok' : '') },
    h('div', { class: 'r-title', html: icon(res.mailed ? 'mail' : 'link', 'sm') },
      res.mailed ? h('span', {}, 'Mail inviata a ', h('b', { text: email })) : h('span', { text: `Link per ${username} pronto` })),
    h('div', { class: 'r-sub', text: res.mailed ? `Il link vale ${hours} ore. Se serve, puoi anche copiarlo qui sotto.`
      : `${res.mail_error === 'posta non configurata' ? 'La posta non è configurata' : 'La mail non è partita: ' + res.mail_error}. Copia il link e mandalo tu (vale ${hours} ore, una volta sola).` }),
    h('div', { class: 'linkrow' }, linkIn, copyB));
}

function inviteCard(onDone) {
  const user = field('Nome utente', { autocapitalize: 'none', spellcheck: 'false', placeholder: 'giulia', hint: 'Minuscolo, senza spazi. È quello che userà per entrare.' });
  const mail = field('Email', { type: 'email', placeholder: 'giulia@example.com', hint: S.me.mail ? 'Ci mandiamo il link d\'invito.' : 'Facoltativa: la posta non è ancora configurata.' });
  const role = segmented([['user', 'Utente'], ['admin', 'Amministratore']], 'user', () => {}, 'Ruolo');
  const msg = h('div', { class: 'form-msg err', role: 'status' });
  const out = h('div');
  const btn = h('button', { class: 'btn primary', type: 'submit', html: icon(S.me.mail ? 'mail' : 'link', 'sm') + (S.me.mail ? 'Crea e invia invito' : 'Crea link d\'invito') });
  const form = h('form', { class: 'stack', novalidate: true, onsubmit: async (e) => {
    e.preventDefault(); msg.textContent = ''; out.replaceChildren();
    const username = $('input', user).value.trim().toLowerCase(), email = $('input', mail).value.trim();
    if (!username) { msg.textContent = 'Scrivi un nome utente.'; return; }
    btn.disabled = true;
    try {
      const res = await (await api('/api/admin/invites', { username, email, role: role.value() })).json();
      form.reset(); out.append(linkBox(res, username, email)); onDone();
    } catch (ex) { msg.textContent = ex.message; }
    btn.disabled = false;
  } }, h('div', { class: 'grid2' }, user, mail), h('div', { class: 'field' }, h('label', { text: 'Ruolo' }), role,
      h('div', { class: 'field-hint', text: 'Gli utenti chattano; gli amministratori gestiscono anche PC, modelli e persone.' })),
    h('div', { class: 'form-actions' }, btn), msg, out);
  return h('section', { class: 'card' }, h('div', { class: 'card-head' }, h('h2', { text: 'Invita una persona' }),
    h('p', { text: 'Chi riceve il link sceglie da solo la password: tu non la vedi mai.' })), form);
}

function confirmIcon(ic, label, confirmLabel, action) {
  const b = h('button', { class: 'icon-btn sm danger-ic', type: 'button', title: label, 'aria-label': label, html: icon(ic, 'sm') });
  b.onclick = () => {
    if (!b.classList.contains('confirm')) {
      b.classList.add('confirm'); b.textContent = confirmLabel;
      setTimeout(() => { if (b.isConnected) { b.classList.remove('confirm'); b.innerHTML = icon(ic, 'sm'); } }, 3000);
      return;
    }
    action();
  };
  return b;
}

async function peopleTab(body) {
  const list = h('div', { class: 'set-body' }, h('div', { class: 'card list-empty', text: 'Carico le persone…' }));
  body.append(inviteCard(() => renderPeople(list)), list);
  await renderPeople(list);
}

async function renderPeople(box) {
  let data;
  try { data = await (await api('/api/admin/users')).json(); }
  catch (e) { box.replaceChildren(h('div', { class: 'card list-empty', text: e.message })); return; }
  const reload = () => renderPeople(box);
  const sections = [];

  if (data.invites.length) {
    sections.push(h('section', { class: 'card flush' },
      h('div', { class: 'card-head pad' }, h('h2', {}, 'In attesa ', h('span', { class: 'count', text: data.invites.length })),
        h('p', { text: 'Link creati e non ancora usati.' })),
      h('div', { class: 'people' }, data.invites.map((iv) => {
        const link = `${location.origin}/invito/${iv.token}`;
        const copyB = h('button', { class: 'icon-btn sm', type: 'button', title: 'Copia link', 'aria-label': 'Copia link', html: icon('copy', 'sm'), onclick: () => copyText(link, copyB) });
        const hours = Math.max(1, Math.round((iv.expires * 1000 - Date.now()) / 3600e3));
        return h('div', { class: 'person' }, h('span', { class: 'avatar c dashed', style: `--h:${hueOf(iv.username)}`, text: iv.username[0] }),
          h('div', { class: 'who' }, h('div', { class: 't' }, iv.username, h('span', { class: 'badge', text: iv.user_id ? 'nuova password' : 'invito' })),
            h('div', { class: 's', text: `${iv.email || 'link da mandare a mano'} · scade tra ${hours} h` })),
          h('div', { class: 'acts' }, copyB,
            h('button', { class: 'icon-btn sm', type: 'button', title: 'Revoca', 'aria-label': 'Revoca invito', html: icon('x', 'sm'),
              onclick: async () => { await api('/api/admin/invites/' + iv.token, undefined, { method: 'DELETE' }); toast('Invito revocato'); reload(); } })));
      }))));
  }

  sections.push(h('section', { class: 'card flush' },
    h('div', { class: 'card-head pad' }, h('h2', {}, 'Persone ', h('span', { class: 'count', text: data.users.length })),
      h('p', { text: 'Accendere e spegnere PC e modelli resta solo agli amministratori.' })),
    h('div', { class: 'people' }, data.users.map((u) => {
      const me = u.username === S.me.user;
      const out = h('div', { class: 'p-out' });
      const acts = h('div', { class: 'acts' });
      if (!me) {
        acts.append(
          h('button', { class: 'icon-btn sm', type: 'button', title: 'Link per una nuova password', 'aria-label': 'Link per una nuova password', html: icon('key', 'sm'),
            onclick: async () => { try { const res = await (await api(`/api/admin/users/${u.id}/reset`, {})).json(); out.replaceChildren(linkBox(res, u.username, u.email)); } catch (e) { toast(e.message); } } }),
          h('button', { class: 'icon-btn sm', type: 'button', title: u.active ? 'Disattiva (non potrà entrare)' : 'Riattiva', 'aria-label': u.active ? 'Disattiva' : 'Riattiva', html: icon(u.active ? 'pause' : 'play', 'sm'),
            onclick: async () => { try { await api(`/api/admin/users/${u.id}`, { active: !u.active }, { method: 'PATCH' }); toast(u.active ? `${u.username} disattivato` : `${u.username} riattivato`); reload(); } catch (e) { toast(e.message); } } }),
          confirmIcon('trash', 'Elimina account e chat', 'Elimina?', async () => { try { await api(`/api/admin/users/${u.id}`, undefined, { method: 'DELETE' }); toast(`${u.username} eliminato`); reload(); } catch (e) { toast(e.message); } }));
      }
      return h('div', { class: 'person' + (u.active ? '' : ' off') }, avatar(u.username),
        h('div', { class: 'who' },
          h('div', { class: 't' }, u.username, me ? h('span', { class: 'badge', text: 'tu' }) : null,
            u.role === 'admin' ? h('span', { class: 'badge admin', text: 'amministratore' }) : null,
            !u.active ? h('span', { class: 'badge off', text: 'disattivato' }) : null),
          h('div', { class: 's' }, [u.email || 'nessuna email', fmtAgo(u.last_login), `${u.chats} ${u.chats === 1 ? 'chat' : 'chat'}`].join(' · '))),
        acts, out);
    }))));
  box.replaceChildren(...sections);
}

// ================================================================== invito
async function showInvite(token) {
  $('#login').classList.add('hidden'); $('#app').classList.add('hidden'); $('#invite').classList.remove('hidden');
  const err = $('#invErr');
  let info;
  try { info = await (await api('/api/invite/' + token)).json(); }
  catch (e) {
    $('#invTitle').textContent = 'Link non valido'; $('#invSub').textContent = e.message;
    $('#invFields').replaceChildren(h('a', { class: 'btn primary', href: '/', text: 'Vai all\'accesso', style: 'text-decoration:none' }));
    return;
  }
  $('#invTitle').textContent = info.reset ? `Ciao ${info.username}` : `Ciao ${info.username}`;
  $('#invSub').textContent = info.reset ? 'Scegline una nuova: dopo entri direttamente, e sugli altri dispositivi dovrai accedere di nuovo.' : 'Ti hanno invitato su Cerini IA. Scegli la tua password per entrare.';
  $('#invUser').value = info.username;
  const art = $('#invite .art-copy h2');
  if (art) art.innerHTML = info.reset ? 'Nuova password.<br>Stesse chat di sempre.' : 'Benvenuto.<br>Manca solo la password.';
  $('#invBtn').textContent = info.reset ? 'Salva e entra' : 'Entra';
  setTimeout(() => $('#ip1').focus(), 50);
  $('#inviteForm').onsubmit = async (e) => {
    e.preventDefault(); err.textContent = '';
    const p1 = $('#ip1').value, p2 = $('#ip2').value;
    if (p1.length < 10) { err.textContent = 'La password deve avere almeno 10 caratteri.'; return; }
    if (p1 !== p2) { err.textContent = 'Le due password non coincidono.'; return; }
    $('#invBtn').disabled = true;
    try { await api('/api/invite/' + token, { password: p1 }); history.replaceState(null, '', '/'); showApp(); }
    catch (ex) { err.textContent = ex.message; $('#invBtn').disabled = false; }
  };
}

// =============================================================== shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') { e.preventDefault(); newChat(); }
  if (e.key === 'Escape') {
    if (Rec.rec) { stopRec(true); return; }
    if (Voice.on) { voiceStop(); return; }
    if (!$('#picker').classList.contains('hidden')) togglePicker(false);
    else if ($('#main').classList.contains('settings-open')) closeSettings();
    else if ($('#main').classList.contains('memory-open')) closeMemory();
    else if (S.stream) S.stream.controller.abort();
    closeSide();
  }
});

// ==================================================================== start
const inviteMatch = location.pathname.match(/^\/invito\/([\w-]+)$/);
if (inviteMatch) showInvite(inviteMatch[1]);
else fetch('/api/me').then((r) => (r.ok ? showApp() : showLogin())).catch(showLogin);
// Le librerie markdown arrivano "defer": quando sono pronte ridisegno la chat aperta
window.addEventListener('load', () => { if (!$('#app').classList.contains('hidden')) renderThread(); });
