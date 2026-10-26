
const STORAGE_KEY = "yahtzee-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(STORAGE_KEY).then(async cache => {
            await Promise.all(
                APP_FILES.map(async file => {
                    const response = await fetch(file, {
                        cache: "reload"
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to cache ${file}`);
                    }

                    await cache.put(file, response);
                })
            );

            await self.skipWaiting();
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const copy = response.clone();

                    caches.open(STORAGE_KEY).then(cache => {
                        cache.put(event.request, copy);
                    });
                }

                return response;
            })
            .catch(async () => {
                const cached = await caches.match(event.request);

                if (cached) return cached;

                throw new Error("Resource unavailable offline");
            })
    );
});
