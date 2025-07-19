<script lang="ts">
  import { addDays, getDaysBetweenDates, getRankingUrl } from "$lib/util";
  import { COUNTRIES, MIN_DATE } from "$lib/constants";
  import { browser } from "$app/environment";
  import { slide } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import Switch from "../Switch.svelte";
  import MultiSelectDropdown from "../MultiSelectDropdown.svelte";

  interface Props {
    viewMode?: "players" | "countries" | "gains" | "mostGained";
    settings: App.RankingSettings;
    style?: string;
  }

  let { viewMode = "players", settings = $bindable(), style = "" }: Props = $props();

  let expanded = $state(false);
  let isGainedDaysCustom = $state(false);
  const maxDays = getDaysBetweenDates(
    addDays(new Date(MIN_DATE), 1).valueOf(),
    new Date(page.params.date).valueOf()
  );
  const switchStyle = "width: 100%; justify-content: space-between; align-items: center;";

  // TODO: make maxDays refresh
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

  // TODO set from url
  console.log(page.state);
  console.log(page.url);
  settings.countryFilter = new Set<string>();

  function checkAndSetIsGainedDaysCustom(days = settings.gainedDays) {
    return (isGainedDaysCustom = !days || gainsTimeFrames[days] == null);
  }

  function handleGainsTimeFrame(e: Event) {
    const target = e.target as HTMLSelectElement;
    const days = parseInt(target.value);
    settings.gainedDays = checkAndSetIsGainedDaysCustom(days) ? 1 : days;
    handleGainsTimeFrameNavigation(settings.gainedDays);
  }

  function handleGainsTimeFrameNavigation(days: number) {
    console.log(days); // TODO
    if (browser)
      goto(getRankingUrl(page.params as any, "gains", "osu", days), { invalidateAll: false });
  }

  function handleCountryFilterChange() {
    console.log(
      getRankingUrl(
        { ...page.params, country: [...(settings.countryFilter ?? [])].join(",") } as any,
        viewMode as "players" | "gains",
        "osu",
        settings.gainedDays
      )
    ); // TODO remove log...
    if (browser)
      goto(
        getRankingUrl(
          { ...page.params, country: [...(settings.countryFilter ?? [])].join(",") } as any,
          viewMode as "players" | "gains",
          "osu",
          settings.gainedDays
        )
      );
  }

  onMount(() => checkAndSetIsGainedDaysCustom());
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
        <Switch labelOrientation="row" style={switchStyle} bind:checked={settings.avatars}>
          {#snippet before()}
            <span>Avatars</span>
          {/snippet}
        </Switch>
      {/if}
      {#if viewMode == "players"}
        <Switch labelOrientation="row" style={switchStyle} bind:checked={settings.scoreDifferences}>
          {#snippet before()}
            <span>Score differences</span>
          {/snippet}
        </Switch>
      {/if}
      {#if viewMode != "mostGained"}
        <Switch labelOrientation="row" style={switchStyle} bind:checked={settings.dateSticky}>
          {#snippet before()}
            <span>Sticky date bar</span>
          {/snippet}
        </Switch>
      {/if}
      {#if viewMode == "players" || viewMode == "gains"}
        <label class="row" style={switchStyle}>
          <span>Players per page</span>
          <select class="input-dark normal-size" bind:value={settings.perPage}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={Infinity}>All</option>
          </select>
        </label>

        <MultiSelectDropdown
          options={COUNTRIES}
          bind:selected={settings.countryFilter}
          placeholder="Country filter ({settings.countryFilter.size})"
          onBlur={handleCountryFilterChange}>
          {#snippet optionComponent({ value, label, onchange })}
            <label>
              <input type="checkbox" class="no-appearance" {value} {onchange} />
              <img class="osu-flag-small" alt={value} src="/flags/{value}.svg" />
              {label}
            </label>
          {/snippet}
        </MultiSelectDropdown>
      {/if}
      <!-- TODO: ranks filter and countries filter -->
      {#if viewMode == "gains"}
        <label>
          Gains time frame
          <select class="input-dark normal-size" onchange={(e) => handleGainsTimeFrame(e)}>
            {#each Object.entries(gainsTimeFrames) as [days, label]}
              <option value={days}>{label}</option>
            {/each}
          </select>

          {#if isGainedDaysCustom}
            <label>
              <input type="number" min="1" max={maxDays} bind:value={settings.gainedDays} />
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
