<script lang="ts">
	import { goto } from '$app/navigation';
	import UserSearch from '$lib/components/UserSearch.svelte';

	const gotoPlayer = (idOrName: string | number) => goto('/osu/player/' + idOrName + '/top50');
</script>

<svelte:head>
	<title>osu! search - poggers</title>
</svelte:head>

<main class="flex-fill" style="padding: 0 3.5%">
	<UserSearch {gotoPlayer} gotoPlayerKey={gotoPlayer} />
</main>

<style>
</style>
