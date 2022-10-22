<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { formatDate, MIN_DATE, addDate } from '$lib/util';

	const MAX_DATE = formatDate();
	let date = $page.params.date;
	$: date = $page.params.date === 'latest' ? MAX_DATE : $page.params.date;
	let scoreCategory = $page.params.category;
	$: scoreCategory = $page.params.category;
	let type = $page.url.pathname.split('/')[3]; //players, countries, gains
	$: type = $page.url.pathname.split('/')[3];
	let country = $page.params.country;

	function addDateNav(days: number) {
		let curDate = new Date(date);
		if (isNaN(curDate.getTime())) curDate = new Date(MAX_DATE);

		const newDate = addDate(curDate, days);
		const formattedDate = formatDate(newDate);
		if (formattedDate < MIN_DATE) date = MIN_DATE;
		else if (formattedDate > MAX_DATE) date = MAX_DATE;
		else date = formattedDate;
		setURL();
	}

	const setURL = () =>
		goto(
			`/osu/ranking/${type || 'players'}/${date || 'latest'}/${scoreCategory || 'top50'}/${
				country || 'all'
			}/${$page.params.ranks || '0-0'}/${$page.params.extra || ''}`
		);
</script>

<nav id="secondary-nav" class="row">
	<div class="secondary-nav-inner row">
		<div
			tabindex="0"
			class="secondary-nav-tab"
			class:active={scoreCategory === 'top50'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top50';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top50';
				setURL();
			}}
		>
			Top 50
		</div>
		<div
			tabindex="0"
			class="secondary-nav-tab"
			class:active={scoreCategory === 'top25'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top25';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top25';
				setURL();
			}}
		>
			Top 25
		</div>
		<div
			tabindex="0"
			class="secondary-nav-tab"
			class:active={scoreCategory === 'top8'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top8';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top8';
				setURL();
			}}
		>
			Top 8
		</div>
		<div
			tabindex="0"
			class="secondary-nav-tab"
			class:active={scoreCategory === 'top1'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					scoreCategory = 'top1';
					setURL();
				}
			}}
			on:click={() => {
				scoreCategory = 'top1';
				setURL();
			}}
		>
			Top 1
		</div>
	</div>
	<div class="secondary-nav-inner row">
		<div
			tabindex="0"
			class="secondary-nav-tab"
			class:active={type === 'countries'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					type = 'countries';
					setURL();
				}
			}}
			on:click={() => {
				type = 'countries';
				setURL();
			}}
		>
			Countries
		</div>
		<div
			tabindex="0"
			class="secondary-nav-tab"
			class:active={type === 'gains'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					type = 'gains';
					setURL();
				}
			}}
			on:click={() => {
				type = 'gains';
				setURL();
			}}
		>
			Gains
		</div>
		<div
			tabindex="0"
			class="secondary-nav-tab"
			class:active={type === 'players'}
			on:keypress={(e) => {
				if (e.key === 'Enter') {
					type = 'players';
					setURL();
				}
			}}
			on:click={() => {
				type = 'players';
				setURL();
			}}
		>
			Players
		</div>
	</div>
</nav>

<form id="group-container" class="row" on:submit|preventDefault={setURL}>
	<button
		class="arrow-button btn-none"
		type="button"
		disabled={date <= MIN_DATE}
		on:click={() => addDateNav(-1)}>&lt;</button
	>
	<div class="group">
		<input type="date" max={MAX_DATE} min={MIN_DATE} bind:value={date} />
		<button class="btn-blue" type="submit">yoink</button>
	</div>
	<button
		class="arrow-button btn-none"
		type="button"
		disabled={date >= MAX_DATE}
		on:click={() => addDateNav(1)}>&gt;</button
	>
</form>
<slot />

<style>
	#group-container {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		margin: 0 2.5%;
	}
	.group {
		display: flex;
		align-items: stretch;
	}

	.arrow-button {
		background-color: rgba(0, 0, 0, 0.1);
		font-weight: 700;
		color: inherit;
		border-radius: 0;
		padding: 0 12px;
	}
	.arrow-button:first-child {
		border-bottom-left-radius: 6px;
		border-top-left-radius: 6px;
	}
	.arrow-button:last-child {
		border-bottom-right-radius: 6px;
		border-top-right-radius: 6px;
	}
	.arrow-button:not([disabled]):hover {
		background-color: rgba(0, 0, 0, 0.5);
	}

	#secondary-nav {
		background: linear-gradient(var(--color-darker) 0%, var(--color-dark) 15%);
		justify-content: space-between;
		padding: 0 20px;
		margin-bottom: 16px;
		font-size: 0.825rem;
	}
	.secondary-nav-tab {
		padding: 8px 12px;
		cursor: pointer;
	}
	.secondary-nav-tab.active {
		color: var(--color-active);
	}
	.secondary-nav-tab:hover {
		color: #fff;
	}

	:global(.osu-main) {
		background: linear-gradient(transparent 0%, rgba(49, 27, 146, 0.125) 85%);
	}

	:global(.osu-table) {
		width: 100%;
		border-spacing: 0 2px;
		padding: 0 2.5%;
	}
	:global(.osu-table tr) {
		background-color: rgba(0, 0, 0, 0.2);
		transition: background-color 0.25s;
	}
	:global(.osu-table tr.top-rank) {
		background-image: url('/osu_triangles.svg');
		/* background-size: 50%; */
		background-size: cover;
	}
	:global(.osu-table tr:hover) {
		background-color: rgba(100, 180, 245, 0.2);
	}
	:global(.osu-table td) {
		line-height: 1;
	}
	:global(.osu-table td:first-child) {
		padding-left: 10px;
	}

	:global(.osu-badge) {
		height: 26px;
		margin-left: 8px;
	}

	@media screen and (max-width: 640px) {
		:global(.osu-table) {
			border-spacing: 0;
		}
	}
</style>
