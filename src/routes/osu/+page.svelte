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
		goto('/osu/player/' + idOrName + '/top50');
	}

	onMount(() => {
		if (browser) {
			searchInputElement.focus();
			addEventListener('click', handleClick);
		}
	});
	onDestroy(() => {
		if (browser) removeEventListener('click', handleClick);
	});
</script>

<svelte:head>
	<title>osu! - poggers</title>
</svelte:head>

<main class="flex-fill" style="padding: 0 3.5%">
	<div id="search-input-wrapper" class="row">
		<div class="autocmp-wrapper">
			<input
				id="search-input"
				type="text"
				placeholder="osu! username"
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
</main>

<style>
	#search-input-wrapper {
		position: relative;
		width: 100%;
		height: fit-content;
		margin-top: 22px;
		font-size: 1.375rem;
		background-color: var(--color-dark);
		border: 1px solid var(--color-darker);
		align-items: center;
		/* overflow: hidden; would also hide input's focus shadow and autocomplete */
	}
	#search-input-wrapper > .icon {
		position: absolute;
		background-image: url('/icons/search.svg');
		width: 1.75rem;
		right: 6px;
		filter: invert(100%);
	}
	#search-input {
		border-radius: 0;
		padding: 8px 6px;
		padding-right: calc(2rem + 8px);
		background-color: transparent;
		border: none;
		color: var(--color-lighter);
		width: 100%;
	}
	#search-input:focus {
		box-shadow: 0 0 2px 0.2rem rgba(255, 255, 255, 0.35);
	}
</style>
