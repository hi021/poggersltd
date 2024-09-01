<script lang="ts">
  //@ts-nocheck it's being really dumb, please don't worry about it
  import { COUNTRIES, getAvatarURL, RANKING_BADGES, SCORE_CATEGORIES, tooltip } from "$lib/util";
  import PlayerScoresChart from "$lib/components/Player/PlayerScoresChart.svelte";
  import PlayerRecordStats from "$lib/components/Player/PlayerRecordStats.svelte";
  import PlayerBasicStats from "$lib/components/Player/PlayerBasicStats.svelte";
  import PlayerAllCategoryStats from "$lib/components/Player/PlayerAllCategoryStats.svelte";
  import type { PageData } from "./$types";
  import { fade } from "svelte/transition";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

  export let data: PageData;
  let loading = false;
  let category = $page.params.category as "top50" | "top25" | "top8" | "top1" | "all";
  $: () => browser && goto(`/osu/player/${$page.params.idOrName}/${category}`);
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
          {data.name}

          {#if RANKING_BADGES[data._id]}
            <img
              class="osu-badge unselectable"
              alt="<3"
              src={RANKING_BADGES[data._id].img}
              use:tooltip={{ content: RANKING_BADGES[data._id].title ?? "" }} />
          {/if}

          {#if data.oldNames?.length}
            <icon class="profile-name big" use:tooltip={{ content: data.oldNames.join(", ") }} />
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

          {COUNTRIES[data.country] || data.country}
        </div>
      </div>
    </div>
    <div class="main-wrapper row flex-fill">
      <aside class="column">
        <a
          class="a"
          target="_blank"
          href="https://osu.ppy.sh/users/{data._id}"
          use:tooltip={{ content: "osu! profile" }}
          rel="noreferrer">
          <div class="osu-icon-wrapper">
            <div />
            <icon class="osu bigger" />
          </div>
        </a>
      </aside>
      <div class="main-container column flex-fill">
        <div class="tabs-container row">
          {#each SCORE_CATEGORIES as cat}
            <button
              class="tab btn-none"
              disabled={data[cat] == null}
              class:active={category === cat}
              on:click={() => (category = cat)}>
              {cat}
            </button>
          {/each}
          <button
            class="tab btn-none"
            class:active={category === "all"}
            on:click={() => (category = "all")}>
            all
          </button>
        </div>

        {#if loading}
          <div class="overlay" transition:fade />
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
              <PlayerScoresChart ranks={data.ranks}/>
              <PlayerBasicStats playerCategory={data[category]} />
            {:else}
              <p class="solo-text">
                No <em>{category}</em> stats for this player...
                <small>Check a different tab!</small>
              </p>
            {/if}
          </div>
        {/if}
        {#if data[category]}
          <small class="date-container">Data from <strong>{data[category].date}</strong></small>
        {/if}
      </div>
    </div>
  {:else}
    <p class="solo-text">Player not found</p>
  {/if}
</main>

<style>
  main {
    --av-height: 96px;
    --av-height-2: calc(var(--av-height) / 2);
    padding: calc(var(--av-height-2));
  }

  #avatar {
    height: var(--av-height);
    aspect-ratio: 1/1;
    border-radius: 50%;
    outline: 5px solid var(--color-lightest);
    outline-offset: -1px;
    background-color: var(--color-lighter);
    z-index: 1;
  }
  #top-bar-top,
  #top-bar-bottom {
    display: flex;
    align-items: center;
    height: var(--av-height-2);
    padding-left: calc(var(--av-height-2) + 10px);
    padding-right: 10px;
    margin-left: calc(-1 * var(--av-height-2));
  }
  #top-bar-top {
    font-size: 1.25rem;
    border-top-right-radius: 9999px;
    background: linear-gradient(45deg, var(--color-purple), var(--color-claret));
  }

  aside,
  #top-bar-bottom {
    background-color: var(--color-lighter);
    color: var(--color-darker);
  }
  aside {
    width: var(--av-height);
    padding-top: calc(var(--av-height-2) + 10px);
    margin-top: calc(-1 * var(--av-height-2));
    padding-bottom: 10px;
    align-items: center;
  }

  .osu-icon-wrapper {
    position: relative;
    display: flex;
  }
  .osu-icon-wrapper > div {
    top: 2px;
    bottom: 2px;
    right: 2px;
    left: 2px;
    border-radius: 50%;
    position: absolute;
    transition: background-color 0.2s linear;
  }
  .osu-icon-wrapper > icon {
    transition: color 0.2s linear;
  }
  .osu-icon-wrapper:hover > div {
    background-color: var(--color-pink);
  }
  .osu-icon-wrapper:hover > icon {
    color: var(--color-lightest);
  }

  .main-wrapper {
    box-shadow: 4px 4px 4px var(--color-darkest);
  }
  .main-container {
    --pad: 12px;
    padding: var(--pad);
    background-color: var(--color-dark);
    position: relative;
  }
  .overlay {
    --color-base: 0, 0, 0;
    backdrop-filter: blur(5px);
    margin-left: calc(-1 * var(--pad));
  }

  .tabs-container {
    margin: calc(-1 * var(--pad));
    margin-bottom: var(--pad);
    padding-left: var(--pad);
    background-color: var(--color-darker);
  }
  .tab {
    color: inherit;
    border: none;
    border-radius: 0;
    padding: 8px;
    cursor: pointer;
    transition: none;
  }
  .tab:not(:disabled):is(:hover, :focus, :focus-visible) {
    outline: none;
    box-shadow: none;
    background-color: rgba(0, 0, 0, 0.4);
  }
  .tab.active {
    color: var(--color-active);
  }

  .data-container {
    margin: 0 auto;
  }

  .date-container {
    margin: auto;
    margin-bottom: 0;
  }

  .profile-name {
    margin-left: 10px;
    transition: transform 0.25s;
  }
  .profile-name:hover {
    transform: translateY(-2px);
  }

  @media screen and (max-width: 40rem) {
    .main-container {
      --pad: 8px;
    }
    main {
      padding: 16px 5px;
    }
    .data-container {
      flex-direction: column;
      margin: 0 4px;
    }
    .date-container {
      margin-top: 20px;
    }
    #top-bar-top {
      border-radius: 0;
    }
  }
</style>
