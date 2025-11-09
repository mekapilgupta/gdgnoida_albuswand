<script>
	import { onMount } from 'svelte';
	import { getAqiInsights } from '../api/llmService';

	export let aqiData;

	let insights = null;
	let loading = true;
	let error = null;

	onMount(async () => {
		console.log('🧠 LLMInsights Component: Component mounted');
		console.log('🧠 LLMInsights Component: aqiData received:', aqiData);
		
		if (aqiData) {
			console.log('🧠 LLMInsights Component: Calling getAqiInsights...');
			try {
				insights = await getAqiInsights(aqiData);
				console.log('🧠 LLMInsights Component: Received insights:', insights);
			} catch (err) {
				console.error('🧠 LLMInsights Component: Error getting insights:', err);
				error = err.message;
			}
			loading = false;
		} else {
			console.log('🧠 LLMInsights Component: No aqiData provided');
			loading = false;
		}
	});
</script>

<div class="card mt-4">
	<div class="card-body">
		<h5 class="card-title">🤖 AI-Powered Insights</h5>
		{#if loading}
			<div class="text-center">
				<small class="text-muted">🔄 Generating insights...</small>
			</div>
		{:else if error}
			<div class="alert alert-danger">
				<strong>❌ Error:</strong> {error}
			</div>
		{:else if insights}
			{#if insights.summary}
				<div class="card mb-3">
					<div class="card-header bg-primary text-white">
						<strong>📊 Summary</strong>
					</div>
					<div class="card-body">
						<p class="card-text">{insights.summary}</p>
					</div>
				</div>
			{/if}
			{#if insights.advice}
				<div class="card mb-3">
					<div class="card-header bg-success text-white">
						<strong>💡 Actionable Advice</strong>
					</div>
					<div class="card-body">
						{#if typeof insights.advice === 'object'}
							{#if insights.advice.general_public}
								<h6 class="card-subtitle mb-2">👥 General Public</h6>
								<p class="card-text">{insights.advice.general_public}</p>
							{/if}
							{#if insights.advice['sensitive_groups (children, elderly, people with respiratory or heart conditions)']}
								<h6 class="card-subtitle mb-2">🏥 Sensitive Groups</h6>
								<p class="card-text">{insights.advice['sensitive_groups (children, elderly, people with respiratory or heart conditions)']}</p>
							{/if}
							{#if insights.advice.outdoor_workers}
								<h6 class="card-subtitle mb-2">👷 Outdoor Workers</h6>
								<p class="card-text">{insights.advice.outdoor_workers}</p>
							{/if}
						{:else}
							<p class="card-text">{insights.advice}</p>
						{/if}
					</div>
				</div>
			{/if}
			{#if insights.warning}
				<div class="card mb-3">
					<div class="card-header bg-warning text-dark">
						<strong>⚠️ Important Warning</strong>
					</div>
					<div class="card-body">
						{#if typeof insights.warning === 'object'}
							{#if insights.warning.station}
								<p class="card-text">{insights.warning.station}</p>
							{/if}
						{:else}
							<p class="card-text">{insights.warning}</p>
						{/if}
					</div>
				</div>
			{/if}
		{:else}
			<p class="text-muted">ℹ️ Could not load insights. Check console for details.</p>
		{/if}
	</div>
</div>