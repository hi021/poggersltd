<script lang="ts">
  import {
    COUNTRIES,
    formatDate,
    getAvatarURL,
    getOsuProfileURL,
    isRangeContainedWithin,
    MAX_CHART_PLAYERS,
    MIN_DATE,
    SCORE_CATEGORIES,
    tooltip
  } from "$lib/util";
  import PlayerComparisonDialog from "$lib/components/Player/PlayerComparisonDialog.svelte";
  import PlayerComparisonChart from "$lib/components/Player/PlayerComparisonChart.svelte";
  import UserSearch from "$lib/components/UserSearch.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import { afterNavigate, goto, replaceState, pushState } from "$app/navigation";
  import {
    _mergePlayerRanksIntoExistingArray,
    _processResult,
    _setExistingPlayerColors
  } from "./+page";
  import { fade, fly, slide } from "svelte/transition";
  import { quartOut } from "svelte/easing";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  export let data: PageData;
  const now = formatDate(new Date(), true);

  let loading = false;
  let playersPanelVisible = true;
  let category = ($page.params.category || "top50") as App.RankingCategory;
  let currentRange: App.DateRange = {
    start: $page.params.dateRange?.split(" ")?.[0],
    end: $page.params.dateRange?.split(" ")?.[1]
  };
  let previousRange = { ...currentRange };
  let comparePlayerName: string;
  let editingPlayerIndex: number | null = null;
  let userSearchComponent: UserSearch;

  const comparePlayerSearch = ({ _id, name }: { _id?: number; name: string }) => {
    if (!_id) return false;

    addPlayers([_id.toString()]);
    comparePlayerName = "";
    return true;
  };

  const getCurrentPlayerIdsString = (addIds?: Array<number | string>) => {
    const currentIds = new Set<string | number>(addIds?.length ? addIds : null);
    for (const player of data.players) currentIds.add(player.id);

    return [...currentIds].join(",");
  };

  const getDateRangeString = (start?: string, end?: string) =>
    start || end ? `/${start ?? ""} ${end ?? ""}` : "";

  const updateUrl = (
    args: Partial<{
      idsOrNames: string;
      category: string;
      dateFrom: string;
      dateTo: string;
      replaceState: boolean;
      reloadData: boolean;
    }>
  ) => {
    const idsOrNames = args.idsOrNames == null ? getCurrentPlayerIdsString() : args.idsOrNames;
    const newCategory = args.category == null ? category : args.category;
    const dateFrom = args.dateFrom == null ? currentRange.start : args.dateFrom;
    const dateTo = args.dateTo == null ? currentRange.end : args.dateTo;
    const toReplaceState = args.replaceState == null ? true : args.replaceState;
    const reloadData = args.reloadData == null ? false : args.reloadData;

    loading = true;
    if (!idsOrNames) return goto("/osu/players", { replaceState: toReplaceState });

    const rangeString = getDateRangeString(dateFrom, dateTo);
    const categoryString = rangeString || newCategory ? `/${newCategory ?? ""}` : "";
    const newUrl = `/osu/players/${idsOrNames}${categoryString}${rangeString}`;

    if (reloadData) {
      goto(newUrl, { replaceState: toReplaceState, keepFocus: true });
      return;
    } else if (toReplaceState) replaceState(newUrl, $page.params);
    else pushState(newUrl, $page.params);

    loading = false;
  };

  const removePlayer = (id: string) => {
    editingPlayerIndex = null;
    data.players = data.players.filter((player) => player.id != id);
    if (!data.players.length) return clearPlayers();

    for (const i in data.ranks) delete (data.ranks as any)[i][id];
    const idsOrNames: string = data.players.reduce(
      (idsOrNames, player) => idsOrNames + player.id + ",",
      ""
    );

    updateUrl({ idsOrNames: idsOrNames.slice(0, idsOrNames.length - 1) });
  };

  const clearPlayers = () => updateUrl({ idsOrNames: "" });

  const addPlayers = async (ids: Array<number | string>) => {
    loading = true;
    const rangeString = getDateRangeString(currentRange.start, currentRange.end);

    const res = await fetch(
      `/api/players/${ids.join(",")}/${category}${rangeString}?setColors=false`
    );
    const resJson: App.ComparisonChartAPI = await res.json();
    const resJsonProcessed = _processResult(resJson);

    if (resJsonProcessed?.players?.length) {
      updateUrl({ idsOrNames: getCurrentPlayerIdsString(ids), reloadData: false });
      const playersMerged = [...data.players, ...resJsonProcessed.players];
      _setExistingPlayerColors(playersMerged);

      data = {
        players: playersMerged,
        ranks: _mergePlayerRanksIntoExistingArray(resJsonProcessed.ranks, data.ranks)
      };
    }

    loading = false;
  };

  const onDateChange = () => {
    const reloadData = !isRangeContainedWithin(currentRange, previousRange, now);
    previousRange = { ...currentRange };
    updateUrl({ dateFrom: currentRange.start, dateTo: currentRange.end, reloadData });
  };

  const compareNeighbors = async (id: string) => {
    if (loading) return;
    loading = true;

    const res = await fetch(`/api/player/${id}/neighbors/${category}`);
    const resJson: number[] = await res.json();
    if (!resJson?.length) {
      loading = false;
      return;
    }

    addPlayers(resJson);
  };

  afterNavigate(() => {
    loading = false;
    userSearchComponent?.focusInput();
  });
</script>

<svelte:head>
  <title>score chart - poggers</title>
</svelte:head>

<main class="flex-fill row column-width-640">
  <div class="chart-container flex-fill">
    <PlayerComparisonChart {data} {category} />
  </div>

  <aside class="column" class:collapsed={!playersPanelVisible}>
    {#if loading}
      <div class="overlay" transition:fade={{ easing: quartOut, duration: 150 }}>
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
      <div
        class="column scrollbar-small"
        style="height: calc(100% - 1.5rem);"
        transition:slide={{ axis: "x", duration: 200 }}>
        {#if editingPlayerIndex != null}
          <PlayerComparisonDialog
            bind:player={data.players[editingPlayerIndex]}
            {editingPlayerIndex}
            {category}
            verticalIndex={Math.min(11, data.players.length - 1 - (editingPlayerIndex ?? 0))}
            on:remove={(e) => removePlayer(e.detail)}
            on:close={() => (editingPlayerIndex = null)}
            on:goToProfile={(e) => goto(`/osu/player/${e.detail}`)}
            on:compareNeighbors={(e) => compareNeighbors(e.detail)} />
        {/if}

        <form class="aside-inputs-container">
          <UserSearch
            bind:value={comparePlayerName}
            bind:this={userSearchComponent}
            gotoPlayer={comparePlayerSearch}
            disabled={loading || data?.players?.length >= MAX_CHART_PLAYERS}
            style="margin-top: 4px;" />

          <span class="date-inputs-wrapper">
            <input
              class="input-dark normal-size"
              min={MIN_DATE}
              max={currentRange.end || now}
              title="Beginning of date range"
              type="date"
              disabled={loading}
              on:change={onDateChange}
              bind:value={currentRange.start} />
            <span>to</span>
            <input
              class="input-dark normal-size"
              min={currentRange.start || MIN_DATE}
              max={now}
              title="End of date range"
              type="date"
              disabled={loading}
              on:change={onDateChange}
              bind:value={currentRange.end} />
          </span>

          <select
            class="input-dark normal-size"
            title="Score category"
            disabled={loading}
            bind:value={category}
            on:change={() => updateUrl({})}>
            {#each SCORE_CATEGORIES as cat}
              <option>{cat}</option>
            {/each}
          </select>

          <hr />

          {#if data.players?.length}
            <button
              type="button"
              class="btn-none clear-players-button"
              disabled={loading}
              on:click={clearPlayers}>
              Clear all players
            </button>
          {/if}
        </form>

        <ul class="players-container ul column">
          {#each data.players as player, i (player.id)}
            <li style="--color: {player.color};" transition:fly={{ x: -100, duration: 200 }}>
              <div class="player-entry-info-container">
                <a
                  class="osu-avatar-small"
                  href={getOsuProfileURL(player.id)}
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
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a
                  class="a player-name-wrapper"
                  href="#"
                  on:click={() =>
                    (editingPlayerIndex =
                      editingPlayerIndex != i || editingPlayerIndex == null ? i : null)}>
                  <span>{player.name}</span>
                  <img
                    class="osu-flag-smaller unselectable"
                    height="24"
                    alt={player.country}
                    src={`/flags/${player.country}.svg`}
                    use:tooltip={{ content: COUNTRIES[player.country] || player.country }} />
                </a>
              </div>

              <div class="player-entry-button-container">
                <button
                  type="button"
                  class="btn-icon"
                  class:active={player.rankVisible || player.rankVisible == null}
                  disabled={loading}
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
                  disabled={loading}
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
    gap: 12px;
  }
  .chart-container {
    position: relative;
    height: 100%;
    min-height: 70svh;
    border-radius: 12px;
    background-color: var(--color-darkish);
    overflow: hidden;
  }

  aside {
    position: relative;
    max-height: calc(100svh - 9.2rem);
    border-radius: 12px;
  }
  aside:not(.collapsed) {
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
    margin: 0 10px;
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
  .clear-players-button {
    color: inherit;
    width: fit-content;
    padding-right: 12px;
    margin-left: auto;
    margin-bottom: 8px;
  }
  .clear-players-button:hover {
    color: var(--color-active);
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
    flex-wrap: nowrap;
    text-wrap: nowrap;
    min-width: 2rem;
    padding: 6px;
    border-radius: 6px;
    background: linear-gradient(150deg, var(--color-darkish) 55%, var(--color));
  }
  .player-entry-info-container {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 8px;
  }
  .player-name-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    line-height: 2.25;
  }
  .player-entry-button-container {
    display: flex;
    gap: 6px;
  }
  .player-entry-button-container button {
    color: inherit;
    opacity: 0.45;
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
</style>
