<script>
	import Footer from '$lib/components/Footer.svelte';
	import MenuButton from '$lib/components/MenuButton.svelte';
</script>

<svelte:head>
	<title>poggers</title>
</svelte:head>

<header><a href="/" class="logo-text">poggers</a></header>

<main class="row flex-fill">
	<MenuButton
		backgroundColor="#88bbff"
		href="/osu"
		label="osu! stats"
		backgroundImage="url(/osu_triangles.svg)"
	/>
	<MenuButton
		backgroundColor="rgb(100,181,246)"
		href="https://ht.poggers.ltd"
		label="Hardware Tycoon"
		backgroundImage="url(/ht_thumb.jpg)"
	/>
</main>

<Footer />

<style>
	header {
		text-align: center;
		background-color: var(--color-purple);
		font-weight: 600;
		font-size: 2rem;
		padding: 1.25rem 0.25rem;
		line-height: 1;
		margin-bottom: 42px;
		background-image: url('/4am_girl.png');
		background-position: 0 45%;
		background-repeat: no-repeat;
		box-shadow: 0 3px 2px var(--color-darkest);
	}
	.logo-text {
		transition: color 0.25s;
	}

	main {
		padding: 0 1.25rem;
		gap: 1.25rem;
		flex-wrap: wrap;
		margin-bottom: 32px;
	}
</style>
