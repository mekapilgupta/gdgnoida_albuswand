// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	
	// Environment Variables
	interface ImportMetaEnv {
		readonly VITE_AQICN_TOKEN: string;
		readonly VITE_OPENROUTER_API_KEY: string;
	}
	
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

// AQI Data Types
export interface Station {
	id: string;
	name: string;
	lat: number;
	lng: number;
	aqi?: number | null;
	pm25?: number | null;
	pm10?: number | null;
	level?: AQILevel | null;
	error?: string | null;
	lastUpdated?: Date;
	rawData?: any;
}

export interface AQILevel {
	min: number;
	max: number;
	label: string;
	color: string;
}

export interface AQIData {
	stations: Station[];
	loading: boolean;
	error: string | null;
	lastUpdated: Date | null;
}

export interface DelhiOverview {
	averageAQI: number;
	worstStation: Station;
	totalStations: number;
}

export {};
