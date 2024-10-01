<script lang="ts">
  import {
    COUNTRIES,
    formatDate,
    getAvatarURL,
    getOsuProfileURL,
    MAX_CHART_PLAYERS,
    MIN_DATE,
    SCORE_CATEGORIES,
    tooltip
  } from "$lib/util";
  import type { PageData } from "../$types";
  //   import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { afterNavigate, goto } from "$app/navigation";
  import UserSearch from "$lib/components/UserSearch.svelte";
  import PlayerComparisonChart from "$lib/components/Player/PlayerComparisonChart.svelte";
  import { fade, fly, slide } from "svelte/transition";
  import Loader from "$lib/components/Loader.svelte";

  export let data: PageData;
  let loading = false;
  let playersPanelVisible = true;
  let category = ($page.params.category || "top50") as App.RankingCategory;
  let dateFrom = $page.params.dateRange?.split(" ")?.[0];
  let dateTo = $page.params.dateRange?.split(" ")?.[1];
  let comparePlayerName: string;

  const comparePlayerSearch = ({ _id, name }: { _id?: number; name: string }) => {
    if (!_id) return false;
    const idsOrNames = $page.params.idsOrNames ? $page.params.idsOrNames + "," : "";
    refreshUrl(idsOrNames + _id);
    comparePlayerName = "";
  };

  const refreshUrl = (
    idsOrNames = $page.params.idsOrNames,
    newCategory = category,
    newDateFrom = dateFrom,
    newDateTo = dateTo
  ) => {
    loading = true;
    const rangeString = newDateFrom || newDateTo ? `/${newDateFrom ?? ""} ${newDateTo ?? ""}` : "";
    goto(`/osu/players/${idsOrNames}/${newCategory ?? ""}${rangeString}`);
  };

  afterNavigate(() => (loading = false));
</script>

<svelte:head>
  <title>score chart - poggers</title>
</svelte:head>

<main class="flex-fill row">
  <div class="chart-container flex-fill">
    <PlayerComparisonChart {data} {category} />
  </div>

  <aside class="column" class:collapsed={!playersPanelVisible}>
    {#if loading}
      <div class="overlay" transition:fade>
        <Loader />
      </div>
    {/if}

    <span class="row" style="align-items: center; gap: 10px;">
      <button
        type="button"
        class="btn-icon"
        use:tooltip={{ content: "Toggle players panel" }}
        on:click={() => (playersPanelVisible = !playersPanelVisible)}>
        <icon class={playersPanelVisible ? "expand-left" : "expand-right"} />
      </button>
      {#if playersPanelVisible}
        Compare players
      {/if}
    </span>
    {#if playersPanelVisible}
      <div class="column" style="height: 100%;" transition:slide={{ axis: "x", duration: 200 }}>
        <form class="aside-inputs-container">
          <UserSearch
            bind:value={comparePlayerName}
            gotoPlayer={comparePlayerSearch}
            disabled={data?.players?.length >= MAX_CHART_PLAYERS}
            style="margin-top: 4px;" />

          <span class="date-inputs-wrapper">
            <input
              class="input-dark normal-size"
              min={MIN_DATE}
              max={dateTo || formatDate(new Date(), true)}
              title="Beginning of date range"
              type="date"
              bind:value={dateFrom}
              on:change={() => refreshUrl()} />
            <span>to</span>
            <input
              class="input-dark normal-size"
              min={dateFrom || MIN_DATE}
              max={formatDate(new Date(), true)}
              title="End of date range"
              type="date"
              bind:value={dateTo}
              on:change={() => refreshUrl()} />
          </span>

          <select
            class="input-dark normal-size"
            title="Score category"
            bind:value={category}
            on:change={() => refreshUrl()}>
            {#each SCORE_CATEGORIES as cat}
              <option>{cat}</option>
            {/each}
          </select>

          <hr />
        </form>

        <!-- TODO: UI for color picker, removing players, stats -->
        <ul class="players-container ul column">
          {#each data.players as player (player.id)}
            <li style="--color: {player.color};" transition:fly={{ x: -100, duration: 200 }}>
              <div class="player-entry-info-container">
                <a
                  class="osu-avatar-small"
                  href={getOsuProfileURL(player._id)}
                  target="_blank"
                  rel="noreferrer"
                  use:tooltip={{ content: "osu! profile" }}
                  style="display: block;">
                  <img
                    class="osu-avatar-small"
                    height="36"
                    width="36"
                    draggable="false"
                    alt=""
                    src={getAvatarURL(player.id)} />
                </a>
                <span>{player.name}</span>
                <img
                  class="osu-flag-smaller unselectable"
                  height="24"
                  alt={player.country}
                  src={`/flags/${player.country}.svg`}
                  use:tooltip={{ content: COUNTRIES[player.country] || player.country }} />
              </div>
              <div class="player-entry-button-container">
                <button
                  type="button"
                  class="btn-icon"
                  class:active={player.rankVisible || player.rankVisible == null}
                  use:tooltip={{ content: "Toggle ranks" }}
                  on:click={() =>
                    (player.rankVisible =
                      player.rankVisible != null && player.rankVisible == false)}>
                  <icon class="hash" />
                </button>
                <button
                  type="button"
                  class="btn-icon"
                  class:active={player.scoresVisible || player.scoresVisible == null}
                  use:tooltip={{ content: "Toggle scores" }}
                  on:click={() =>
                    (player.scoresVisible =
                      player.scoresVisible != null && player.scoresVisible == false)}>
                  {category.substring(3)}
                </button>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </aside>
</main>

<style>
  main {
    padding: 12px;
  }

  .chart-container {
    position: relative;
    height: 100%;
    margin-right: 12px;
    border-radius: 12px;
    background-color: var(--color-darkish);
    overflow: hidden;
  }

  aside:not(.collapsed) {
    position: relative;
    border-radius: 12px;
    min-width: 14.5rem;
  }
  aside .btn-icon icon {
    color: var(--color-lighter);
    font-size: 1.5rem;
  }
  .aside-inputs-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .aside-inputs-container hr {
    margin-top: 0;
  }
  .date-inputs-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 3px;
  }
  .date-inputs-wrapper input {
    flex-grow: 1;
  }
  .players-container {
    margin-top: auto;
    gap: 6px;
    overflow: hidden auto;
  }
  .players-container li {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: 2rem;
    padding: 6px;
    border-radius: 6px;
    background: linear-gradient(150deg, var(--color-darkish) 55%, var(--color));
  }
  .player-entry-info-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .player-entry-button-container {
    display: flex;
    gap: 6px;
  }
  .player-entry-button-container button {
    color: inherit;
    opacity: 0.333;
    font-weight: 500;
    padding: 6px;
    border-radius: 6px;
  }
  .player-entry-button-container button icon {
    font-size: 1rem;
  }
  .player-entry-button-container button.active {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }
  .overlay {
    --color-base: 0, 0, 0;
    position: absolute;
  }

  /* @media screen and (max-width: 40rem) {
  } */
</style>
