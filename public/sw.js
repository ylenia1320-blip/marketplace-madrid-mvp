// Service worker mínimo — solo necesario para que el navegador
// considere la web "instalable" como PWA. No cachea nada crítico.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Passthrough: deja pasar todas las peticiones tal cual (sin caché offline por ahora)
  event.respondWith(fetch(event.request));
});
