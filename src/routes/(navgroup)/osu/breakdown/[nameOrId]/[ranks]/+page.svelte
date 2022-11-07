<script lang="ts">
	import Loader from '$lib/components/Loader.svelte';
	import { formatNumber, COUNTRIES, getAvatarURL, transitionHeight } from '$lib/util';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let loading = true;
	const chartHeight = 320; //px
	let showRaw = false;

	onMount(() => {});
</script>

<svelte:head>
	<title>{data.user.name || 'breakdown'} - poggers</title>
</svelte:head>

{#await data}
	<Loader sticky={true} />
{:then data}
	<div class="user-header row flex-center">
		<a title="osu! profile" href="https://osu.ppy.sh/users/{data.user.id}">
			<img class="osu-avatar-small" alt="" src={getAvatarURL(data.user.id)} />
		</a>
		<span style="font-size: 1.125rem; margin: 0 12px;">{data.user.name}</span>
		<img
			class="osu-flag-small"
			alt={data.user.country}
			src="/flags/{data.user.country}.svg"
			title={COUNTRIES[data.user.country] || data.user.country}
		/>
	</div>

	{#if data.breakdown.length == 1}
		<table class="raw-table">
			<tbody>
				<tr>
					<td style="width: 5ch;"><strong>#{data.breakdown[0].rank}</strong></td>
					<td>{data.breakdown[0].value}</td>
				</tr>
			</tbody>
		</table>
	{:else}
		<div class="chart-container" style="height: {chartHeight}px;">
			{#each data.breakdown as d, i}
				<div
					class="chart-column-container"
					style="width: calc({100 / data.breakdown.length}% - 4px); left: {(i /
						data.breakdown.length) *
						100}%;"
				>
					<div class="chart-column-bar" style="height: {(d.value / data.max) * 100}%;" />
					<div class="chart-column-tooltip column flex-center">
						<strong>#{d.rank}</strong>
						<div>{formatNumber(d.value)}</div>
					</div>
				</div>
			{/each}
		</div>

		<button
			type="button"
			class="btn-gray"
			style="margin-bottom: 16px;"
			on:click={() => {
				showRaw = !showRaw;
			}}>Show raw data</button
		>
		{#if showRaw}
			<div class="table-container" transition:transitionHeight={{ maxHeight: 2000 }}>
				<table class="raw-table">
					<tbody>
						{#each data.breakdown as breakdown}
							<tr>
								<td style="width: 5ch;"><strong>#{breakdown.rank}</strong></td>
								<td>{breakdown.value}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
{/await}

<style>
	.table-container {
		overflow-y: hidden;
	}

	.raw-table {
		margin-bottom: 16px;
		width: 100%;
	}
	.raw-table td {
		background-color: rgba(0, 0, 0, 0.25);
		font-size: 0.825rem;
		padding: 3px;
	}
	.raw-table td:hover {
		background-color: rgba(0, 0, 0, 0.5);
	}

	.user-header {
		background-color: rgba(0, 0, 0, 0.25);
		padding: 12px;
		margin: 16px 0;
		line-height: 1;
	}

	.chart-container {
		box-sizing: border-box;
		width: 86%;
		margin: 32px auto;
		position: relative;
	}

	.chart-column-container {
		position: absolute;
		height: 100%;
		background-color: rgba(255, 255, 255, 0.04);
	}
	.chart-column-container:hover > .chart-column-tooltip {
		display: flex;
	}
	.chart-column-container:hover > .chart-column-bar {
		opacity: 0.8;
	}
	.chart-column-bar {
		position: absolute;
		background-color: var(--color-active);
		width: 100%;
		bottom: 0;
	}

	.chart-column-tooltip {
		display: none;
		position: absolute;
		left: 50%;
		top: 0;
		padding: 10px;
		border-radius: 10px;
		color: var(--color-lightest);
		background-color: rgba(0, 0, 0, 0.4);
		font-size: 0.75rem;
		width: max-content;
		z-index: 3;
		pointer-events: none;
		transform: translate(-50%, -50%);
	}
</style>
