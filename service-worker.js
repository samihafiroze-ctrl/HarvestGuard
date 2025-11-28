// Service Worker for Offline Support and PWA

const CACHE_NAME = "krishak-sahayak-v1"
const ASSETS_TO_CACHE = ["/", "/index.html", "/styles.css", "/script.js", "/manifest.json"]

// Install event - cache essential files
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching assets")
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Serve from cache if available
      if (response) {
        console.log("[Service Worker] Serving from cache:", event.request.url)
        return response
      }

      // Fallback to network
      return fetch(event.request)
        .then((response) => {
          // Cache new requests
          if (response.ok) {
            const clonedResponse = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse)
            })
          }
          return response
        })
        .catch((error) => {
          console.log("[Service Worker] Fetch failed:", error)
          // Return offline page or default response
          return new Response("অফলাইন মোড সক্রিয়। ডেটা পুনরায় সংযোগ করার পরে লোড হবে।")
        })
    }),
  )
})
