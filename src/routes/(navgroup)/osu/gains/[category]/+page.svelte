<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/Loader.svelte';
	import { formatNumber, COUNTRIES, getAvatarURL, RANKING_BADGES } from '$lib/util';
	import type { PageData } from './$types';

	export let data: PageData;
	let scoreCategory = $page.params.category;
	$: scoreCategory = $page.params.category;

	const setURL = () => goto(`/osu/gains/${scoreCategory || 'top50'}`);
</script>

<svelte:head>
	<title>most gained - poggers</title>
</svelte:head>

<nav class="secondary-nav row">
	<div class="secondary-nav-inner row">
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top50'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top50';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top50';
				setURL();
			}}
		>
			Top 50
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top25'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top25';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top25';
				setURL();
			}}
		>
			Top 25
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top8'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top8';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top8';
				setURL();
			}}
		>
			Top 8
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top1'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top1';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top1';
				setURL();
			}}
		>
			Top 1
		</button>
	</div>
</nav>

<main class="flex-fill osu-main">
	{#await data.rankingData}
		<Loader margin="2rem" sticky={true} />
	{:then data}
		{#if !data?.length}
			<p class="solo-text">No data for the given query</p>
		{:else}
			<table class="osu-table">
				<tbody>
					{#each data as plr}
						<tr
							class:top-rank={plr._id <= 3}
							style="background-position: 50% {plr._id * 46 + 320}px;"
						>
							<td style="width: 5.25ch;">
								<strong>#{plr._id}</strong>
							</td>
							{#if true}
								<td class="hide-width-640" style="width: 64px;">
									<a
										href="https://osu.ppy.sh/users/{plr.id}"
										target="_blank"
										rel="noreferrer"
										title="osu! profile"
									>
										<img class="osu-avatar-small" alt="" src={getAvatarURL(plr.id)} />
									</a>
								</td>
							{/if}
							<td style="width: 40px;">
								<img
									class="osu-flag-small"
									alt={plr.country}
									title={COUNTRIES[plr.country]}
									src="/flags/{plr.country}.svg"
								/>
							</td>
							<td
								class="osu-name-column"
								on:click={() => goto(`/osu/player/${plr.name}/${$page.params.category}`)}
								on:keypress={(e) => {
									if (e.key === 'Enter') goto(`/osu/player/${plr.name}/${$page.params.category}`);
								}}
							>
								<div class="row">
									<span>
										{plr.name}
									</span>
									{#if RANKING_BADGES[plr.id]}
										<img
											class="osu-badge"
											alt="pog"
											src={RANKING_BADGES[plr.id].img}
											title={RANKING_BADGES[plr.id].title}
										/>
									{/if}
								</div>
							</td>
							<td style="width: 25%;">
								+{formatNumber(plr.gained ?? 0, ' ')}
								<small class="hide-width-640" style="margin-left: 8px;">
									{formatNumber(plr.value - (plr.gained ?? 0), ' ')} → {formatNumber(plr.value)}
								</small>
								<small class="date-text">
									{plr.date}
								</small>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	{/await}
</main>

<style>
	.date-text {
		white-space: nowrap;
		margin-left: 8px;
		color: #999;
	}

	@media screen and (max-width: 640px) {
		.date-text {
			font-size: 57.5%;
		}
	}
</style>
