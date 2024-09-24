<script lang="ts">
  import { COUNTRIES, getAvatarURL, RANKING_BADGES, SCORE_CATEGORIES, tooltip } from "$lib/util";
  import type { PageData } from "../$types";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import UserSearch from "$lib/components/UserSearch.svelte";
  import PlayerComparisonChart from "$lib/components/Player/PlayerComparisonChart.svelte";

  export let data: PageData;
  let loading = false;
  let category = $page.params.category as App.RankingCategory;
  let comparePlayerName: string;
  const comparePlayerSearch = () => console.log(comparePlayerName);
  //   $: () => browser && goto(`/osu/player/${$page.params.idOrName}/${category}`);
</script>

<svelte:head>
  <title>score chart - poggers</title>
</svelte:head>

<main class="flex-fill row">
  {#if data?.players?.length}
    <div class="chart-container flex-fill">
      <PlayerComparisonChart {data} {category} />
    </div>

    <aside class="column">
      <div style="margin-inline-start: 1.25rem;">
        <span>Compare players</span> <button type="button" class="btn-icon">collapse</button>
      </div>
      <UserSearch
        bind:value={comparePlayerName}
        gotoPlayer={comparePlayerSearch}
        style="margin-top: 4px; margin-bottom: 6px;" />

      <ul class="players-container ul column">
        {#each data.players as player (player.id)}
          <li style="--color: {player.color ?? 'var(--color-pink)'};">
            <div class="player-entry-info-container">
              <a
                class="osu-avatar-small"
                href="https://osu.ppy.sh/users/{player.id}"
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
              <button type="button" class="btn-icon" use:tooltip={{ content: "Toggle ranks" }}>
                <icon class="hash" />
              </button>
              <button type="button" class="btn-icon" use:tooltip={{ content: "Toggle scores" }}>
                {category.substring(3)}
              </button>
            </div>
          </li>
        {/each}
      </ul>
    </aside>
  {:else}
    <p class="solo-text">Player not found</p>
  {/if}
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

  aside {
    border-radius: 12px;
    min-width: 14.5rem;
  }
  .players-container {
    margin-top: auto;
    gap: 6px;
    overflow-y: auto;
  }
  .players-container li {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
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
  }

  @media screen and (max-width: 40rem) {
  }
</style>
