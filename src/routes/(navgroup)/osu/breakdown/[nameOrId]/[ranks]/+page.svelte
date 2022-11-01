<script lang="ts">
	import Loader from '$lib/components/Loader.svelte';
	import { formatNumber, COUNTRIES, getAvatarURL, RANKING_BADGES } from '$lib/util';
	import type { PageData } from './$types';
	//@ts-ignore
	import * as Pancake from '@sveltejs/pancake';
	import { onMount } from 'svelte';

	export let data: PageData;
	const minRank = data.breakdown[0].rank;
	const maxRank = data.breakdown[data.breakdown.length - 1].rank;
	let showRaw = false;
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
		<div class="chart-container">
			<Pancake.Chart x1={minRank} x2={maxRank} y1={0} y2={data.max}>
				<Pancake.Columns
					data={data.breakdown}
					x={(d) => d.rank}
					y={(d) => d.value}
					width={0.96}
					let:d
				>
					<div class="chart-column" />
				</Pancake.Columns>

				<Pancake.Grid data={data.breakdown} vertical count={data.breakdown.length} let:value>
					<span class="chart-label x">{value}</span>
				</Pancake.Grid>

				<Pancake.Grid data={data.breakdown} horizontal count={4} let:value>
					<span class="chart-label y">{value}</span>
				</Pancake.Grid>
			</Pancake.Chart>
		</div>
		<button
			type="button"
			style="margin-bottom: 16px;"
			on:click={() => {
				showRaw = !showRaw;
			}}>Show raw data</button
		>
		{#if showRaw}
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
		{/if}
	{/if}
{/await}

<style>
	.raw-table {
		margin-bottom: 16px;
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
		height: 320px;
		width: 80%;
		margin: 32px auto;
	}
	.chart-column {
		height: 100%;
		background-color: var(--color-active);
	}
	.chart-column:hover {
		opacity: 0.7;
	}

	.chart-label {
		position: absolute;
	}
	.chart-label.x {
	}
</style>
