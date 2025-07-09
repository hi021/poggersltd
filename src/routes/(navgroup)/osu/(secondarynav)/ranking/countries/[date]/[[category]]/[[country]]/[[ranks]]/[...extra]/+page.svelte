<!-- @migration-task Error while migrating Svelte code: `<th>` cannot be a child of `<thead>`. `<thead>` only allows these children: `<tr>`, `<style>`, `<script>`, `<template>`. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
https://svelte.dev/e/node_invalid_placement -->
<script lang="ts">
  import RankingSettings from "$lib/components/Ranking/RankingSettings.svelte";
  import RankingEmpty from "$lib/components/Ranking/RankingEmpty.svelte";
  import { formatNumber } from "$lib/util";
  import { rankingSettings } from "$lib/stores";
  import { page } from "$app/state";
  import type { PageData } from "./$types";
  import { COUNTRIES } from "$lib/constants";

  export let data: PageData;

  let sortBy = "weighted";
  let sortDescending = true;

  function sortData() {
    const order = sortDescending ? 1 : -1;
    const sorting = (a: any, b: any) => (a[sortBy] < b[sortBy] ? order : -order);
    data = { ...data, rankingData: data.rankingData.sort(sorting) };
  }
  $: sortBy, sortDescending, data, sortData();
</script>

<svelte:head>
  <title>{page.params.date || "ranking"} - poggers</title>
</svelte:head>

<main class="flex-fill column osu-main">
  {#if !data?.rankingData?.length}
    <RankingEmpty />
  {:else}
    <RankingSettings bind:settings={$rankingSettings} viewMode="countries" />

    <table class="osu-table">
      <thead>
        <th></th>

        <th> Country </th>

        <th
          class="sortable"
          on:click={() => {
            if (sortBy === "weighted") sortDescending = !sortDescending;
            else sortBy = "weighted";
          }}>
          <span
            class:desc={sortBy === "weighted" && sortDescending}
            class:asc={sortBy === "weighted" && !sortDescending}>
            Weighted
          </span>
        </th>

        <th
          class="sortable"
          on:click={() => {
            if (sortBy === "total") sortDescending = !sortDescending;
            else sortBy = "total";
          }}>
          <span
            class:desc={sortBy === "total" && sortDescending}
            class:asc={sortBy === "total" && !sortDescending}>
            Total
          </span>
        </th>

        <th
          class="sortable"
          on:click={() => {
            if (sortBy === "players") sortDescending = !sortDescending;
            else sortBy = "players";
          }}>
          <span
            class:desc={sortBy === "players" && sortDescending}
            class:asc={sortBy === "players" && !sortDescending}>
            Players
          </span>
        </th>

        <th
          class="sortable"
          on:click={() => {
            if (sortBy === "average") sortDescending = !sortDescending;
            else sortBy = "average";
          }}>
          <span
            class:desc={sortBy === "average" && sortDescending}
            class:asc={sortBy === "average" && !sortDescending}>
            Average
          </span>
        </th>
      </thead>
      <tbody>
        {#each data.rankingData as country, i (country.country)}
          <tr>
            <td style="width: 4.5ch; text-align: right;">
              <strong>#{sortDescending ? i + 1 : data.rankingData.length - i}</strong>
            </td>

            <td style="display: flex; align-items: center;">
              <img
                class="osu-flag-small"
                style="margin: 0 10px;"
                alt={country.country}
                src="/flags/{country.country}.svg" />
              <span class="hide-width-640">
                {COUNTRIES[country.country] || country.country}
              </span>
            </td>

            <td class="emphasis">
              {formatNumber(Math.round(country.weighted))}
            </td>

            <td>
              {formatNumber(Math.round(country.total))}
            </td>

            <td>
              {country.players}
            </td>

            <td>
              {formatNumber(Math.round(country.average))}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
  .osu-table {
    margin: 40px 7.5%;
  }
  .osu-table th {
    padding: 2px;
    user-select: none;
  }
  .osu-table td {
    padding: 4px 0;
    text-align: center;
  }
  .osu-table td:first-child {
    padding-left: 8px;
  }
  .osu-table tr:first-child {
    border-radius: 0;
    overflow: initial;
  }
  .osu-table tr:first-child > td:first-child {
    border-radius: 0;
    overflow: initial;
  }
  .osu-table tr:first-child > td:last-child {
    border-radius: 0;
    overflow: initial;
  }

  .emphasis {
    color: var(--color-lightest);
    font-weight: 500;
  }
  .sortable {
    cursor: pointer;
  }
  .sortable:hover {
    background-color: var(--color-lightest);
  }
  .sortable span {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: calc(-1.125rem - 4px);
  }
  .sortable span::after {
    content: "";
    display: inline-block;
    height: 1.125rem;
    margin-left: 4px;
    aspect-ratio: 1/1;
    background-size: contain;
    background-origin: content-box;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("/icons/arrow_up.svg");
    opacity: 0;
  }
  :is(span.asc, span.desc)::after {
    opacity: 1;
  }
  span.desc::after {
    transform: rotate(180deg);
  }

  @media (width <= 40rem) {
    .osu-table {
      font-size: 0.875rem;
    }
    .osu-table thead {
      font-size: 0.75rem;
    }
  }
</style>
