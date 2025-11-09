import { aqiStore, DELHI_STATIONS, AQI_LEVELS } from '../stores/aqiStore.js';

const API_BASE_URL = 'https://api.waqi.info/feed';
//const API_TOKEN = import.meta.env.VITE_AQICN_TOKEN;
const API_TOKEN = '5b4d4918fac7f386f50c464f41538f7bc8cd3831';


// Helper function to get AQI level and color
function getAQILevel(aqi) {
	if (aqi === null || aqi === undefined) return null;
	
	const level = AQI_LEVELS.find(l => aqi >= l.min && aqi <= l.max);
	return level || AQI_LEVELS[AQI_LEVELS.length - 1]; // Return hazardous if beyond range
}

// Fetch data for a single station
async function fetchStationData(station) {
	console.log(`🌍 AQI Service: Fetching data for station: ${station.name} (${station.id})`);
	
	try {
		const url = `${API_BASE_URL}/${station.id}/?token=${API_TOKEN}`;
		console.log(`🌍 AQI Service: Making API call to: ${url}`);
		
		const response = await fetch(url);
		console.log(`🌍 AQI Service: Response status for ${station.name}:`, response.status);
		
		const data = await response.json();
		console.log(`🌍 AQI Service: Raw response for ${station.name}:`, data);
		
		if (data.status === 'error') {
			console.warn(`🌍 AQI Service: Error fetching data for ${station.name}:`, data.data);
			return {
				...station,
				aqi: null,
				pm25: null,
				pm10: null,
				level: null,
				error: data.data || 'Unknown error',
				lastUpdated: new Date()
			};
		}
		
		if (data.status === 'ok' && data.data) {
			const aqi = data.data.aqi;
			const iaqi = data.data.iaqi || {};
			
			console.log(`🌍 AQI Service: Parsed data for ${station.name}:`, {
				aqi,
				pm25: iaqi.pm25?.v,
				pm10: iaqi.pm10?.v,
				level: getAQILevel(aqi)
			});
			
			return {
				...station,
				aqi: typeof aqi === 'number' ? aqi : null,
				pm25: iaqi.pm25?.v || null,
				pm10: iaqi.pm10?.v || null,
				level: getAQILevel(aqi),
				error: null,
				lastUpdated: new Date(),
				rawData: data.data
			};
		}
		
		console.warn(`🌍 AQI Service: Invalid response format for ${station.name}`);
		return {
			...station,
			aqi: null,
			pm25: null,
			pm10: null,
			level: null,
			error: 'Invalid response format',
			lastUpdated: new Date()
		};
		
	} catch (error) {
		console.error(`🌍 AQI Service: Network error for ${station.name}:`, error);
		return {
			...station,
			aqi: null,
			pm25: null,
			pm10: null,
			level: null,
			error: 'Network error',
			lastUpdated: new Date()
		};
	}
}

// Fetch data for all Delhi stations
export async function fetchAllStations() {
	console.log('🌍 AQI Service: fetchAllStations called');
	
	if (!API_TOKEN || API_TOKEN === 'your_token') {
		console.error('🌍 AQI Service: API token not configured');
		aqiStore.setError('Please set your AQICN API token in .env file');
		return;
	}
	
	console.log('🌍 AQI Service: Starting to fetch all stations...');
	console.log('🌍 AQI Service: Number of stations to fetch:', DELHI_STATIONS.length);
	console.log('🌍 AQI Service: Station IDs:', DELHI_STATIONS.map(s => s.id));
	
	aqiStore.setLoading(true);
	
	try {
		// Fetch all stations in parallel
		console.log('🌍 AQI Service: Creating station promises...');
		const stationPromises = DELHI_STATIONS.map(station => fetchStationData(station));
		
		console.log('🌍 AQI Service: Waiting for all stations to complete...');
		const stationsData = await Promise.all(stationPromises);
		
		console.log('🌍 AQI Service: All stations fetched successfully');
		console.log('🌍 AQI Service: Number of stations with data:', stationsData.filter(s => s.aqi !== null).length);
		console.log('🌍 AQI Service: Number of stations with errors:', stationsData.filter(s => s.error !== null).length);
		
		aqiStore.setStations(stationsData);
		console.log('🌍 AQI Service: Store updated with station data');
		
	} catch (error) {
		console.error('🌍 AQI Service: Error fetching stations data:', error);
		aqiStore.setError('Failed to fetch air quality data');
	}
}

// Auto-refresh functionality
let refreshInterval;

export function startAutoRefresh(intervalMinutes = 10) {
	stopAutoRefresh(); // Clear any existing interval
	
	// Fetch immediately
	fetchAllStations();
	
	// Set up interval
	refreshInterval = setInterval(() => {
		fetchAllStations();
	}, intervalMinutes * 60 * 1000);
}

export function stopAutoRefresh() {
	if (refreshInterval) {
		clearInterval(refreshInterval);
		refreshInterval = null;
	}
}

// Format time for display
export function formatTime(date) {
	if (!date) return 'Never';
	
	const now = new Date();
	const diff = now - date;
	const minutes = Math.floor(diff / 60000);
	
	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes}m ago`;
	
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	
	return date.toLocaleTimeString('en-IN', { 
		hour: '2-digit', 
		minute: '2-digit' 
	});
}