<script>
	import { onMount, onDestroy } from 'svelte';
	import Map from 'ol/Map';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/Tile';
	import OSM from 'ol/source/OSM';
	import { fromLonLat, toLonLat } from 'ol/proj';
	import { Vector as VectorLayer } from 'ol/layer';
	import { Vector as VectorSource } from 'ol/source';
	import { Point } from 'ol/geom';
	import { Feature } from 'ol';
	import { Style, Icon, Text, Fill, Stroke } from 'ol/style';
	
	export let stations = [];
	
	let mapElement;
	let map;
	let vectorLayer;
	
	// Delhi NCR center coordinates
	const DELHI_CENTER = fromLonLat([77.23, 28.61]);
	
	function createMarkerStyle(station) {
		const aqi = station?.aqi;
		const level = station?.level;
		const color = level?.color || '#6c757d';
		
		// Create SVG icon with AQI color
		const svg = `
			<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
				<path d="M15 0C6.7 0 0 6.7 0 15c0 8.3 6.7 15 15 15s15-6.7 15-15C30 6.7 23.3 0 15 0z" fill="${color}"/>
				<path d="M15 25c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" fill="white"/>
				${aqi !== null && aqi !== undefined ? 
					`<text x="15" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${aqi}</text>` : 
					`<text x="15" y="16" text-anchor="middle" font-size="8" fill="${color}">?</text>`}
			</svg>
		`;
		
		return new Style({
			image: new Icon({
				src: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg),
				scale: 1,
				anchor: [0.5, 1]
			}),
			text: new Text({
				text: station.name,
				font: '12px Arial, sans-serif',
				fill: new Fill({ color: '#000' }),
				stroke: new Stroke({ color: '#fff', width: 3 }),
				offsetY: -45,
				textAlign: 'center'
			})
		});
	}
	
	function updateMarkers() {
		if (!vectorLayer) return;
		
		const features = stations.map(station => {
			const feature = new Feature({
				geometry: new Point(fromLonLat([station.lng, station.lat])),
				station: station
			});
			feature.setStyle(createMarkerStyle(station));
			return feature;
		});
		
		vectorLayer.getSource().clear();
		vectorLayer.getSource().addFeatures(features);
	}
	
	onMount(() => {
		console.log('🗺️ AQIMap: Component mounted, stations:', stations);
		console.log('🗺️ AQIMap: Map element:', mapElement);
		
		// Initialize the map
		map = new Map({
			target: mapElement,
			layers: [
				new TileLayer({
					source: new OSM({
						attributions: '© OpenStreetMap contributors'
					})
				})
			],
			view: new View({
				center: DELHI_CENTER,
				zoom: 10,
				minZoom: 9,
				maxZoom: 15
			}),
			controls: []
		});
		
		// Add vector layer for markers
		vectorLayer = new VectorLayer({
			source: new VectorSource()
		});
		
		map.addLayer(vectorLayer);
		
		// Update markers
		updateMarkers();
		
		// Add click interaction
		map.on('click', (event) => {
			const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
			if (feature && feature.get('station')) {
				const station = feature.get('station');
				// You can add custom click behavior here
				console.log('Station clicked:', station);
			}
		});
		
		// Change cursor on hover
		map.on('pointermove', (event) => {
			const pixel = map.getEventPixel(event.originalEvent);
			const hit = map.hasFeatureAtPixel(pixel);
			mapElement.style.cursor = hit ? 'pointer' : '';
		});
		
		// Resize map when container size changes
		const resizeObserver = new ResizeObserver(() => {
			console.log('🗺️ AQIMap: Resize detected, updating map size');
			setTimeout(() => map.updateSize(), 100);
		});
		resizeObserver.observe(mapElement);
		
		console.log('🗺️ AQIMap: Map initialization complete');
		
		return () => {
			console.log('🗺️ AQIMap: Cleaning up map');
			resizeObserver.disconnect();
			if (map) map.setTarget(null);
		};
	});
	
	// Update markers when stations change
	$: if (vectorLayer && stations) {
		updateMarkers();
	}
	
	onDestroy(() => {
		if (map) {
			map.setTarget(null);
			map = null;
		}
	});
</script>

<div class="card h-100">
	<div class="card-header d-flex justify-content-between align-items-center">
		<h5 class="mb-0">🗺️ Delhi NCR Air Quality Map</h5>
		<small class="text-muted">Click markers for details</small>
	</div>
	<div class="card-body p-0">
		<div bind:this={mapElement} class="map-container"></div>
	</div>
</div>

<style>
	.map-container {
		width: 100%;
		height: 400px;
		min-height: 300px;
		position: relative;
		background: #f8f9fa;
	}
	
	:global(.ol-attribution) {
		font-size: 10px;
		background: rgba(255, 255, 255, 0.8);
		padding: 2px 4px;
		border-radius: 2px;
	}
	
	@media (max-width: 768px) {
		.map-container {
			height: 300px;
			min-height: 250px;
		}
	}
</style>