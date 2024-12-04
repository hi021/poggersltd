<script lang="ts">
  import { CHART_COLORS, formatNumber, getDaysBetweenDates, tooltip } from "$lib/util";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher<{ remove: string; close: void; compareNeighbors: void }>();
  let editPlayerDialog: HTMLDialogElement;

  export let player: App.ComparisonChartPlayerCustomizable & {
    stats: App.PlayerProfileStatsWithDates;
  };
  export let category: App.RankingCategory;
  export let editingPlayerIndex: number;
  export let verticalIndex = 0;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return dispatch("close");
  };
  const onMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!editPlayerDialog.contains(target)) return dispatch("close");
  };

  onMount(() => {
    addEventListener("keydown", onKeyDown);
    addEventListener("mousedown", onMouseDown);

    return () => {
      removeEventListener("keydown", onKeyDown);
      removeEventListener("mousedown", onMouseDown);
    };
  });
</script>

<dialog
  open
  class="edit-player-dialog"
  bind:this={editPlayerDialog}
  style="--index: {verticalIndex};">
  <h3>
    <span>
      {player.name}
      <small
        style="font-weight: 400;"
        use:tooltip={{ content: `${category}s count on ${player.stats.endDate}` }}
        >({formatNumber(player.stats.endScores)})</small>
    </span>
    <form method="dialog">
      <button type="button" class="btn-icon" on:click={() => dispatch("close")}
        ><icon class="close" /></button>
    </form>
  </h3>

  <span class="color-container">
    <label>
      <input type="color" bind:value={player.color} />
      {player.color}
    </label>
    <button
      class="btn-icon"
      use:tooltip={{ content: "Reset color" }}
      on:click={() =>
        (player.color = CHART_COLORS[(editingPlayerIndex ?? 0) % CHART_COLORS.length])}
      ><icon class="undo" /></button>
  </span>

  <ul class="player-stats-container ul">
    <li>
      <span class="player-stat-name"> peak scores </span>
      <span class="player-stat-value">
        {formatNumber(player.stats.maxScores)}
      </span>
    </li>
    <li>
      <span class="player-stat-name"> lowest scores </span>
      <span class="player-stat-value">
        {formatNumber(player.stats.minScores)}
      </span>
    </li>
    <li>
      <span class="player-stat-name"> change </span>
      <span class="player-stat-value">
        {(player.stats.endScores > player.stats.startScores ? "+" : "") +
          formatNumber(player.stats.endScores - player.stats.startScores)}
        <small>
          ({Math.round(
            ((player.stats?.endScores - player.stats?.startScores) /
              getDaysBetweenDates(
                new Date(player.stats.startDate).valueOf(),
                new Date(player.stats.endDate).valueOf()
              )) *
              100
          ) / 100}/day)
        </small>
      </span>
    </li>
    <li>
      <span class="player-stat-name"> peak rank </span>
      <span class="player-stat-value">#{formatNumber(player.stats.minRank, ",")}</span>
    </li>
    <li>
      <span class="player-stat-name"> lowest rank </span>
      <span class="player-stat-value">#{formatNumber(player.stats.maxRank, ",")}</span>
    </li>
  </ul>

  <button
    type="button"
    use:tooltip={{ content: "Compare against neighbors" }}
    on:click={() => dispatch("compareNeighbors")}>
    <icon class="" />
  </button>

  <button
    type="button"
    class="btn-none remove-player-button"
    on:click={() => dispatch("remove", player.id)}>
    Remove player <icon class="delete" />
  </button>
</dialog>

<style>
  .edit-player-dialog {
    --index: 0;
    width: 100%;
    left: -210%;
    bottom: calc(var(--index) * 4%);
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
    cursor: default;
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
    background-color: var(--color-red);
  }

  .btn-icon {
    color: inherit;
    font-size: 1.25rem;
  }

  @media (width <= 40rem) {
    .edit-player-dialog {
      width: 96%;
      top: 1.6rem;
      left: 0;
      outline: 1px solid var(--color-light);
    }
  }
</style>
