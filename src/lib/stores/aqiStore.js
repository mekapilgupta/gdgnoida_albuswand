import { writable, derived } from 'svelte/store';

// AQI stations configuration for Delhi NCR
export const DELHI_STATIONS = [
	{ id: '@2553', name: 'Anand Vihar', lat: 28.652, lng: 77.315 },
	{ id: '@3715', name: 'ITO', lat: 28.632, lng: 77.236 },
	{ id: 'A567703', name: 'Rohini', lat: 28.747, lng: 77.107 },
	{ id: 'A567682', name: 'R K Puram', lat: 28.556, lng: 77.176 },
	{ id: 'A143896', name: 'Delhi Cantt', lat: 28.594, lng: 77.165 }
];

// AQI color mapping based on EPA standards
export const AQI_COLORS = {
	good: '#00E400',
	moderate: '#FFFF00',
	unhealthyForSensitive: '#FF7E00',
	unhealthy: '#FF0000',
	veryUnhealthy: '#8F3F97',
	hazardous: '#7E0023'
};

// AQI level definitions
export const AQI_LEVELS = [
	{ min: 0, max: 50, label: 'Good', color: AQI_COLORS.good },
	{ min: 51, max: 100, label: 'Moderate', color: AQI_COLORS.moderate },
	{ min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', color: AQI_COLORS.unhealthyForSensitive },
	{ min: 151, max: 200, label: 'Unhealthy', color: AQI_COLORS.unhealthy },
	{ min: 201, max: 300, label: 'Very Unhealthy', color: AQI_COLORS.veryUnhealthy },
	{ min: 301, max: 500, label: 'Hazardous', color: AQI_COLORS.hazardous }
];

// Main store for AQI data
function createAQIStore() {
	const { subscribe, set, update } = writable({
		stations: [],
		loading: true,
		error: null,
		lastUpdated: null
	});

	return {
		subscribe,
		set,
		update,
		setLoading: (loading) => update(state => ({ ...state, loading })),
		setError: (error) => update(state => ({ ...state, error, loading: false })),
		setStations: (stations) => update(state => ({ 
			...state, 
			stations, 
			loading: false, 
			error: null,
			lastUpdated: new Date()
		})),
		reset: () => set({
			stations: [],
			loading: true,
			error: null,
			lastUpdated: null
		})
	};
}

export const aqiStore = createAQIStore();

// Derived store for sorted stations (worst AQI first)
export const sortedStations = derived(aqiStore, $aqiStore => {
	return [...$aqiStore.stations].sort((a, b) => (b.aqi || 0) - (a.aqi || 0));
});

// Derived store for overall Delhi AQI
export const delhiOverview = derived(aqiStore, $aqiStore => {
	if ($aqiStore.stations.length === 0) return null;
	
	const validStations = $aqiStore.stations.filter(s => s.aqi !== null && s.aqi !== undefined);
	if (validStations.length === 0) return null;
	
	const avgAQI = Math.round(validStations.reduce((sum, s) => sum + s.aqi, 0) / validStations.length);
	const worstStation = validStations.reduce((worst, current) => 
		current.aqi > worst.aqi ? current : worst
	);
	
	return {
		averageAQI: avgAQI,
		worstStation: worstStation,
		totalStations: validStations.length
	};
});