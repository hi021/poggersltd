<script lang="ts">
  import {
    CHART_COLORS,
    COUNTRIES,
    formatDate,
    formatNumber,
    getAvatarURL,
    getDaysBetweenDates,
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
  let editingPlayerIndex: number | null = null;
  let editPlayerDialogElement: HTMLDialogElement;

  $: if (editingPlayerIndex != null) editPlayerDialogElement.show();
  else if (editPlayerDialogElement) editPlayerDialogElement.close();

  const comparePlayerSearch = ({ _id, name }: { _id?: number; name: string }) => {
    if (!_id) return false;
    const idsOrNames = $page.params.idsOrNames ? $page.params.idsOrNames + "," : "";
    refreshUrl(idsOrNames + _id);
    comparePlayerName = "";
  };

  const refreshUrl = (
    idsOrNames = $page.params.idsOrNames,
    newCategory: string = category,
    newDateFrom = dateFrom,
    newDateTo = dateTo,
    replaceState = false
  ) => {
    loading = true;
    if (!idsOrNames) goto("/osu/players", { replaceState });

    const rangeString = newDateFrom || newDateTo ? `/${newDateFrom ?? ""} ${newDateTo ?? ""}` : "";
    const categoryString = rangeString || newCategory ? `/${newCategory ?? ""}` : "";
    goto(`/osu/players/${idsOrNames}${categoryString}${rangeString}`, { replaceState });
  };

  const removePlayer = (id: string) => {
    data.players = data.players.filter((player) => player.id != id);
    if (!data.players.length) return clearPlayers();

    for (const i in data.ranks) delete data.ranks[i][id];

    const idsOrNames: string = data.players.reduce(
      (idsOrNames, player) => idsOrNames + player.id + ",",
      ""
    );
    refreshUrl(idsOrNames.slice(0, idsOrNames.length - 1), undefined, undefined, undefined, true);
    editingPlayerIndex = null;
  };

  const clearPlayers = () => refreshUrl("", "", "", "");

  afterNavigate(() => (loading = false));
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

          {#if data.players?.length}
            <button type="button" class="btn-none clear-players-button" on:click={clearPlayers}
              >Clear all players</button>
          {/if}
        </form>

        <ul class="players-container ul column">
          <dialog
            class="edit-player-dialog"
            style="--index: {data.players.length - 1 - (editingPlayerIndex ?? 0)};"
            bind:this={editPlayerDialogElement}>
            {#if editingPlayerIndex != null}
              <h3>
                {data.players[editingPlayerIndex].name}
                <form method="dialog">
                  <button type="submit" class="btn-icon"><icon class="close" /></button>
                </form>
              </h3>

              <span class="color-container">
                <label>
                  <input type="color" bind:value={data.players[editingPlayerIndex].color} />
                  {data.players[editingPlayerIndex].color}
                </label>
                <button
                  class="btn-icon"
                  use:tooltip={{ content: "Reset color" }}
                  on:click={() =>
                    (data.players[editingPlayerIndex].color =
                      CHART_COLORS[(editingPlayerIndex ?? 0) % CHART_COLORS.length])}
                  ><icon class="undo" /></button>
              </span>

              <ul class="player-stats-container ul">
                <li>
                  <span class="player-stat-name"> peak scores </span>
                  <span class="player-stat-value">
                    {formatNumber(data.players[editingPlayerIndex].stats.maxScores)}
                  </span>
                </li>
                <li>
                  <span class="player-stat-name"> lowest scores </span>
                  <span class="player-stat-value">
                    {formatNumber(data.players[editingPlayerIndex].stats.minScores)}
                  </span>
                </li>
                <li>
                  <span class="player-stat-name"> change </span>
                  <span class="player-stat-value">
                    {formatNumber(
                      data.players[editingPlayerIndex].stats.endScores -
                        data.players[editingPlayerIndex].stats.startScores
                    )}
                    <small>
                      ({Math.round(
                        ((data.players[editingPlayerIndex].stats.endScores -
                          data.players[editingPlayerIndex].stats.startScores) /
                          getDaysBetweenDates(
                            new Date(data.players[editingPlayerIndex].stats.startDate).valueOf(),
                            new Date(data.players[editingPlayerIndex].stats.endDate).valueOf()
                          )) *
                          100
                      ) / 100}/day)
                    </small>
                  </span>
                </li>
                <li>
                  <span class="player-stat-name"> peak rank </span>
                  <span class="player-stat-value"
                    >#{formatNumber(data.players[editingPlayerIndex].stats.minRank, ",")}</span>
                </li>
                <li>
                  <span class="player-stat-name"> lowest rank </span>
                  <span class="player-stat-value"
                    >#{formatNumber(data.players[editingPlayerIndex].stats.maxRank, ",")}</span>
                </li>
              </ul>

              <button
                type="button"
                class="btn-none remove-player-button"
                on:click={() => removePlayer(data.players[editingPlayerIndex].id)}
                >Remove player <icon class="delete" /></button>
            {/if}
          </dialog>

          {#each data.players as player, i (player.id)}
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
                <!-- svelte-ignore a11y-invalid-attribute -->
                <a
                  class="a player-name-wrapper"
                  href=""
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

  .edit-player-dialog {
    --index: 0;
    width: 100%;
    left: -210%;
    bottom: calc(var(--index) * 2.5rem);
    color: var(--color-lighter);
    background-color: color-mix(in srgb, var(--color-darker) 80%, transparent);
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 12px;
    border: none;
    z-index: 1;
  }
  .edit-player-dialog h3 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    margin-bottom: 16px;
  }
  .edit-player-dialog h3 > form {
    line-height: 0;
  }
  .player-stats-container {
    margin-top: 4px;
  }
  .player-stats-container > li {
    padding: 2px;
    border-radius: 0;
  }
  .player-stats-container small {
    font-size: 60%;
  }
  .color-container {
    display: flex;
    justify-content: space-between;
  }
  .color-container input[type="color"] {
    padding: 0;
    padding-block: 0;
    padding-inline: 0;
    border: none;
    background-color: var(--color-darkish);
    cursor: pointer;
  }
  .color-container > label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  .remove-player-button {
    width: 100%;
    color: inherit;
    justify-content: center;
    gap: 0.5ch;
    line-height: 1;
    padding: 4px;
    margin-top: 8px;
  }
  .remove-player-button:hover {
    background-color: brown;
  }

  /* @media screen and (max-width: 40rem) {
  } */
</style>
