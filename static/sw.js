self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received.');
  console.log(`[Service Worker] Push had this data: "${event.data?.text()}"`);

  const vapidPublicKey = 'BP3WKktdaV4q12_Kgyhqq5Le1jnuz9qziZPudTZY3snEKAk6z8m9DC1Nj9DIxo_Q6wcYqvzO_2lmWMali_POcgg';
  const vapidSubject = 'mailto:yam-petal-ladder@duck.com';

  let data;
  try {
    data = event.data ? event.data.json() : { title: 'AQI Alert', body: 'Air quality update available' };
    console.log('🔔 Service Worker: Push data:', data);
  } catch (error) {
    console.error('🔔 Service Worker: Error parsing push data:', error);
    data = { title: 'AQI Alert', body: 'Air quality update available' };
  }
	
	const { title, body, icon, badge } = data;

	const options = {
		body: body || 'Check the latest air quality data',
		icon: icon || '/favicon.svg',
		badge: badge || '/favicon.svg',
	};

	console.log('🔔 Service Worker: Showing notification with options:', options);
	event.waitUntil(self.registration.showNotification(title || 'AQI Delhi', options));
});

self.addEventListener('notificationclick', (event) => {
	console.log('🔔 Service Worker: Notification clicked');
	event.notification.close();
	
	event.waitUntil(
		clients.matchAll({ type: 'window' }).then((clientList) => {
			for (const client of clientList) {
				if (client.url === '/' && 'focus' in client) {
					return client.focus();
				}
			}
			if (clients.openWindow) {
				return clients.openWindow('/');
			}
		})
	);
});