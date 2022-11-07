<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { formatDate, MIN_DATE, addDate } from '$lib/util';

	const MAX_DATE = formatDate();
	let date = !$page.params.date || $page.params.date === 'latest' ? MAX_DATE : $page.params.date;
	let scoreCategory: string;
	$: scoreCategory = $page.params.category;
	let type: string; //players, countries, gains
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

<nav class="secondary-nav row">
	<div class="secondary-nav-inner row">
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top50'}
			on:click={() => {
				scoreCategory = 'top50';
				setURL();
			}}
		>
			Top 50
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top25'}
			on:click={() => {
				scoreCategory = 'top25';
				setURL();
			}}
		>
			Top 25
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top8'}
			on:click={() => {
				scoreCategory = 'top8';
				setURL();
			}}
		>
			Top 8
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={scoreCategory === 'top1'}
			on:click={() => {
				scoreCategory = 'top1';
				setURL();
			}}
		>
			Top 1
		</button>
	</div>
	<div class="secondary-nav-inner row">
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={type === 'countries'}
			on:click={() => {
				type = 'countries';
				setURL();
			}}
		>
			Countries
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={type === 'gains'}
			on:click={() => {
				type = 'gains';
				setURL();
			}}
		>
			Gains
		</button>
		<button
			tabindex="0"
			class="secondary-nav-tab btn-none btn-rect"
			class:active={type === 'players'}
			on:click={() => {
				type = 'players';
				setURL();
			}}
		>
			Players
		</button>
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
		<input type="date" placeholder="date" max={MAX_DATE} min={MIN_DATE} bind:value={date} />
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

	@media screen and (max-width: 640px) {
		:global(.osu-table) {
			border-spacing: 0;
		}
		:global(.osu-table td:first-child) {
			padding-left: 1px;
			font-size: 0.875rem;
		}
		:global(.osu-table td:last-child) {
			padding-right: 1px;
		}

		.secondary-nav-inner {
			flex-direction: column;
			padding-top: 12px;
		}
		.secondary-nav-tab {
			padding: 6px;
		}
	}
</style>
