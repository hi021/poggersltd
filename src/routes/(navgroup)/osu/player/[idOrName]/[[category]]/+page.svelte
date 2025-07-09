<script lang="ts">
  import { run } from "svelte/legacy";

  //a@ts-nocheck it's being really dumb, please don't worry about it
  import {
    getAvatarURL,
    getOsuAltURL,
    getOsuDailyURL,
    getOsuProfileURL,
    getOsuSnipeURL,
    getOsuStatsURL,
    getOsuTrackURL,
    tooltip
  } from "$lib/util";
  import PlayerAllCategoryStats from "$lib/components/Player/PlayerAllCategoryStats.svelte";
  import PlayerScoresChart from "$lib/components/Player/PlayerScoresChart.svelte";
  import PlayerRecordStats from "$lib/components/Player/PlayerRecordStats.svelte";
  import PlayerChartStats from "$lib/components/Player/PlayerChartStats.svelte";
  import PlayerBasicStats from "$lib/components/Player/PlayerBasicStats.svelte";
  import PlayerDate from "$lib/components/Player/PlayerDate.svelte";
  import { afterNavigate, goto } from "$app/navigation";
  import { quintOut } from "svelte/easing";
  import { browser } from "$app/environment";
  import { fade } from "svelte/transition";
  import { page } from "$app/state";
  import type { PageData } from "./$types";
  import { COUNTRIES, RANKING_BADGES, SCORE_CATEGORIES } from "$lib/constants";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let loading = $state(false);
  let category = $state((page.params.category || "top50") as App.RankingCategory | "all");

  const updateURL = () => {
    if (!browser) return;
    loading = true;
    goto(`/osu/player/${page.params.idOrName}/${category}`);
  };

  run(() => {
    category, updateURL();
  });
  afterNavigate(() => (loading = false));
</script>

<svelte:head>
  <title>{data.name ?? "player"} - poggers</title>
</svelte:head>

<main class="flex-fill column">
  {#if data?.name}
    <div id="top-bar-container" class="row">
      <img id="avatar" class="unselectable" alt={data.name} src={getAvatarURL(data._id)} />
      <div class="column" style="width: 100%;">
        <div id="top-bar-top">
          <span style="text-shadow: 0 1px 3px var(--color-darker);">{data.name}</span>

          {#if data.oldNames?.length}
            <icon class="profile-name" use:tooltip={{ content: data.oldNames.join(", ") }}></icon>
          {/if}

          {#if RANKING_BADGES[data._id]}
            <img
              class="osu-badge unselectable"
              alt="<3"
              src={RANKING_BADGES[data._id].img}
              use:tooltip={{ content: RANKING_BADGES[data._id].title ?? "" }} />
          {/if}
        </div>
        <div id="top-bar-bottom" class="row">
          <img
            class="osu-flag-small unselectable"
            width="36"
            height="36"
            alt={data.country}
            src={`/flags/${data.country}.svg`}
            style="margin-right: 10px;" />

          <span>{COUNTRIES[data.country] || data.country}</span>
        </div>
        <div class="tabs-container row">
          {#each SCORE_CATEGORIES as cat}
            <button
              class="tab btn-none"
              type="button"
              class:active={category === cat}
              onclick={() => (category = cat)}>
              {cat}
            </button>
          {/each}
          <button
            class="tab btn-none"
            type="button"
            class:active={category === "all"}
            onclick={() => (category = "all")}>
            all
          </button>
        </div>
      </div>
    </div>
    <div class="main-wrapper row flex-fill">
      <aside class="column">
        <a
          class="a"
          target="_blank"
          href={getOsuProfileURL(data._id)}
          use:tooltip={{ content: "osu! profile" }}
          rel="noreferrer">
          <div class="icon-wrapper osu-icon-wrapper">
            <div></div>
            <icon class="osu bigger"></icon>
          </div>
        </a>
        <a
          class="a"
          target="_blank"
          href={getOsuStatsURL(data.name)}
          use:tooltip={{ content: "osu!Stats" }}
          rel="noreferrer">
          <div class="icon-wrapper chart-icon-wrapper">
            <div></div>
            <icon class="chart-line"></icon>
          </div>
        </a>
        <a
          class="a"
          target="_blank"
          href={getOsuTrackURL(data.name)}
          use:tooltip={{ content: "osu!track" }}
          rel="noreferrer">
          <div class="icon-wrapper">
            <div></div>
            <icon class="chart-bar"></icon>
          </div>
        </a>
        <a
          class="a"
          target="_blank"
          href={getOsuAltURL(data._id)}
          use:tooltip={{ content: "osu! scores inspector" }}
          rel="noreferrer">
          <div class="icon-wrapper">
            <div></div>
            <div style="font-weight: 300;">alt</div>
          </div>
        </a>
        <a
          class="a"
          target="_blank"
          href={getOsuDailyURL(data.name)}
          use:tooltip={{ content: "osu!daily" }}
          rel="noreferrer">
          <div class="icon-wrapper">
            <div></div>
            <div style="font-weight: 500;">S</div>
          </div>
        </a>
        <a
          class="a"
          target="_blank"
          href={getOsuSnipeURL(data._id, data.country)}
          use:tooltip={{ content: "osu!snipe" }}
          rel="noreferrer">
          <div class="icon-wrapper">
            <div></div>
            <icon class="flag"></icon>
          </div>
        </a>
      </aside>
      <div class="main-container column flex-fill">
        {#if loading}
          <div class="overlay" transition:fade={{ easing: quintOut, duration: 100 }}></div>
        {:else}
          <div class="data-container row">
            {#if category === "all"}
              {#each SCORE_CATEGORIES as cat}
                {#if data[cat]}
                  <PlayerAllCategoryStats
                    country={data.country}
                    title="{cat}s"
                    playerCategory={data[cat]} />
                {/if}
              {/each}
            {:else if data[category]}
              <PlayerRecordStats playerCategory={data[category]} />
              <div class="player-chart-stats-wrapper">
                <PlayerScoresChart
                  ranks={data.ranks}
                  stats={data.stats}
                  {category}
                  playerId={data._id} />
                {#if data.stats}
                  <PlayerChartStats stats={data.stats} />
                {/if}
              </div>
              <PlayerBasicStats playerCategory={data[category]} />
            {:else if !loading}
              <p class="solo-text">
                No <em>{category}</em> stats for this player...<br />
                <small>Check a different tab!</small>
              </p>
            {/if}
          </div>
        {/if}
        {#if data[category]}
          <PlayerDate categoryStats={data[category]} />
        {/if}
      </div>
    </div>
  {:else}
    <p class="solo-text">Player not found &gt;~&lt;</p>
  {/if}
</main>

<style>
  main {
    --pad: 18px;
    --radius: 12px;
    --av-height: 96px;
    --av-height-2: calc(var(--av-height) / 2);
    --tabs-height: calc(2rem + 4px);
    padding: calc(var(--av-height-2));
  }

  #avatar {
    height: var(--av-height);
    aspect-ratio: 1/1;
    border-radius: 50%;
    outline: 5px solid var(--color-lightest);
    outline-offset: -1px;
    background-color: var(--color-lighter);
    box-shadow: 0 1px 2px 4px var(--color-darkish);
    z-index: 1;
  }
  #top-bar-top,
  #top-bar-bottom {
    display: flex;
    align-items: center;
    height: var(--av-height-2);
    padding-left: calc(var(--av-height-2) + 1rem);
    padding-right: 10px;
    margin-left: calc(-1 * var(--av-height-2));
  }
  #top-bar-top {
    font-size: 1.25rem;
    border-top-right-radius: 9999px;
    background: linear-gradient(35deg, var(--color-purple), var(--color-claret));
  }

  aside,
  #top-bar-bottom {
    background-color: var(--color-lighter);
    color: var(--color-darker);
  }
  aside {
    width: var(--av-height);
    padding-top: calc(var(--av-height-2) + 1rem);
    margin-top: calc(-1 * (var(--av-height-2) + var(--tabs-height)));
    padding-bottom: 10px;
    align-items: center;
    gap: 8px;
    border-bottom-left-radius: var(--radius);
  }
  aside a {
    text-decoration: none;
  }

  .icon-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon-wrapper:not(.osu-icon-wrapper) {
    width: 1.75rem;
    height: 1.75rem;
    outline: 0.125em solid currentColor;
    outline-offset: -0.125em;
    border-radius: 50%;
  }
  .icon-wrapper > div:first-child {
    inset: 2px;
    border-radius: 50%;
    position: absolute;
    transition: background-color 0.1s linear;
  }
  .icon-wrapper > div + div {
    z-index: 1;
    transition: color 0.1s linear;
  }
  .icon-wrapper > icon {
    transition: color 0.1s linear;
  }
  .chart-icon-wrapper > icon {
    font-size: 1.75em;
  }
  .icon-wrapper:hover > div:first-child {
    background-color: var(--color-pink);
  }
  .icon-wrapper:hover {
    color: var(--color-lightest);
  }

  .main-wrapper {
    box-shadow: 4px 4px 4px var(--color-darkest);
    border-bottom-right-radius: var(--radius);
    border-bottom-left-radius: var(--radius);
  }
  .main-container {
    padding: var(--pad);
    background-color: var(--color-dark);
    position: relative;
    border-bottom-right-radius: var(--radius);
  }
  .overlay {
    --color-base: 0, 0, 0;
    position: absolute;
    backdrop-filter: blur(5px);
    margin-left: calc(-1 * var(--pad));
  }

  .tabs-container {
    padding-left: 8px;
    background-color: var(--color-darker);
    height: var(--tabs-height);
  }
  .tab {
    color: inherit;
    border: none;
    border-radius: 0;
    padding: 0 8px;
    height: 100%;
    cursor: pointer;
    transition: none;
  }
  .tab:not(:disabled):is(:global(:hover, :focus)) {
    box-shadow: none;
    outline-color: transparent;
    background-color: rgba(0, 0, 0, 0.4);
  }
  .tab.active {
    color: var(--color-active);
  }

  .data-container {
    gap: 20px;
  }
  :global(.data-container > .player-stats-container:first-child) {
    margin-left: auto;
  }
  :global(.data-container > .player-stats-container:last-child) {
    margin-right: auto;
  }

  .player-chart-stats-wrapper {
    display: flex;
    flex-direction: column;
    width: clamp(20rem, 50%, 76rem);
  }

  .profile-name {
    margin-left: 10px;
    transition: transform 0.25s;
  }
  .profile-name:hover {
    transform: translateY(-2px);
  }

  @media (width <= 40rem) {
    main {
      --av-height: 76px;
      --av-height-2: calc(var(--av-height) / 2);
      --pad: 12px;
      padding: 16px 5px;
    }
    .data-container {
      flex-direction: column;
    }
    .player-chart-stats-wrapper {
      width: 100%;
    }
    #top-bar-top {
      border-radius: 0;
    }
    :global(.data-container > .player-stats-container:first-child) {
      margin-left: 0;
    }
    :global(.data-container > .player-stats-container:last-child) {
      margin-right: 0;
    }
  }
</style>
