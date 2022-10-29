<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getAvatarURL } from '$lib/util';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let searchInputElement: HTMLInputElement;
	let autocompleteEntries: Array<{ _id: number; name: string }> = [];

	function handleClick(e: MouseEvent) {
		if (!(e.target as Element).className?.includes('autocmp-item')) autocompleteEntries = [];
	}

	async function getAutocomplete(query: string) {
		if (!query || query.length < 3) {
			autocompleteEntries = [];
			return;
		}

		try {
			const res = await fetch('/api/player/' + query + '/search');
			const resJson = await res.json();
			if (resJson?.length) autocompleteEntries = resJson;
			else autocompleteEntries = [];
		} catch (e) {
			autocompleteEntries = [];
		}
	}

	function gotoPlayer(idOrName: string | number) {
		goto('/osu/breakdown/' + idOrName + '/1-50');
	}

	onMount(async () => {
		if (browser) {
			addEventListener('click', handleClick);
			await new Promise((resolve) => {
				setTimeout(() => resolve(1), 100);
			});
			searchInputElement.focus();
		}
	});
	onDestroy(() => {
		if (browser) removeEventListener('click', handleClick);
	});
</script>

<svelte:head>
	<title>breakdown - poggers</title>
</svelte:head>

<main class="flex-fill column" style="padding: 0 3.5%">
	<div class="search-input-wrapper row">
		<div class="autocmp-wrapper">
			<input
				class="search-input"
				type="text"
				placeholder="osu! username or id"
				autocomplete="new-password"
				bind:this={searchInputElement}
				on:input={() => getAutocomplete(searchInputElement.value)}
				on:keypress={(e) => {
					if (e.key === 'Enter') {
						gotoPlayer(searchInputElement.value);
					}
				}}
			/>
			<div class="autocmp-items">
				{#each autocompleteEntries as a}
					<div
						class="autocmp-item"
						tabindex="0"
						on:click={() => gotoPlayer(a.name)}
						on:keypress={(e) => {
							if (e.key === 'Enter') gotoPlayer(a.name);
						}}
					>
						<img
							class="osu-avatar-small"
							alt=""
							src={getAvatarURL(a._id)}
							style="margin-right: 1rem;"
						/>
						{a.name}
					</div>
				{/each}
			</div>
		</div>
		<div class="icon icon-search" />
	</div>

	<slot />
</main>

<style>
</style>
