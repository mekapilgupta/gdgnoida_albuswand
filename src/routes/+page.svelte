<script>
	import { onMount, onDestroy } from 'svelte';
	import { Container, Row, Col, Alert, Spinner } from 'sveltestrap';

	import { aqiStore, delhiOverview } from '../lib/stores/aqiStore.js';
	import { fetchAllStations, startAutoRefresh, stopAutoRefresh } from '../lib/api/aqiService.js';
	import { subscribeToPush, showNotification } from '../lib/utils/notifications.js';

	import AQICard from '../lib/components/AQICard.svelte';
	import AQIMap from '../lib/components/AQIMap.svelte';
	import StationsList from '../lib/components/StationsList.svelte';
	import LLMInsights from '../lib/components/LLMInsights.svelte';

	let isLoading = true;
	let error = null;

	// Subscribe to store
	$: ({ stations, loading, error: storeError } = $aqiStore);
	$: ({ averageAQI, worstStation, totalStations } = $delhiOverview || {});

	// Check AQI and notify if unhealthy
	$: if ($delhiOverview && !loading) {
		checkAndNotify($delhiOverview.averageAQI);
	}

	onMount(async () => {
		console.log('📱 Main Page: Component mounted, starting data fetch...');
		
		try {
			// Fetch initial data
			console.log('📱 Main Page: Fetching station data...');
			await fetchAllStations();
			console.log('📱 Main Page: Station data fetched successfully');
			console.log('📱 Main Page: Number of stations received:', $aqiStore.stations?.length || 0);
			
			// Start auto-refresh (10 minutes)
			console.log('📱 Main Page: Starting auto-refresh');
			startAutoRefresh(10);
			
		} catch (error) {
			console.error('📱 Main Page: Error during initialization:', error);
			error = 'Failed to load initial data';
		} finally {
			isLoading = false;
			console.log('📱 Main Page: Initialization complete, loading state set to false');
		}
	});

	onDestroy(() => {
		stopAutoRefresh();
	});

	function handleRefresh() {
		fetchAllStations();
	}

	async function handleSubscribe() {
		console.log('📱 Main Page: Subscribe button clicked');
		
		try {
			console.log('📱 Main Page: Checking notification permission...');
			const permission = await Notification.requestPermission();
			console.log('📱 Main Page: Permission result:', permission);
			
			if (permission === 'denied') {
				alert('❌ Notifications are blocked. Please enable them in your browser settings.');
				return;
			}
			
			if (permission === 'default') {
				alert('ℹ️ Please allow notifications when prompted to subscribe.');
				return;
			}
			
			console.log('📱 Main Page: Subscribing to push notifications...');
			await subscribeToPush();
			console.log('📱 Main Page: Subscription successful');
			
			// Show success notification
			showNotification('✅ Subscribed!', {
				body: 'You will now receive AQI alerts for Delhi.',
				icon: '/favicon.svg',
				badge: '/favicon.svg'
			});
			
			alert('✅ You have successfully subscribed to AQI alerts!');
			
			// Schedule a test notification after 1 minute
			console.log('📱 Main Page: Scheduling test notification in 1 minute...');
			setTimeout(() => {
				console.log('📱 Main Page: Sending test notification');
				showNotification('🧪 Test AQI Alert', {
					body: 'This is a test notification from Saaf Hawa. Your subscription is working!',
					icon: '/favicon.svg',
					badge: '/favicon.svg'
				});
			}, 60000); // 1 minute
			
		} catch (err) {
			console.error('📱 Main Page: Failed to subscribe to push notifications:', err);
			alert(`❌ Failed to subscribe: ${err.message}. Please try again.`);
		}
	}

	function checkAndNotify(aqi) {
		// Notify if AQI is Unhealthy (>= 151)
		if (aqi >= 151) {
			const title = '😷 Unhealthy Air Quality Alert!';
			const options = {
				body: `The average AQI in Delhi is now ${aqi}, which is considered unhealthy. Try to stay indoors.`,
				icon: '/favicon.svg',
				badge: '/favicon.svg'
			};
			showNotification(title, options);
		}
	}
</script>

<svelte:head>
	<title>Saaf Hawa - Delhi AQI Dashboard</title>
	<meta name="description" content="Real-time air quality monitoring for Delhi NCR - Breathe Smart, Live Safe" />
</svelte:head>

<!-- Header -->
<header class="app-header">
	<Container>
		<div class="app-title">🌬️ Saaf Hawa</div>
		<div class="app-tagline">Breathe Smart, Live Safe</div>
		<div class="mt-3">
			{#if !loading && delhiOverview}
				<div class="d-flex justify-content-center align-items-center gap-4 flex-wrap">
					<div class="text-center">
						<div class="h5 mb-0">{averageAQI || '--'}</div>
						<small>Average AQI</small>
					</div>
					<div class="text-center">
						<div class="h5 mb-0">{worstStation?.aqi || '--'}</div>
						<small>Worst Station</small>
					</div>
					<div class="text-center">
						<div class="h5 mb-0">{totalStations || '0'}</div>
						<small>Active Stations</small>
					</div>
				</div>
			{/if}
		</div>
	</Container>
</header>

<!-- Main Dashboard -->
<div class="main-container">
	<div class="dashboard-content">
		{#if error}
			<Alert color="danger" class="mb-4">
				<strong>⚠️ Error:</strong> {error}
				<button class="btn btn-sm btn-outline-danger ms-2" on:click={handleRefresh}>
					Retry
				</button>
			</Alert>
		{/if}
		
		{#if loading}
			<div class="text-center py-5">
				<Spinner color="primary" />
				<p class="mt-3 text-muted">Loading air quality data...</p>
			</div>
		{:else}
			<Row>
				<!-- Main Content Area -->
				<Col lg={8}>
					<!-- Map Section -->
					<div class="mb-4">
						<AQIMap stations={stations} />
					</div>

					<!-- Subscription Button -->
					<div class="mb-4 text-center">
						<button class="btn btn-primary" on:click={handleSubscribe}>
							Subscribe to AQI Alerts
						</button>
					</div>

					<!-- LLM Insights Section -->
					<div class="mb-4">
						<LLMInsights aqiData={$delhiOverview} />
					</div>
					
					<!-- Station Cards Grid -->
					<div class="mb-4">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<h4 class="mb-0">📍 Station Details</h4>
							<button class="btn btn-outline-primary btn-sm" on:click={handleRefresh}>
								🔄 Refresh
							</button>
						</div>
						<Row>
							{#each stations as station (station.id)}
								<AQICard {station} />
							{/each}
						</Row>
					</div>
				</Col>
				
				<!-- Sidebar -->
				<Col lg={4}>
					<div class="sticky-top" style="top: 20px;">
						<StationsList />
					</div>
				</Col>
			</Row>
		{/if}
	</div>
	
	<!-- Footer -->
	<footer class="app-footer">
		<Container>
			<div class="footer-content">
				<div class="mb-2">
					🇮🇳 Made in India, For India
				</div>
				<div class="footer-links">
					<small>
						Data provided by <a href="https://waqi.info/" target="_blank" rel="noopener noreferrer">World Air Quality Index Project</a>
						•
						<a href="https://aqicn.org/api/" target="_blank" rel="noopener noreferrer">AQICN API</a>
					</small>
				</div>
				<div class="mt-2">
					<small class="text-muted">
						Last updated: {$aqiStore.lastUpdated ? $aqiStore.lastUpdated.toLocaleString('en-IN') : 'Never'}
					</small>
				</div>
			</div>
		</Container>
	</footer>
</div>

<style>
	/* Additional component-specific styles */
	.sticky-top {
		z-index: 1020;
	}
	
	@media (max-width: 991px) {
		.sticky-top {
			position: relative !important;
			top: auto !important;
		}
	}
</style>
