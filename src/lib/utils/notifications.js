const VAPID_PUBLIC_KEY = 'BP3WKktdaV4q12_Kgyhqq5Le1jnuz9qziZPudTZY3snEKAk6z8m9DC1Nj9DIxo_Q6wcYqvzO_2lmWMali_POcgg';
const VAPID_SUBJECT = 'mailto:yam-petal-ladder@duck.com';

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export async function subscribeToPush() {
	console.log('🔔 Notification Service: Starting subscription process...');
	
	if (!('serviceWorker' in navigator)) {
		console.log('🔔 Notification Service: Service Worker not supported');
		throw new Error('Service Worker not supported');
	}
	
	if (!('PushManager' in window)) {
		console.log('🔔 Notification Service: Push Manager not supported');
		throw new Error('Push Manager not supported');
	}
	
	console.log('🔔 Notification Service: Requesting notification permission...');
	const permission = await Notification.requestPermission();
	console.log('🔔 Notification Service: Permission result:', permission);
	
	if (permission !== 'granted') {
		console.log('🔔 Notification Service: Permission denied');
		throw new Error('Notification permission denied');
	}
	
	console.log('🔔 Notification Service: Getting service worker registration...');
	const registration = await navigator.serviceWorker.ready;
	console.log('🔔 Notification Service: Service worker ready');
	
	console.log('🔔 Notification Service: Checking existing subscription...');
	let subscription = await registration.pushManager.getSubscription();
	console.log('🔔 Notification Service: Existing subscription:', subscription);
	
	if (!subscription) {
		console.log('🔔 Notification Service: Creating new subscription...');
		try {
			subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
			console.log('🔔 Notification Service: New subscription created:', subscription);
		} catch (error) {
			console.error('🔔 Notification Service: Subscription failed:', error);
			throw error;
		}
	}
	
	console.log('🔔 Notification Service: Subscription successful');
	return subscription;
}

export function showNotification(title, options) {
	console.log('🔔 Notification Service: Showing notification:', title, options);
	
	if (Notification.permission !== 'granted') {
		console.log('🔔 Notification Service: Cannot show notification - permission not granted');
		return;
	}
	
	navigator.serviceWorker.ready.then(registration => {
		console.log('🔔 Notification Service: Service worker ready, showing notification');
		registration.showNotification(title, options);
	}).catch(error => {
		console.error('🔔 Notification Service: Error showing notification:', error);
	});
}

export function requestNotificationPermission() {
	console.log('🔔 Notification Service: Requesting permission...');
	return Notification.requestPermission().then(permission => {
		console.log('🔔 Notification Service: Permission result:', permission);
		return permission;
	});
}