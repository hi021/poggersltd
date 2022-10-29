<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loader from '$lib/components/Loader.svelte';
	import { formatNumber, COUNTRIES, getAvatarURL, RANKING_BADGES } from '$lib/util';
	import type { PageData } from './$types';

	export let data: PageData;
	let showRaw = false;
</script>

<svelte:head>
	<title>{data.user.name || 'breakdown'} - poggers</title>
</svelte:head>

{#await data}
	<Loader sticky={true} />
{:then data}
	<div class="user-header row flex-center">
		<img class="osu-avatar-small" alt="" src={getAvatarURL(data.user.id)} />
		<span style="font-size: 1.125rem; margin: 0 8px;">{data.user.name}</span>
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
		<button
			type="button"
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
	.raw-table td {
		background-color: rgba(0, 0, 0, 0.25);
		font-size: 0.825rem;
		padding: 2px;
	}
	.user-header {
		background-color: rgba(0, 0, 0, 0.25);
		padding: 8px;
		margin: 16px 0;
	}
</style>
