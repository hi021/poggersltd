<script lang="ts">
	import { browser } from "$app/environment";
	import { goto, onNavigate } from "$app/navigation";
	import { page } from "$app/state";
	import RankingFlag from "$lib/components/Ranking/RankingFlag.svelte";
	import { COUNTRIES, MIN_DATE } from "$lib/constants";
	import { rankingSettings } from "$lib/stores";
	import { addDays, getDaysBetweenDates, getRankingUrl } from "$lib/util";
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
	import MultiSelectDropdown from "../MultiSelectDropdown.svelte";
	import Switch from "../Switch.svelte";

	interface Props {
		viewMode?: "players" | "countries" | "gains" | "mostGained";
		style?: string;
	}

	let { viewMode = "players", style = "" }: Props = $props();

	let expanded = $state(false);
	let isGainedDaysCustom = $state(false);
	let maxDays = $derived(
		getDaysBetweenDates(addDays(new Date(MIN_DATE), 1).valueOf(), new Date(page.params.date || MIN_DATE).valueOf())
	);
	// TODO
	// $effect(() => {viewMode == "gains" && handleGainsTimeFrameNavigation($rankingSettings.gainedDays)});
	// TODO idk gainesScores reset to -1

	const switchStyle = "width: 100%; justify-content: space-between; align-items: center;";
	const gainsTimeFrames = {
		1: "1 Day",
		7: "1 Week",
		14: "2 Weeks",
		30: "1 Month",
		90: "3 Months",
		180: "6 Months",
		364: "1 Year",
		[maxDays]: "Maximum",
		Custom: "Custom"
	};

	$rankingSettings.countryFilter = new Set<string>(page.params.country?.split(",")?.filter(it => it && it != "all"));

	function checkAndSetIsGainedDaysCustom(days = $rankingSettings.gainedDays) {
		return (isGainedDaysCustom = !days || gainsTimeFrames[days] == null);
	}

	function handleGainsTimeFrame(e: Event) {
		const target = e.target as HTMLSelectElement;
		const days = parseInt(target.value);
		if (!checkAndSetIsGainedDaysCustom(days)) $rankingSettings.gainedDays = days;
	}

	function handleGainsTimeFrameNavigation(days: number) {
		console.log("handleGainsTimeFrameNavigation", days); // TODO
		if (!browser) return;
		goto(getRankingUrl(page.params as any, page.url, "gains", "osu", days), {
			invalidateAll: false,
			keepFocus: true,
			noScroll: true
		});
	}

	function handleCountryFilterChange() {
		if (!browser) return;
		goto(
			getRankingUrl(
				{ ...page.params, country: [...($rankingSettings.countryFilter ?? [])].join(",") } as any,
				page.url,
				viewMode as "players" | "gains",
				"osu",
				$rankingSettings.gainedDays
			),
			{ noScroll: true }
		);
	}

	onMount(() => checkAndSetIsGainedDaysCustom());
	// TODO: this hits the server twice - once for the date change, once for the gainedDays change.
	// can probably be optimized by having the date change also update the gainedDays param to maxDays if it's currently out of range
	// ALSO change the gainedDays when navigating into the future, not just backwards like here
	onNavigate(() => {
		if ($rankingSettings.gainedDays > maxDays) $rankingSettings.gainedDays = maxDays;
	});
</script>

<div class="wrapper" {style}>
	<button
		class:expanded
		class="btn-icon"
		type="button"
		onclick={() => (expanded = !expanded)}
		aria-label="Ranking settings">
		<icon class="settings" style="transform: rotate({expanded ? 45 : 0}deg);"></icon>
	</button>

	{#if expanded}
		<div class="column background" transition:slide={{ duration: 200, axis: "y" }}>
			{#if viewMode != "countries"}
				<Switch labelOrientation="row" style={switchStyle} bind:checked={$rankingSettings.avatars}>
					{#snippet before()}
						<span>Avatars</span>
					{/snippet}
				</Switch>
			{/if}
			{#if viewMode == "players"}
				<Switch labelOrientation="row" style={switchStyle} bind:checked={$rankingSettings.scoreDifferences}>
					{#snippet before()}
						<span>Score differences</span>
					{/snippet}
				</Switch>
			{/if}
			{#if viewMode != "mostGained"}
				<Switch labelOrientation="row" style={switchStyle} bind:checked={$rankingSettings.dateSticky}>
					{#snippet before()}
						<span>Sticky date bar</span>
					{/snippet}
				</Switch>
			{/if}
			{#if viewMode == "players" || viewMode == "gains"}
				<label class="row" style={switchStyle}>
					<span>Players per page</span>
					<select class="input-dark normal-size" bind:value={$rankingSettings.perPage}>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
						<option value={100}>100</option>
						<option value={Infinity}>All</option>
					</select>
				</label>

				<MultiSelectDropdown
					options={COUNTRIES}
					bind:selected={$rankingSettings.countryFilter}
					placeholder="Country filter ({$rankingSettings.countryFilter.size})"
					onBlur={handleCountryFilterChange}>
					{#snippet optionComponent({ value, label, onchange })}
						<label>
							<input type="checkbox" class="no-appearance" {value} {onchange} />
							<RankingFlag countryCode={value} tooltipContent={label} />
							{label}
						</label>
					{/snippet}
				</MultiSelectDropdown>
			{/if}
			<!-- TODO: rank range filter -->
			{#if viewMode == "gains"}
				<label>
					Gains time frame
					<select class="input-dark normal-size" onchange={e => handleGainsTimeFrame(e)}>
						{#each Object.entries(gainsTimeFrames) as [days, label]}
							<option value={days}>{label}</option>
						{/each}
					</select>

					{#if isGainedDaysCustom}
						<!-- TODO probably debounce like UserSearch.svelte -->
						<label>
							<input
								class="input-dark normal-size"
								type="number"
								min="1"
								max={maxDays}
								bind:value={$rankingSettings.gainedDays} />
							days
						</label>
					{/if}
				</label>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 8px;
		gap: 6px;
	}
	.background {
		background-color: rgba(0, 0, 0, 0.2);
		min-width: 15svw;
		padding: 12px;
		border-radius: 8px;
		align-items: flex-start;
		gap: 8px;
	}

	select {
		width: max-content;
	}

	.btn-icon {
		font-size: 1.75em;
		padding: 8px;
		color: var(--color-lighter);
	}
	.btn-icon:focus {
		box-shadow: none;
	}
	button.expanded {
		background-color: rgba(0, 0, 0, 0.2);
		margin-bottom: -6px;
		opacity: 1;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	icon.settings {
		transition: transform 0.2s;
	}
</style>
