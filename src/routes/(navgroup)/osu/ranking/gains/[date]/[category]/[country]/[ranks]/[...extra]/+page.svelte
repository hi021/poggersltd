<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/Loader.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { formatNumber, COUNTRIES, getAvatarURL, RANKING_BADGES } from '$lib/util';
	import type { PageData } from './$types';

	export let data: PageData;
	let pageData: App.Ranking[];
	const perPage = 50;
	let curPage = 1;
	let maxPage: number;

	$: maxPage = Math.ceil(data.rankingData.length / perPage);
	$: pageData = data.rankingData.slice(perPage * (curPage - 1), perPage * curPage);

	let showAvatars = true;
</script>

<svelte:head>
	<title>{$page.params.date || 'ranking'} - poggers</title>
</svelte:head>

<main class="flex-fill column osu-main">
	<div class="flex-center" style="margin-top: 21px;">
		{#if maxPage > 1}
			<Pagination page={curPage} {maxPage} onPageChange={(newPage) => (curPage = newPage)} />
		{/if}
	</div>
	{#await pageData}
		<Loader margin="2rem" sticky={true} />
	{:then pageData}
		{#if !pageData?.length}
			<p class="solo-text">
				No data for the given query<br />
				<small>There's probably no archive entry for this date...</small>
			</p>
		{:else}
			<table class="osu-table">
				<tbody>
					{#each pageData as plr, i}
						<tr
							class:top-rank={plr.rank <= 3}
							style="background-position: 50% {plr.rank * 46 + 320}px;"
						>
							<td style="width: 5.25ch;">
								<strong>#{i + 1 + (curPage - 1) * perPage}</strong>
							</td>
							<td style="width: 22px;">
								{#if plr.gainedRank == undefined}
									<div class="circle" title="New" />
								{:else if (plr.gainedRank ?? -1) > 0}
									<div class="arrow" title="Up by {plr.gainedRank}" />
								{:else if (plr.gainedRank ?? 1) < 0}
									<div class="arrow-down" title="Down by {-(plr.gainedRank ?? 0)}" />
								{:else if plr.gainedRank === 0}
									<div class="line" title="No change" />
								{/if}
							</td>
							{#if showAvatars}
								<td class="hide-width-640" style="width: 64px;">
									<a
										href="https://osu.ppy.sh/users/{plr._id}"
										target="_blank"
										rel="noreferrer"
										title="osu! profile"
									>
										<img class="osu-avatar-small" alt="" src={getAvatarURL(plr._id)} />
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
								class="name-column"
								on:click={() => goto(`/osu/player/${plr.name}/${$page.params.category}`)}
								on:keypress={(e) => {
									if (e.key === 'Enter') goto(`/osu/player/${plr.name}/${$page.params.category}`);
								}}
							>
								<div class="row">
									<span>
										{plr.name}
									</span>
									{#if RANKING_BADGES[plr._id]}
										<img
											class="osu-badge"
											alt="pog"
											src={RANKING_BADGES[plr._id].img}
											title={RANKING_BADGES[plr._id].title}
										/>
									{/if}
								</div>
							</td>
							<td style="width: 25%;">
								{(plr.gained ?? -1) >= 0 ? '+' : ''}{formatNumber(plr.gained ?? 0, ' ')}
								<small style="margin-left: 8px;">
									<span class="hide-width-640">
										{formatNumber(plr.value - (plr.gained ?? 0), ' ')} → {formatNumber(plr.value)}
									</span>
									{#if plr.gainedDays}
										({Math.round(((plr.gained ?? 0) / plr.gainedDays) * 100) / 100}/day)
									{/if}
								</small>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="column flex-center" style="margin-bottom: 21px;">
				{#if maxPage > 1}
					<Pagination page={curPage} {maxPage} onPageChange={(newPage) => (curPage = newPage)} />
				{/if}
				<div style="font-weight: 300; margin-top: 4px;">
					Page <strong>{curPage}</strong>/{maxPage}
				</div>
			</div>
		{/if}
	{/await}
</main>

<style>
	.name-column {
		cursor: pointer;
	}
	.name-column > div {
		align-items: center;
	}
	.name-column:hover > div > span {
		color: var(--color-active);
	}
</style>
