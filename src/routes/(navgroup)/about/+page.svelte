<svelte:head>
	<title>about - poggers</title>
</svelte:head>

<main>
	<h1>hii</h1>
	<p style="margin-bottom: 44px;">
		This is an ongoing rewrite of a rewrite of pogowanie - a site that tracks osu! score
		leaderboards.
		<br />
		Most of the functionality is already implemented, but some of it lacks polish. I'll be working on
		that!
	</p>

	<h2>What's different?</h2>
	<p class="para">
		The site and API were remade from scratch to hopefully be much more performant and nicer to use.
		<br />
		I've also moved away from osu!stats to respektive's API.
		<br />
		<br />
		The biggest change is the inclusion of tracking for top 25, top 8, and top 1 scores, and user profiles.
	</p>

	<h2>Credits</h2>
	<p class="para">
		90% of credit goes to respektive and <a
			class="a"
			href="https://osustats.respektive.pw"
			target="_blank"
			rel="noreferrer">osustats.respektive.pw</a
		>, the other 10% goes to stack overflow.
		<br />
		The site also uses images from
		<a class="a" href="https://osu.ppy.sh/" target="_blank" rel="noreferrer">osu.ppy.sh</a>
		and flag icons from
		<a class="a" href="https://github.com/lipis/flag-icons" target="_blank" rel="noreferrer"
			>this repository</a
		>.
	</p>

	<h2>Contact</h2>
	<p class="para">
		Scream at <code>hi#8112</code> in case something breaks;;
	</p>

	<h2>osu! score ranking archive</h2>
	<h4>Why are there no scores?</h4>
	<p class="para">
		Probably because the API was down for the entire day and it wasn't possible to save the ranking.
		<br />
		If you're looking at today's ranking, that becomes available around 7 A.M. UTC.
	</p>
	<h4>How does it work?</h4>
	<p class="para">barely\</p>

	<h2>Other osu! stat-tracking sites</h2>
	<ul>
		<li>
			<strong><a href="https://osustats.ppy.sh/">osu!Stats</a></strong> - the original site for score
			rankings
		</li>
		<li>
			<strong><a href="https://snipe.huismetbenen.nl/">osu!snipe</a></strong> - for country #1s
		</li>
		<li>
			<strong><a href="https://ameobea.me/osutrack/">osu!track</a></strong> - profile stats tracking
			with satisfying charts
		</li>
		<li>
			<strong><a href="https://osudaily.net">osu!daily</a></strong> - lots of rankings like playcount,
			SS count, etc. + daily profile stats tracking similar to osu!track
		</li>
		<li>
			<strong><a href="https://osuskills.com">osu!Skills</a></strong> - pp ranking but even more broken
		</li>
	</ul>
</main>

<style>
	main {
		padding: 0 3.5%;
	}

	h1 {
		font-weight: 700;
	}
	h2 {
		margin-bottom: -2px;
		font-weight: 400;
		background-color: rgba(0, 0, 0, 0.3);
		padding: 8px;
	}

	a {
		color: var(--color-active);
	}
	.a {
		color: #999;
	}
	code {
		color: var(--color-active);
		background-color: rgba(0, 0, 0, 0.15);
		padding: 4px;
	}
</style>
