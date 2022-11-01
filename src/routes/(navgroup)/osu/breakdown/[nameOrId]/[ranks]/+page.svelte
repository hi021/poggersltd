<script lang="ts">
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
</style>
