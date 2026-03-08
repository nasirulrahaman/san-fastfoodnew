const CACHE = 'san-fastfood-v1'
const STATIC = [
  '/',
  '/index.html',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)

  // Network first for HTML/JS/CSS
  if (e.request.destination === 'document' ||
      e.request.destination === 'script' ||
      e.request.destination === 'style') {
    e.respondWith(
      fetch(e.request)
        .then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return res })
        .catch(() => caches.match(e.request))
    )
    return
  }

  // Cache first for images
  if (e.request.destination === 'image') {
    e.respondWith(
      caches.match(e.request).then(cached => cached ||
        fetch(e.request).then(res => {
          const c = res.clone()
          caches.open(CACHE).then(ca => ca.put(e.request, c))
          return res
        })
      )
    )
    return
  }

  // Default: network first
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})
