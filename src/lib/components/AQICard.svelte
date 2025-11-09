<script>
	import { formatTime } from '../api/aqiService.js';
	
	export let station;
	
	$: aqi = station?.aqi;
	$: level = station?.level;
	$: pm25 = station?.pm25;
	$: pm10 = station?.pm10;
	$: lastUpdated = station?.lastUpdated;
	$: error = station?.error;
	
	// Calculate circular progress
	$: progress = Math.min((aqi || 0) / 500, 1); // Max AQI is 500
	$: circumference = 2 * Math.PI * 45; // radius = 45
	$: strokeDashoffset = circumference * (1 - progress);
	
	// Get AQI level details
	$: levelLabel = level?.label || 'No Data';
	$: levelColor = level?.color || '#6c757d';
	
	function getPMLevel(value, type) {
		if (value === null || value === undefined) return 'No Data';
		
		const levels = type === 'pm25' 
			? [{ max: 12, label: 'Good' }, { max: 35, label: 'Moderate' }, { max: 55, label: 'Unhealthy for Sensitive' }, { max: 150, label: 'Unhealthy' }, { max: 250, label: 'Very Unhealthy' }, { max: Infinity, label: 'Hazardous' }]
			: [{ max: 50, label: 'Good' }, { max: 150, label: 'Moderate' }, { max: 250, label: 'Unhealthy for Sensitive' }, { max: 350, label: 'Unhealthy' }, { max: 430, label: 'Very Unhealthy' }, { max: Infinity, label: 'Hazardous' }];
		
		return levels.find(l => value <= l.max)?.label || 'Hazardous';
	}
</script>

<div class="col-md-6 col-lg-4 mb-4">
	<div class="card h-100 aqi-card {error ? 'border-danger' : ''}" 
	     style="--level-color: {levelColor}">
		<div class="card-body">
			<div class="d-flex justify-content-between align-items-start mb-3">
				<h5 class="card-title mb-0">{station.name}</h5>
				{#if error}
					<span class="badge bg-danger">Error</span>
				{:else if aqi !== null && aqi !== undefined}
					<span class="badge" style="background-color: {levelColor}">{aqi}</span>
				{:else}
					<span class="badge bg-secondary">No Data</span>
				{/if}
			</div>
			
			<!-- Circular AQI Indicator -->
			<div class="text-center mb-3">
				<div class="position-relative d-inline-block">
					<svg width="100" height="100" class="aqi-circle">
						<circle cx="50" cy="50" r="45" stroke="#e9ecef" stroke-width="8" fill="none"/>
						<circle cx="50" cy="50" r="45" 
								stroke="{levelColor}" 
								stroke-width="8" 
								fill="none"
								stroke-dasharray="{circumference}"
								stroke-dashoffset="{strokeDashoffset}"
								stroke-linecap="round"
								class="progress-circle"/>
					</svg>
					<div class="position-absolute top-50 start-50 translate-middle text-center">
						{#if error}
							<div class="text-muted small">Error</div>
						{:else if aqi !== null && aqi !== undefined}
							<div class="h4 mb-0">{aqi}</div>
							<div class="small text-muted">AQI</div>
						{:else}
							<div class="h6 mb-0">No Data</div>
						{/if}
					</div>
				</div>
				<div class="mt-2">
					<span class="badge" style="background-color: {levelColor}">{levelLabel}</span>
				</div>
			</div>
			
			<!-- PM2.5 and PM10 Values -->
			{#if !error}
				<div class="row mb-3">
					<div class="col-6">
						<div class="text-center">
							<div class="h6 mb-0">{pm25 !== null && pm25 !== undefined ? pm25 : '--'}</div>
							<div class="small text-muted">PM2.5</div>
							<div class="tiny-text">{getPMLevel(pm25, 'pm25')}</div>
						</div>
					</div>
					<div class="col-6">
						<div class="text-center">
							<div class="h6 mb-0">{pm10 !== null && pm10 !== undefined ? pm10 : '--'}</div>
							<div class="small text-muted">PM10</div>
							<div class="tiny-text">{getPMLevel(pm10, 'pm10')}</div>
						</div>
					</div>
				</div>
				
				<!-- Progress Bar -->
				<div class="mb-2">
					<div class="d-flex justify-content-between small text-muted mb-1">
						<span>AQI Scale</span>
						<span>{aqi || 0}/500</span>
					</div>
					<div class="progress" style="height: 6px;">
						<div class="progress-bar" 
							 role="progressbar" 
							 style="width: {Math.min((aqi || 0) / 5, 100)}%; background-color: {levelColor}"
							 aria-valuenow="{aqi || 0}"
							 aria-valuemin="0"
							 aria-valuemax="500">
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Last Updated -->
			<div class="text-center">
				<small class="text-muted">
					Updated: {formatTime(lastUpdated)}
				</small>
			</div>
		</div>
	</div>
</div>

<style>
	.aqi-card {
		transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
		border: 1px solid rgba(0,0,0,0.125);
		border-left: 4px solid var(--level-color);
	}
	
	.aqi-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
	}
	
	.progress-circle {
		transition: stroke-dashoffset 0.5s ease-in-out;
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
	}
	
	.tiny-text {
		font-size: 0.7rem;
		line-height: 1;
	}
	
	:global(.progress-bar) {
		transition: width 0.6s ease;
	}
</style>