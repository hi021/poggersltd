<script lang="ts">
	import { goto } from '$app/navigation';
	import Switch from '$lib/components/Switch.svelte';
	import UserSearch from '$lib/components/UserSearch.svelte';

	let singleRank = false;
	let rank: number;

	const gotoPlayer = (idOrName: string | number) => {
		if (!singleRank) goto(`/osu/breakdown/${idOrName}/${singleRank ? rank || 1 : '1-50'}`);
	};
	const gotoPlayerKey = (idOrName: string | number) =>
		goto(`/osu/breakdown/${idOrName}/${singleRank ? rank || 1 : '1-50'}`);
</script>

<svelte:head>
	<title>breakdown - poggers</title>
</svelte:head>

<main class="flex-fill column" style="padding: 0 3.5%">
	<div class="row">
		<UserSearch {gotoPlayer} {gotoPlayerKey} />
		{#if singleRank}
			<input
				class="rank-input input-dark"
				type="number"
				placeholder="Rank (1-50)"
				min="1"
				max="50"
				bind:value={rank}
			/>
		{/if}
	</div>
	<label class="row" style="align-items: center; margin-top: 16px; width: fit-content;">
		<Switch bind:checked={singleRank} />
		<span style="margin-left: 8px;">Single rank</span>
	</label>

	<slot />
</main>

<style>
	.rank-input {
		margin-left: 22px;
		margin-top: 22px;
		width: 20%;
	}
	.rank-input:focus {
		box-shadow: 0 0 2px 0.2rem rgba(255, 255, 255, 0.35);
	}
</style>
