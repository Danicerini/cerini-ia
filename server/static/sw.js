// Notifiche di Aura: arrivano anche a pagina chiusa; toccandole si apre la sezione «Da Aura».
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Aura', {
    body: d.body || '', tag: d.tag || 'aura', icon: '/static/icons/icon-192.png', badge: '/static/icons/badge-96.png',   // barra di stato: solo la forma, bianca su trasparente
    // vibrazione e "ripeti avviso": Android la mostra a comparsa anche se c'era gia' una notifica con lo stesso tag
    vibrate: [180, 90, 180], renotify: true, timestamp: Date.now(),
    data: { url: d.url || '/?aura=1' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/?aura=1';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
    for (const w of wins) {
      if (new URL(w.url).origin === self.location.origin) { w.postMessage({ type: 'aura-open' }); return w.focus(); }
    }
    return self.clients.openWindow(url);
  }));
});
