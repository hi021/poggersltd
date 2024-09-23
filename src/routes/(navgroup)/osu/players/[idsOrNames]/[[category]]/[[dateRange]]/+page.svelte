<script lang="ts">
  import { COUNTRIES, getAvatarURL, RANKING_BADGES, SCORE_CATEGORIES, tooltip } from "$lib/util";
  import type { PageData } from "../$types";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  export let data: PageData;
  let loading = false;
  let category = $page.params.category as App.RankingCategory;
  //   $: () => browser && goto(`/osu/player/${$page.params.idOrName}/${category}`);
</script>

<svelte:head>
  <title>score chart - poggers</title>
</svelte:head>

<main class="flex-fill column">
  {#if data}
    <div class="chart-container"></div>
    <aside>
      <ul class="players-container ul column">
        {#each data?.players as player (player.id)}
          <li class="row">
            <img src={getAvatarURL(player.id)} alt="" />
            {player.name}
            {player.country}
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
    padding: 8px;
  }

  .chart-container {
    width: 73%;
    min-width: 16rem;
    margin-right: 8px;
    border-radius: 12px;
  }

  aside {
    border-radius: 12px;
  }
  .players-container li {
    padding: 6px;
    border-radius: 6px;
  }
  @media screen and (max-width: 40rem) {
  }
</style>
