<script lang="ts">
	import Loader from '$lib/components/Loader.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	//@ts-ignore
	import * as Pancake from '@sveltejs/pancake';
	import { COUNTRIES, formatNumber, getAvatarURL, RANKING_BADGES } from '$lib/util';
	import { fade } from 'svelte/transition';
	import type { PageData } from './$types';

	// TODO: make changing category tabs change the url (but we don't want a full reload - just a fetchRanks())

	export let data: PageData;
	const maxRankDay = data.ranks ? data.ranks.length - 1 : 89;
	let loading = false;
	let ranks = { ranks: data.ranks, rankStats: data.rankStats };
	let category = $page.params.category;

	async function fetchRanks(category: string) {
		if (!browser || category === 'all') return;
		loading = true;
		const resRanks = await fetch(`/api/player/${data._id}/ranks/${category || 'top50'}/90`);
		const resRanksJson = await resRanks.json();

		ranks = { ranks: resRanksJson.ranks, rankStats: resRanksJson.rankStats };
		loading = false;
	}
	$: fetchRanks(category);
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
						{#if RANKING_BADGES[plr._id]}
							<img
								class="osu-badge"
								alt="<3"
								src={RANKING_BADGES[plr._id].img}
								title={RANKING_BADGES[plr._id].title}
							/>
						{/if}
						{#if plr.oldName?.length}
							<div class="icon icon-profile-name" title={plr.oldName.join(', ')} />
						{/if}
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
					<a
						target="_blank"
						href="https://osu.ppy.sh/users/{plr._id}"
						title="osu! profile"
						rel="noreferrer"><span class="icon icon-osu" /></a
					>
				</div>
				<div id="main" class="column flex-fill">
					<div id="tabs-container" class="row">
						<button
							class="tab btn-none"
							class:active={category === 'top50'}
							on:click={() => (category = 'top50')}
						>
							top 50
						</button>
						<button
							class="tab btn-none"
							class:active={category === 'top25'}
							on:click={() => (category = 'top25')}
						>
							top 25
						</button>
						<button
							class="tab btn-none"
							class:active={category === 'top8'}
							on:click={() => (category = 'top8')}
						>
							top 8
						</button>
						<button
							class="tab btn-none"
							class:active={category === 'top1'}
							on:click={() => (category = 'top1')}
						>
							top 1
						</button>
						<button
							class="tab btn-none"
							class:active={category === 'all'}
							on:click={() => (category = 'all')}
						>
							all
						</button>
					</div>
					{#if loading}
						<div class="overlay" transition:fade />
					{:else}
						<div class="row" style="margin: 0 auto;">
							{#if category === 'all'}
								{#each ['top1', 'top8', 'top25', 'top50'] as cat}
									{#if plr[cat]}
										<div class="stats-container hoverable" style="margin-right: 32px;">
											<h3 class="category-header">{cat}s</h3>
											<span class="stat-name"> count </span>
											<span class="stat-value">
												{formatNumber(plr[cat].value)}
												<small class="stat-small"
													>#{formatNumber(plr[cat].rank, ',')} ({plr.country}#{formatNumber(
														plr[cat].countryRank,
														','
													)})</small
												>
											</span>
											{#if plr[cat].peak?.value != null}
												<span class="stat-name"> peak </span>
												<span class="stat-value">
													{formatNumber(plr[cat].peak.value)}
													<small class="stat-small">{plr[cat].peak.date}</small>
												</span>
											{/if}
											{#if plr[cat].lowest?.value != null}
												<span class="stat-name"> lowest </span>
												<span class="stat-value">
													{formatNumber(plr[cat].lowest.value)}
													<small class="stat-small">{plr[cat].lowest.date}</small>
												</span>
											{/if}
											{#if plr[cat].gained != null}
												<span class="stat-name"> gained </span>
												<span class="stat-value">
													{plr[cat].gained}
													<small class="stat-small">since last entry</small>
												</span>
											{/if}
										</div>
									{/if}
								{/each}
							{:else if plr[category]}
								<div class="stats-container">
									{#if plr[category].mostGained}
										<span class="stat-name left"> most gained </span>
										<span class="stat-value" title={plr[category].mostGained.date}>
											{formatNumber(plr[category].mostGained.value)}
										</span>
									{/if}
									{#if plr[category].peak}
										<span class="stat-name left"> peak </span>
										<span class="stat-value">
											{formatNumber(plr[category].peak.value)}
										</span>
									{/if}
									{#if plr[category].lowest}
										<span class="stat-name left"> lowest </span>
										<span class="stat-value" title={plr[category].lowest.date}>
											{formatNumber(plr[category].lowest.value)}
										</span>
									{/if}
								</div>
								<div id="chart-container">
									<Pancake.Chart
										x1={0}
										x2={maxRankDay}
										y1={ranks.rankStats.minValue - 20}
										y2={ranks.rankStats.maxValue + 20}
									>
										<!-- @ts-ignore -->
										<Pancake.Svg>
											<Pancake.SvgLine
												data={ranks.ranks}
												x={(_d, i) => maxRankDay - i}
												y={(d) => (d ? d.value : -100)}
												let:d
											>
												<path class="chart-path" {d} />
											</Pancake.SvgLine>
										</Pancake.Svg>

										<!-- @ts-ignore -->
										<Pancake.Quadtree
											data={ranks.ranks}
											x={(d, i) => maxRankDay - i}
											y={(d) => (d ? d.value : -100)}
											let:closest
										>
											{#if closest?.value > 0}
												<Pancake.Point x={closest.day} y={closest.value}>
													<span
														class="chart-tooltip-line"
														style="transform: translate(-50%, -{200 -
															(closest.value / (ranks.rankStats.maxValue - closest.value)) *
																200}px);"
													/>
													<span class="chart-tooltip-point" />
												</Pancake.Point>

												<Pancake.Point x={0} y={ranks.rankStats.maxValue + 20}>
													<div class="chart-tooltip column">
														<span>
															<strong>{category}s</strong>
															{formatNumber(closest.value)}
														</span>
														<span>
															<strong>global</strong>
															#{formatNumber(closest.rank, ',')}
														</span>
														<span style="color: var(--color-active);">
															{maxRankDay - closest.day === 0
																? 'now'
																: maxRankDay - closest.day === 1
																? '1 day ago'
																: maxRankDay - closest.day + ' days ago'}
														</span>
													</div>
												</Pancake.Point>
											{/if}
										</Pancake.Quadtree>
									</Pancake.Chart>
								</div>
								<div class="stats-container">
									<span class="stat-name"> count </span>
									<span class="stat-value">
										{formatNumber(plr[category].value)}
									</span>
									<span class="stat-name"> rank </span>
									<span class="stat-value">
										#{formatNumber(plr[category].rank, ',')}
									</span>
									<span class="stat-name"> country rank </span>
									<span class="stat-value">
										#{formatNumber(plr[category].countryRank, ',')}
									</span>
								</div>
							{:else}
								<p class="solo-text">
									No {category} stats for this player...
									<br />Check a different tab!
								</p>
							{/if}
						</div>
					{/if}
					{#if plr[category]}
						<small style="margin: auto; margin-bottom: 0;"
							>Data from <strong>{plr[category].date}</strong></small
						>
					{/if}
				</div>
			</div>
		{:else}
			<p class="solo-text">Player not found</p>
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
		position: relative;
	}
	.overlay {
		--color-base: 0, 0, 0;
		backdrop-filter: blur(5px);
		margin-left: calc(-1 * var(--pad));
	}

	#tabs-container {
		margin: calc(-1 * var(--pad));
		margin-bottom: var(--pad);
		padding-left: var(--pad);
		background-color: var(--color-darker);
	}
	.tab {
		color: inherit;
		border: none;
		border-radius: 0;
		padding: 8px;
		cursor: pointer;
		transition: none;
	}
	.tab:hover,
	.tab:focus,
	.tab:focus-visible {
		outline: none;
		box-shadow: none;
		background-color: rgba(0, 0, 0, 0.4);
	}
	.tab.active {
		color: var(--color-active);
	}

	#chart-container {
		height: 200px;
		width: 600px;
		margin-right: 16px;
		padding: 8px;
		overflow-y: hidden;
	}
	.chart-path {
		stroke: var(--color-active);
		opacity: 1;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2px;
		fill: none;
	}

	.chart-tooltip {
		position: absolute;
		padding: 10px;
		border-radius: 10px;
		color: var(--color-lightest);
		background-color: rgba(0, 0, 0, 0.4);
		font-size: 0.75rem;
		width: max-content;
		z-index: 2;
		pointer-events: none;
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
		z-index: 1;
	}
	.chart-tooltip-line {
		position: absolute;
		width: 2px;
		height: 200px;
		background-color: var(--color-active);
		pointer-events: none;
	}

	.category-header {
		font-weight: 300;
		text-align: center;
		margin-top: 6px;
	}
	.stats-container {
		display: flex;
		flex-direction: column;
		margin-right: 20px;
	}
	.stats-container.hoverable {
		padding: 10px;
	}
	.stats-container.hoverable > .stat-value {
		margin-bottom: 12px;
	}
	.stats-container.hoverable:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	.stat-name {
		font-size: 0.875rem;
		border-bottom: 1px solid var(--color-lighter);
		border-bottom-left-radius: 1px;
		border-bottom-right-radius: 1px;
	}
	.stat-value {
		font-size: 1.25rem;
		margin-bottom: 3px;
	}
	.stat-small {
		font-size: 0.75rem;
		font-weight: 300;
	}

	.icon-osu {
		background-image: url('/icons/osu_white.svg');
		filter: invert(1);
		height: 36px;
	}
	.icon-osu:hover {
		opacity: 0.45;
	}

	.icon-profile-name {
		background-image: url('/icons/profile_name.svg');
		height: 24px;
		filter: invert(1);
		margin-left: 10px;
		transition: transform 0.25s;
	}
	.icon-profile-name:hover {
		transform: translateY(-4px);
	}
</style>
