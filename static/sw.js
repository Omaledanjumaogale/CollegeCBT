const CACHE_NAME = 'collegecbt-v2.1';
const ASSETS_TO_CACHE = [
	'/',
	'/favicon.svg',
	'/manifest.json'
];

// 1. Install & Cache Core Manifest
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS_TO_CACHE);
		})
	);
	self.skipWaiting();
});

// 2. Activate & Purge Old Layers
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) return caches.delete(key);
				})
			);
		})
	);
	self.clients.claim();
});

// 3. Network-First for App Logic, Cache-First for Assets
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	
	// Skip Convex and Firebase requests (let them handle their own real-time logic)
	if (url.origin.includes('convex.cloud') || url.origin.includes('googleapis.com')) {
		return;
	}

	event.respondWith(
		fetch(event.request).catch(() => {
			return caches.match(event.request) || caches.match('/');
		})
	);
});

// 4. Real-time Push Notification Gateway
self.addEventListener('push', (event) => {
	const data = event.data?.json() || { 
		title: 'CollegeCBT Signal', 
		body: 'Real-time database sync completed.',
		icon: '/favicon.svg'
	};

	const options = {
		body: data.body,
		icon: data.icon || '/favicon.svg',
		badge: '/favicon.svg',
		vibrate: [100, 50, 100],
		data: {
			url: data.url || '/'
		}
	};

	event.waitUntil(
		self.registration.showNotification(data.title, options)
	);
});

// 5. Notification Interceptor
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		clients.openWindow(event.notification.data.url)
	);
});
