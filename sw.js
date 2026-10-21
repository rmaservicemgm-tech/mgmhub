// ─── MGM HUB SERVICE WORKER ──────────────────────────────────────────────────
// Estrategia: Network First + Cache como respaldo offline.
// Cambiar CACHE_VERSION fuerza actualización inmediata en todos los clientes.
const CACHE_VERSION = 39;
const CACHE_NAME    = `mgm-toolbox-v${CACHE_VERSION}`;

// Archivos a pre-cachear (para funcionalidad offline básica)
const SHELL_ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './logo-mgm-watermark.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './notification-badge.png'
];

// ── INSTALL: pre-cachear shell de la app ─────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_ASSETS.map(url =>
        new Request(url, { cache: 'reload' }) // Siempre de la red, sin caché HTTP
      ));
    })
  );
  // Activar inmediatamente sin esperar que cierren tabs anteriores
  self.skipWaiting();
});

// ── ACTIVATE: eliminar cachés viejas + tomar control inmediato ───────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.indexOf('mgm-toolbox-') === 0 && k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Eliminando caché viejo:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim()) // Controlar páginas ya abiertas
  );
});

// ── FETCH: Estrategias según el tipo de recurso ─────────────────────────────
self.addEventListener('fetch', event => {
  // Solo GET
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCDN = url.origin.includes('cdnjs.cloudflare.com') ||
                url.origin.includes('fonts.googleapis.com') ||
                url.origin.includes('fonts.gstatic.com') ||
                url.origin.includes('cdn.jsdelivr.net') ||
                url.origin.includes('unpkg.com');
  
  // Para APIs externas (Google Scripts, WhatsApp, Odoo, etc.) dejar pasar (sin SW cache)
  if (!isLocal && !isCDN) return;

  // 1. CDNs y Fuentes: Estrategia CACHE FIRST (Archivos estáticos que no cambian)
  if (isCDN) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then(networkResponse => {
          // Guardar en caché si es válido (soporta 'cors' para fuentes de Google)
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => {
          // Ignorar error si no hay red, aunque la fuente/script no cargará si no estaba en caché
        });
      })
    );
    return;
  }

  // 2. Archivos Locales (HTML, CSS, JS): Estrategia NETWORK FIRST (Para tener siempre la última versión)
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' }) // Siempre pedir versión fresca
      .then(response => {
        // Actualizar caché con la nueva versión descargada
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Sin conexión: servir desde caché
        return caches.match(event.request);
      })
  );
});

// ── NOTIFICATION CLICK: abrir enlace externo o enfocar app al pulsar notificación 
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const notificationData = event.notification.data || {};
  const target = String(notificationData.url || notificationData.launchURL || '').trim();
  const appUrl = new URL('./index.html', self.registration.scope);
  let targetUrl = appUrl;

  if (target) {
    try {
      targetUrl = new URL(target, appUrl);
    } catch (error) {
      targetUrl = new URL(appUrl.href);
      targetUrl.searchParams.set('tab', target);
    }

    if (!/^https?:\/\//i.test(target)) {
      const [tab, sub] = target.split(':');
      targetUrl = new URL(appUrl.href);
      targetUrl.searchParams.set('tab', tab);
      if (sub) targetUrl.searchParams.set('sub', sub);
    }
  }

  const appScope = new URL(self.registration.scope);
  const isMgmHubUrl = targetUrl.origin === appScope.origin
    && targetUrl.pathname.indexOf(appScope.pathname) === 0;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (!isMgmHubUrl && target) {
        let finalUrl = targetUrl.href;
        if (!/^https?:\/\//i.test(finalUrl)) finalUrl = `https://${finalUrl}`;
        return clients.openWindow(finalUrl);
      }

      // Navegar la ventana existente a la URL completa para conservar sus parámetros.
      for (const client of clientList) {
        if (client.url && 'focus' in client && 'navigate' in client) {
          return client.navigate(targetUrl.href).then(navigatedClient => {
            return (navigatedClient || client).focus();
          });
        }
      }

      return clients.openWindow(targetUrl.href);
    })
  );
});

// ── MENSAJE: forzar skipWaiting desde la página ──────────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
