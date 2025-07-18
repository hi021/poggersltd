<script lang="ts">
  import { CHART_COLORS } from "$lib/constants";
  import { formatNumber, getDaysBetweenDates, tooltip } from "$lib/util";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  // TODO test if events work
  //   const dispatch = createEventDispatcher<{
  //     remove: string;
  //     close: void;
  //     compareNeighbors: string;
  //     goToProfile: string;
  //   }>();
  let editPlayerDialog = $state() as HTMLDialogElement;

  interface Props {
    player: App.ComparisonChartPlayerCustomizable & {
      stats: App.PlayerProfileStatsWithDates;
    };
    category: App.RankingCategory;
    editingPlayerIndex: number;
    verticalIndex?: number;
    remove: (playerId: string) => void;
    close: () => void;
    compareNeighbors: (playerId: string) => void;
    goToProfile: (playerId: string) => void;
  }

  let {
    player = $bindable(),
    category,
    editingPlayerIndex,
    verticalIndex = 0,
    remove,
    close,
    compareNeighbors,
    goToProfile
  }: Props = $props();

  const days = getDaysBetweenDates(
    new Date(player.stats.startDate).valueOf(),
    new Date(player.stats.endDate).valueOf()
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return close();
  };
  const onMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      !editPlayerDialog.contains(target) &&
      !target?.classList.contains("player-name-wrapper") &&
      !target?.parentElement?.classList.contains("player-name-wrapper")
    )
      return close();
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
  transition:fly={{ x: 100, duration: 125 }}
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
      <button type="button" aria-label="Close" class="btn-icon" onclick={close}
        ><icon class="close"></icon></button>
    </form>
  </h3>

  <span class="color-container">
    <label>
      <input type="color" bind:value={player.color} />
      {player.color}
    </label>
    <button
      class="btn-icon"
      aria-label="Reset color"
      use:tooltip={{ content: "Reset color" }}
      onclick={() => (player.color = CHART_COLORS[(editingPlayerIndex ?? 0) % CHART_COLORS.length])}
      ><icon class="undo"></icon></button>
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
      <span class="player-stat-name"> change (over {days} days)</span>
      <span class="player-stat-value">
        {(player.stats.endScores > player.stats.startScores ? "+" : "") +
          formatNumber(player.stats.endScores - player.stats.startScores)}
        <small>
          ({Math.round(((player.stats?.endScores - player.stats?.startScores) / days) * 100) /
            100}/day)
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

  <div class="row btn-row">
    <button class="btn-icon" type="button" onclick={() => compareNeighbors(player.id)}>
      <small>Compare neighbors</small>
      <icon class="group"></icon>
    </button>

    <button class="btn-icon" type="button" onclick={() => goToProfile(player.id)}>
      <small>Go to profile</small>
      <icon class="user"></icon>
    </button>

    <button class="btn-icon remove-player-btn" type="button" onclick={() => remove(player.id)}>
      <small>Remove user</small>
      <icon class="delete"></icon>
    </button>
  </div>
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
    border: none;
    background-color: var(--color-darkish);
    cursor: pointer;
  }
  .color-container > label {
    display: inline-flex;
    align-items: center;
    padding-right: 4px;
    gap: 4px;
    cursor: pointer;
  }
  .color-container > label:hover {
    background-color: var(--color-dark);
  }
  /* .remove-player-button {
    width: 100%;
    color: inherit;
    justify-content: center;
    gap: 0.5ch;
    line-height: 1;
    padding: 4px;
    margin-top: 8px;
  }*/

  .btn-row {
    gap: 2px;
    margin-top: 4px;
    flex-wrap: nowrap;
  }

  .btn-row > button {
    width: 33%;
    white-space: nowrap;
    display: inline flex;
    gap: 4px;
    color: var(--color-darker);
    background-color: var(--color-lighter);
    transition: width 0.2s;
  }
  .btn-row > button > small {
    display: none;
    font-size: 0.675em;
    font-weight: 300;
    opacity: 0;
    transition: opacity 0.2s;
    /* transition-behavior: allow-discrete; */
  }

  .btn-row > button:hover {
    background-color: var(--color-light);
    width: 100%;
  }
  .btn-row > button:hover > small {
    display: inline;
    opacity: 1;
  }
  .btn-row > .remove-player-btn:hover {
    background-color: color-mix(in srgb, var(--color-red) 70%, var(--color-light));
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
