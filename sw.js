self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(STORAGE_KEY).then(c =>
            c.addAll([
                "./index.html",
                "./style.css",
                "./app.js",
                "./manifest.json",
                "./icon-192.png",
                "./icon-512.png"
           ])
        )
    );
});

self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== STORAGE_KEY)
                    .map(key => caches.delete(key))
            )
        )
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(
            r => r || fetch(e.request)
        )
    );
});
