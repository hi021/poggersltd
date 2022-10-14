<script lang="ts">
	import Loader from '$lib/components/Loader.svelte';
	import { page } from '$app/stores';
	import * as Pancake from '@sveltejs/pancake';
	import { COUNTRIES, formatNumber, getAvatarURL } from '$lib/util';
	import type { PageData } from './$types';

	export let data: PageData;
	let chartClosestPoint: any;
	let category = $page.params.category;
</script>

<svelte:head>
	<title>{data.name ? data.name : 'player'} - poggers</title>
</svelte:head>

{#await data}
	<Loader margin="2rem" />
{:then plr}
	<main class="flex-fill column">
		{#if plr?.name}
			<div id="top-bar-container" class="row">
				<img id="avatar" alt={plr.name} src={getAvatarURL(plr._id)} />
				<div class="column" style="width: 100%;">
					<div id="top-bar-top">
						{plr.name}
					</div>
					<div id="top-bar-bottom" class="row">
						<img
							class="osu-flag-small"
							alt={plr.country}
							src={'/flags/' + plr.country + '.svg'}
							style="margin-right: 10px;"
						/>
						{COUNTRIES[plr.country] || plr.country}
					</div>
				</div>
			</div>
			<div id="main-wrapper" class="row flex-fill">
				<div id="side-bar" class="column">
					<a target="_blank" href="https://osu.ppy.sh/users/{plr._id}" title="osu! profile"
						><span class="icon icon-osu" /></a
					>
				</div>
				<div id="main" class="column flex-fill">
					<div id="tabs-container" class="row">
						<div
							class="tab"
							class:active={category === 'top50'}
							on:click={() => (category = 'top50')}
						>
							top 50
						</div>
						<div
							class="tab"
							class:active={category === 'top25'}
							on:click={() => (category = 'top25')}
						>
							top 25
						</div>
						<div
							class="tab"
							class:active={category === 'top8'}
							on:click={() => (category = 'top8')}
						>
							top 8
						</div>
						<div
							class="tab"
							class:active={category === 'top1'}
							on:click={() => (category = 'top1')}
						>
							top 1
						</div>
					</div>
					<div class="row">
						{#if plr[category]}
							<div id="chart-container">
								<Pancake.Chart x1={0} x2={90} y1={0} y2={90}>
									<Pancake.Quadtree data={plr.ranks} bind:closest={chartClosestPoint} />

									<Pancake.Svg>
										<Pancake.SvgLine data={plr.ranks} x={(d) => d} y={(d) => d} let:d>
											<path class="chart-path" {d} />
										</Pancake.SvgLine>
									</Pancake.Svg>

									{#if chartClosestPoint}
										<Pancake.Point x={chartClosestPoint.x} y={chartClosestPoint.y}>
											<!-- <span
										class="osu-profile-chart-tooltip-line"
										style="transform: translateY(-{86 - (profileChartClosestPoint.y / maxProfileChartData) * 86}px);"
										/> -->
											<span class="osu-profile-chart-tooltip-point" />
										</Pancake.Point>
									{/if}
								</Pancake.Chart>
							</div>
							<div class="stat-container">
								<span class="stat-name"> count </span>
								<span class="stat-value">
									{formatNumber(plr[category].value)}
								</span>
								<span class="stat-name"> rank </span>
								<span class="stat-value">
									{formatNumber(plr[category].rank)}
								</span>
								<span class="stat-name"> country rank </span>
								<span class="stat-value">
									{formatNumber(plr[category].countryRank)}
								</span>
							</div>
						{:else}
							<p>No {category} stats for this player...</p>
						{/if}
					</div>
				</div>
			</div>
		{:else}
			<p>Player not found</p>
		{/if}
	</main>
{/await}

<style>
	main {
		--av-height: 96px;
		--av-height-2: 48px;
		padding: calc(var(--av-height-2));
	}

	#avatar {
		height: var(--av-height);
		aspect-ratio: 1/1;
		border-radius: 50%;
		outline: 4px solid var(--color-lightest);
		background-color: var(--color-lighter);
		z-index: 1;
	}
	#top-bar-top,
	#top-bar-bottom {
		display: flex;
		align-items: center;
		height: var(--av-height-2);
		padding-left: calc(var(--av-height-2) + 10px);
		padding-right: 10px;
		margin-left: calc(-1 * var(--av-height-2));
	}
	#top-bar-top {
		font-size: 1.25rem;
		border-top-right-radius: 9999px;
		background: linear-gradient(45deg, var(--color-purple), #880e4f);
	}

	#side-bar,
	#top-bar-bottom {
		background-color: var(--color-lighter);
		color: var(--color-darker);
	}

	#side-bar {
		width: var(--av-height);
		padding-top: calc(var(--av-height-2) + 10px);
		margin-top: calc(-1 * var(--av-height-2));
		padding-bottom: 10px;
		align-items: center;
	}

	#main {
		--pad: 12px;
		padding: var(--pad);
		background-color: var(--color-dark);
	}

	#tabs-container {
		margin: calc(-1 * var(--pad));
		margin-bottom: var(--pad);
		padding-left: var(--pad);
		background-color: rgba(0, 0, 0, 0.4);
	}
	.tab {
		padding: 8px;
		cursor: pointer;
	}
	.tab:hover {
		background-color: rgba(0, 0, 0, 0.4);
	}
	.tab.active {
		color: var(--color-active);
	}

	#chart-container {
		height: 260px;
		background-color: aliceblue;
	}
	.chart-path {
		stroke: var(--color-active);
		opacity: 1;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2px;
		fill: none;
	}
	.chart-tooltip-point {
		position: absolute;
		width: 10px;
		height: 10px;
		background-color: var(--color-dark);
		border: 3px solid var(--color-active);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.stat-container {
		display: flex;
		flex-direction: column;
	}
	.stat-name {
		font-size: 0.875rem;
		border-bottom: 1px solid var(--color-lighter);
	}

	.icon-osu {
		background-image: url('/icons/osu_white.svg');
		filter: invert(1);
		height: 36px;
	}
	.icon-osu:hover {
		opacity: 0.45;
	}
</style>
