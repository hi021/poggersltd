<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';
</script>

<!-- params: [.../osu/ranking]/type/date/category/country/ranks/extra -->

<header class="row">
	<a id="logo" href="/home" class="flex-center">poggers</a>
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
	#logo {
		color: inherit;
		text-decoration: none;
		padding: 0 20px;
	}
	#logo:hover,
	#logo:focus,
	#logo:focus-visible {
		background: linear-gradient(
			125deg,
			#ff2400,
			#e81d1d,
			#e8b71d,
			#e3e81d,
			#1de840,
			#1ddde8,
			#2b1de8,
			#dd00f3,
			#dd00f3,
			#2b1de8,
			#1ddde8,
			#1de840,
			#e3e81d,
			#e8b71d,
			#e81d1d,
			#ff2400
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		outline: 0;
		text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.2);
		animation: logo-rainbow 7s linear infinite alternate;
		background-size: 250% 100%;
	}
	@keyframes logo-rainbow {
		0% {
			background-position: 0 50%;
		}
		100% {
			background-position: 100% 50%;
		}
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
