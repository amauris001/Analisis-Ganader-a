/* Hacienda El Caoba — service worker
   - Página y datos: primero la red (siempre lo más reciente);
     sin señal, muestra la última versión guardada.
   - Librerías (lib/): primero la copia guardada (no cambian). */
var CACHE = "caoba-movil-v1";

self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.filter(function (k) { return k !== CACHE; })
                               .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.indexOf("/lib/") !== -1) {
    e.respondWith(
      caches.match(req).then(function (r) {
        return r || fetch(req).then(function (resp) {
          var copia = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copia); });
          return resp;
        });
      })
    );
    return;
  }

  e.respondWith(
    fetch(req, { cache: "no-store" }).then(function (resp) {
      var copia = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copia); });
      return resp;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) {
        return r || caches.match("./");
      });
    })
  );
});
