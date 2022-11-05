<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>oopsie - poggers</title>
</svelte:head>

<main>
	<h2>Fuckie Wuckie &gt;~&lt;</h2>
	<div class="flex-center" style="margin-bottom: 1rem;">
		<div style="font-weight: 600; font-size: 4rem; margin-right: 32px; margin-left: -8rem">
			{$page.status}
		</div>
		<div style="font-weight: 300; font-size: 1.5rem">{$page?.error?.message || 'oops...'}</div>
	</div>
	<a class="a" href="/home">Go home</a>
</main>

<style>
	main {
		padding: 3rem 0.25rem;
		text-align: center;
	}
</style>
