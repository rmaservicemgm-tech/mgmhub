// ─── MGM HUB SERVICE WORKER ──────────────────────────────────────────────────
// Estrategia: Network First + Cache como respaldo offline.
// Cambiar CACHE_VERSION fuerza actualización inmediata en todos los clientes.
const CACHE_VERSION = 49;
const CACHE_NAME    = `mgm-toolbox-v${CACHE_VERSION}`;
const HOME_IMAGE_CACHE = 'mgm-home-images-v1';
const HOME_IMAGE_META_CACHE = 'mgm-home-images-meta-v1';
const HOME_IMAGE_CACHE_LIMIT = 80;
const HOME_IMAGE_ALLOWLIST_KEY = new URL('__mgm_cache__/home-image-allowlist', self.registration.scope).href;
const homeImageAllowlist = new Set();

// Archivos a pre-cachear (para funcionalidad offline básica)
const SHELL_ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './theme-manager.js',
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
          .filter(k =>
            (
              k.indexOf('mgm-theme-beta-') === 0 &&
              k !== HOME_IMAGE_CACHE &&
              k !== HOME_IMAGE_META_CACHE
            ) ||
            (
              k.indexOf('mgm-toolbox-') === 0 &&
              k !== CACHE_NAME
            )
          )
          .map(k => {
            console.log('[SW] Eliminando caché viejo:', k);
            return caches.delete(k);
          })
      )
    ).then(async () => {
      try {
        const metadata = await caches.open(HOME_IMAGE_META_CACHE);
        const saved = await metadata.match(HOME_IMAGE_ALLOWLIST_KEY);
        if (saved) {
          const urls = await saved.json();
          if (Array.isArray(urls)) urls.forEach(url => homeImageAllowlist.add(url));
        }
      } catch (error) {
        console.warn('[SW] No se pudo restaurar la lista de imágenes del inicio:', error);
      }
      await self.clients.claim();
    }) // Controlar páginas ya abiertas
  );
});

self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'CACHE_HOME_IMAGES') return;

  const urls = Array.isArray(event.data.urls)
    ? event.data.urls.slice(0, 200).filter(value => {
        try {
          const url = new URL(value);
          return /^https?:$/.test(url.protocol) && url.origin !== self.location.origin;
        } catch (error) {
          return false;
        }
      })
    : [];
  urls.forEach(url => homeImageAllowlist.add(url));
  while (homeImageAllowlist.size > 200) {
    homeImageAllowlist.delete(homeImageAllowlist.values().next().value);
  }

  event.waitUntil((async () => {
    try {
      const metadata = await caches.open(HOME_IMAGE_META_CACHE);
      await metadata.put(HOME_IMAGE_ALLOWLIST_KEY, new Response(JSON.stringify([...homeImageAllowlist])));
    } catch (error) {
      console.warn('[SW] No se pudo guardar la lista de imágenes del inicio:', error);
    }
    if (event.ports && event.ports[0]) event.ports[0].postMessage({ type: 'HOME_IMAGES_REGISTERED' });
  })());
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

  if (!isLocal && event.request.destination === 'image' && homeImageAllowlist.has(event.request.url)) {
    const refreshImage = caches.open(HOME_IMAGE_CACHE).then(async cache => {
      const response = await fetch(event.request, { cache: 'no-cache' });
      if (response && (response.status === 200 || response.type === 'opaque')) {
        try {
          await cache.put(event.request, response.clone());
          const keys = await cache.keys();
          const excess = keys.length - HOME_IMAGE_CACHE_LIMIT;
          if (excess > 0) {
            await Promise.all(keys.slice(0, excess).map(key => cache.delete(key)));
          }
        } catch (error) {
          console.warn('[SW] No se pudo actualizar la caché de una imagen del inicio:', error);
        }
      }
      return response;
    });

    event.waitUntil(refreshImage.catch(error => {
      console.warn('[SW] No se pudo actualizar una imagen del inicio:', error);
    }));
    event.respondWith(
      caches.open(HOME_IMAGE_CACHE)
        .then(cache => cache.match(event.request))
        .then(cached => cached || refreshImage)
    );
    return;
  }
  
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
