<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
</script>

<!-- params: [.../osu/ranking]/type/date/category/country/ranks/extra -->

<header class="row">
	<a href="/home" class="logo-text flex-center">poggers</a>
	<nav class="row" style="width: 100%;">
		<a
			href="/osu/ranking"
			class="nav-tab"
			class:active={$page.url.pathname.startsWith('/osu/ranking')}>Ranking</a
		>
		<a href="/osu" class="nav-tab" class:active={$page.url.pathname.startsWith('/osu/player')}
			>Player</a
		>
		<a
			href="/osu/breakdown"
			class="nav-tab"
			class:active={$page.url.pathname.startsWith('/osu/breakdown')}>Breakdown</a
		>
		<a
			href="/osu/gains/top50"
			class="nav-tab"
			class:active={$page.url.pathname.startsWith('/osu/gains')}>Most Gained</a
		>
		<a
			href="/about"
			class="nav-tab"
			class:active={$page.url.pathname.startsWith('/about')}
			style="margin-left: auto;"
		>
			About
		</a>
	</nav>
</header>
<slot />
<Footer />

<style>
	header {
		background-color: var(--color-dark);
	}

	.nav-tab {
		padding: 16px;
		color: inherit;
		text-decoration: none;
	}
	.nav-tab:hover,
	.nav-tab:focus,
	.nav-tab:focus-visible {
		outline: none;
		background-color: rgba(0, 0, 0, 0.2);
	}
	.nav-tab.active {
		color: var(--color-active);
	}
</style>
