<svelte:head>
	<title>poggers api</title>
</svelte:head>

<main>
	<h1>poggers api</h1>
	<p>
		This API is not private but it sure is a mess
		<br />
		Yell at <code>hi#8112</code> in case it explodes
		<br />
		<small>server smol please be gentle;;</small>
	</p>
	<small>v3.0 (2022-10)</small>

	<h2>Types</h2>
	<span class="type-name">PlayerRanking</span>
	<ul>
		<li>
			<span>date</span>
			<code class="type-type">string</code>
			<span class="description">YYYY-MM-DD day from which the data was taken</span>
		</li>
		<li>
			<span>value</span>
			<code class="type-type">number</code>
			<span class="description">amount of scores</span>
		</li>
		<li>
			<span>rank</span>
			<code class="type-type">number</code>
			<span class="description">global rank in given scores ranking</span>
		</li>
		<li>
			<span>countryRank</span>
			<code class="type-type">number</code>
		</li>
		<li>
			<span>gained</span>
			<code class="type-type">number | undefined</code>
			<span class="description"
				>amount of scores gained in the last `gainedDays` days, undefined if not in previous ranking
				archive</span
			>
		</li>
		<li>
			<span>gainedRank</span>
			<code class="type-type">number | undefined</code>
			<span class="description"
				>amount of ranks gained in the last `gainedDays` days, undefined if not in previous ranking
				archive</span
			>
		</li>
		<li>
			<span>gainedDays</span>
			<code class="type-type">number | undefined</code>
			<span class="description">defaults to 1, only set in case of a gap in archive entries</span>
		</li>
	</ul>
	<hr />

	<h2>Endpoints</h2>
</main>

<style>
	main {
		padding: 0.5rem 2.5%;
	}

	.description {
		font-size: 0.875rem;
	}
	.type-name {
		font-weight: 500;
		color: #80cbc4;
	}
	.type-type {
		padding: 3px;
		background-color: rgba(0, 0, 0, 0.3);
	}
</style>
