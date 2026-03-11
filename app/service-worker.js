// Service Worker for SpoonUp PWA
const CACHE_NAME = 'spoonup-v3'; // v3: Nach DISTINCT Migration + iOS Safe Area Fixes
const CHANGELOG_CACHE = 'spoonup-changelog-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo192.png',
  '/logo512.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap',
];

// Use a more specific cache key for the current domain
const getCacheKey = (url) => {
  try {
    const { pathname } = new URL(url);
    // Remove the base path for GitHub Pages if present
    return pathname.startsWith('/spoonup/') ? pathname.substring(8) : pathname;
  } catch (e) {
    return url;
  }
};

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll([
          ...ASSETS_TO_CACHE,
          '/offline.html'  // Add offline page to cache
        ]);
      })
  );
  
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, CHANGELOG_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// NetworkFirst strategy for changelog.md
async function handleChangelogRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the fresh response
      const cache = await caches.open(CHANGELOG_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for changelog, trying cache');
  }
  
  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return error response if no cache available
  return new Response('Changelog not available offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Special handling for changelog.md - NetworkFirst strategy
  if (event.request.url.includes('/changelog.md')) {
    event.respondWith(handleChangelogRequest(event.request));
    return;
  }

  event.respondWith(
    caches.match(getCacheKey(event.request.url)).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(getCacheKey(event.request.url), responseToCache);
        });

        return response;
      }).catch(() => {
        // If fetch fails and this is a navigation request, return the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        return new Response('You are offline and the requested resource is not available in the cache.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('Received SKIP_WAITING message, activating new service worker');
    self.skipWaiting();
  }
});

// Push notification listener
self.addEventListener('push', (event) => {
  let data = {};
  try { 
    data = event.data?.json() || {}; 
  } catch (e) {
    console.log('Push data parsing failed:', e);
  }
  
  const title = data.title || 'SpoonUp Neuigkeiten';
  const icon = new URL('icons/icon-192x192.png', self.registration.scope).toString();
  const deeplink = data.url 
    ? new URL(data.url, self.registration.scope).toString()
    : new URL('changelog', self.registration.scope).toString();
  
  const options = {
    body: data.body || 'Neue Updates verfügbar',
    icon: icon,
    badge: icon,
    data: { url: deeplink },
    tag: 'spoonup-update',
    requireInteraction: false
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = clientsList.find(c => c.url.startsWith(self.registration.scope));
    
    if (client) { 
      await client.focus(); 
      try { 
        // Navigate to the target URL if possible
        if (client.navigate) {
          await client.navigate(url);
        }
      } catch (e) {
        console.log('Navigation failed:', e);
      }
      return; 
    }
    
    // Open new window if no existing client
    await clients.openWindow(new URL(url, self.registration.scope).toString());
  })());
});

// Handle app installation
self.addEventListener('beforeinstallprompt', (event) => {
  // Prevent the default prompt
  event.preventDefault();
  // Stash the event so it can be triggered later
  self.deferredPrompt = event;
  // Optionally show your own UI to prompt the user to install the PWA
  console.log('PWA installation available');
});
