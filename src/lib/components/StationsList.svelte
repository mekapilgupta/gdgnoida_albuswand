<script>
	import { sortedStations, AQI_LEVELS } from '../stores/aqiStore.js';
	import { formatTime } from '../api/aqiService.js';
	
	// AQI Legend data
	$: legendItems = AQI_LEVELS;
</script>

<div class="card">
	<div class="card-header">
		<h5 class="mb-0">📊 Stations Overview</h5>
	</div>
	<div class="card-body">
		<!-- Stations List -->
		<div class="mb-4">
			<h6 class="text-muted mb-3">Stations by AQI (Worst First)</h6>
			<div class="stations-list">
				{#each $sortedStations as station (station.id)}
					<div class="station-item d-flex justify-content-between align-items-center p-2 mb-2 rounded">
						<div class="d-flex align-items-center">
							<div class="station-indicator me-2" 
								 style="background-color: {station.level?.color || '#6c757d'}">
							</div>
							<div>
								<div class="station-name">{station.name}</div>
								{#if station.error}
									<small class="text-danger">{station.error}</small>
								{:else if station.aqi !== null && station.aqi !== undefined}
									<small class="text-muted">{station.level?.label || 'Unknown'}</small>
								{:else}
									<small class="text-muted">No data</small>
								{/if}
							</div>
						</div>
						<div class="text-end">
							{#if station.error}
								<span class="badge bg-danger">!</span>
							{:else if station.aqi !== null && station.aqi !== undefined}
								<span class="badge" style="background-color: {station.level?.color}">
									{station.aqi}
								</span>
							{:else}
								<span class="badge bg-secondary">--</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
		
		<!-- AQI Scale Legend -->
		<div class="aqi-legend">
			<h6 class="text-muted mb-3">AQI Scale</h6>
			{#each legendItems as item}
				<div class="legend-item d-flex align-items-center mb-2">
					<div class="legend-color me-2" style="background-color: {item.color}"></div>
					<div class="legend-info">
						<div class="legend-label">{item.label}</div>
						<small class="text-muted">{item.min}-{item.max}</small>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Last Updated -->
		<div class="mt-4 text-center">
			<small class="text-muted">
				🔄 Auto-refreshes every 10 minutes
			</small>
		</div>
	</div>
</div>

<style>
	.stations-list {
		max-height: 300px;
		overflow-y: auto;
	}
	
	.station-item {
		background-color: #f8f9fa;
		transition: background-color 0.2s ease;
		border-left: 3px solid transparent;
	}
	
	.station-item:hover {
		background-color: #e9ecef;
		border-left-color: var(--bs-primary);
	}
	
	.station-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	.station-name {
		font-weight: 500;
		font-size: 0.9rem;
		line-height: 1.2;
	}
	
	.aqi-legend {
		border-top: 1px solid #dee2e6;
		padding-top: 1rem;
	}
	
	.legend-item {
		font-size: 0.85rem;
	}
	
	.legend-color {
		width: 16px;
		height: 16px;
		border-radius: 3px;
		flex-shrink: 0;
	}
	
	.legend-label {
		font-weight: 500;
		line-height: 1.2;
	}
	
	/* Custom scrollbar for stations list */
	.stations-list::-webkit-scrollbar {
		width: 6px;
	}
	
	.stations-list::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 3px;
	}
	
	.stations-list::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 3px;
	}
	
	.stations-list::-webkit-scrollbar-thumb:hover {
		background: #a8a8a8;
	}
	
	@media (max-width: 768px) {
		.stations-list {
			max-height: 200px;
		}
	}
</style>