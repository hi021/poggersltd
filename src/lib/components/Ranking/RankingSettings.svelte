<script lang="ts">
  import { slide } from "svelte/transition";
  import Switch from "../Switch.svelte";
  import { addDays, getDaysBetweenDates } from "$lib/util";
  import { _getGainsRankingUrl } from "../../../routes/(navgroup)/osu/(secondarynav)/ranking/gains/[date]/[[category]]/[[country]]/[[ranks]]/[...extra]/+page";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import { COUNTRIES, MIN_DATE } from "$lib/constants";
  import MultiSelectDropdown from "../MultiSelectDropdown.svelte";

  export let viewMode: "players" | "countries" | "gains" | "mostGained" = "players";
  export let settings: App.RankingSettings;
  export let style = "";

  let visible = false;
  let isGainedDaysCustom: boolean;
  const maxDays = getDaysBetweenDates(
    addDays(new Date(MIN_DATE), 1).valueOf(),
    new Date(page.params.date).valueOf()
  );

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
    console.log(days);
    if (browser)
      goto(_getGainsRankingUrl(page.params as any, days, "osu"), { invalidateAll: false });
  }

  onMount(() => checkAndSetIsGainedDaysCustom());
</script>

<div class="wrapper" {style}>
  <button class="btn-icon" type="button" on:click={() => (visible = !visible)} aria-label="Ranking settings">
    <icon class="settings" style="transform: rotate({visible ? 45 : 0}deg);"></icon>
  </button>

  {#if visible}
    <div class="column background" transition:slide={{ duration: 200, axis: "y" }}>
      {#if viewMode != "countries"}
        <Switch bind:checked={settings.avatars}>
          <span slot="before">Avatars</span>
        </Switch>
      {/if}
      {#if viewMode == "players"}
        <Switch bind:checked={settings.scoreDifferences}>
          <span slot="before">Score differences</span>
        </Switch>
      {/if}
      {#if viewMode != "mostGained"}
        <Switch bind:checked={settings.dateSticky}>
          <span slot="before">Sticky date bar</span>
        </Switch>
      {/if}
      {#if viewMode == "players" || viewMode == "gains"}
        <label>
          Players per page
          <select class="input-dark normal-size" bind:value={settings.perPage}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={Infinity}>All</option>
          </select>
        </label>

        <MultiSelectDropdown options={COUNTRIES}>
          {#snippet optionComponent({value, label})}
            <label
              ><input type="checkbox" {value} /><img
                class="osu-flag-small"
                alt={value}
                src="/flags/{value}.svg" />{label}
            </label>
          {/snippet}
        </MultiSelectDropdown>
      {/if}
      <!-- TODO: ranks filter and countries filter -->
      {#if viewMode == "gains"}
        <label>
          Gains time frame
          <select class="input-dark normal-size" on:change={(e) => handleGainsTimeFrame(e)}>
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

  label {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  select {
    width: max-content;
  }

  .btn-icon {
    font-size: 1.75em;
    color: var(--color-lighter);
  }
  .btn-icon:focus {
    box-shadow: none;
  }
  icon.settings {
    transition: transform 0.2s;
  }
</style>
