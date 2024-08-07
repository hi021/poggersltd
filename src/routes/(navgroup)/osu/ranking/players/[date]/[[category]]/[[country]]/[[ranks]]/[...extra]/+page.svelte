<script lang="ts">
  import RankingGainedRanks from "$lib/components/Ranking/RankingGainedRanks.svelte";
  import RankingSettings from "$lib/components/Ranking/RankingSettings.svelte";
  import RankingAvatar from "$lib/components/Ranking/RankingAvatar.svelte";
  import RankingEmpty from "$lib/components/Ranking/RankingEmpty.svelte";
  import RankingName from "$lib/components/Ranking/RankingName.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import type { PageData } from "./$types";
  import { page } from "$app/stores";
  import { formatNumber, COUNTRIES, addDate, formatDate, tooltip } from "$lib/util";

  export let data: PageData;
  let pageData: App.RankingEntry[];
  let maxPage: number;
  const perPage = 50;
  let curPage = 1;

  $: pageData = data.rankingData.slice(perPage * (curPage - 1), perPage * curPage);
  $: maxPage = Math.ceil((data?.rankingData?.length ?? 0) / perPage);
</script>

<svelte:head>
  <title>{$page.params.date || "ranking"} - poggers</title>
</svelte:head>

<main class="flex-fill column osu-main">
  <div class="flex-center" style="margin-top: 21px;">
    {#if maxPage > 1}
      <Pagination page={curPage} {maxPage} onPageChange={(newPage) => (curPage = newPage)} />
    {/if}
  </div>

  <RankingSettings bind:settings={data.rankingSettings}></RankingSettings>

  {#await pageData}
    <Loader margin="2rem" sticky={true} />
  {:then pageData}
    {#if !pageData?.length}
      <RankingEmpty />
    {:else}
      {#if pageData[0].gainedDays}
        <p class="gains-notice">
          Showing gained counts over <strong>{pageData[0].gainedDays}</strong>
          days
          <br />
          <small>
            due to a gap between
            {formatDate(addDate(new Date($page.params.date), -pageData[0].gainedDays))}
            and {$page.params.date}
          </small>
        </p>
      {/if}

      <table class="osu-table">
        <tbody>
          {#each pageData as plr, i (plr._id)}
            <tr class:top-rank={plr.rank <= 3}>
              <td style="width: 5.25ch;">
                <strong>#{plr.rank}</strong>
              </td>

              <RankingGainedRanks gainedRanks={plr.gainedRanks} />

              {#if data.rankingSettings.avatars}
                <RankingAvatar id={plr._id} />
              {/if}

              <td style="width: 4.25ch; text-align: end; padding-right: 3px;">
                #{plr.countryRank}
              </td>

              <td style="width: 40px;">
                <img
                  class="osu-flag-small"
                  alt={plr.country}
                  use:tooltip={{ content: COUNTRIES[plr.country] }}
                  src="/flags/{plr.country}.svg" />
              </td>

              <RankingName category={$page.params.category} {plr} />

              <td style="width: 25%;">
                {formatNumber(plr.scores ?? 0)}
                {plr.gainedScores == undefined
                  ? ""
                  : `(${(plr.gainedScores ?? -1) >= 0 ? "+" : ""}${plr.gainedScores})`}
              </td>
            </tr>

            {#if data.rankingSettings.scoreDifferences && pageData[i + 1]}
              <tr class="osu-difference-column">
                <td /><td /><td /><td /><td /><td />
                <td style="width: 25%; padding: 2px;">
                  +{formatNumber(plr.scores - pageData[i + 1].scores)}
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>

      {#if maxPage > 1}
        <Pagination
          {maxPage}
          page={curPage}
          showPageNumber={true}
          style="margin-bottom: 21px;"
          onPageChange={(newPage) => (curPage = newPage)} />
      {/if}
    {/if}
  {/await}
</main>

<style>
  .gains-notice {
    margin: 1.75rem auto;
    font-size: 1.25rem;
    text-align: center;
  }
</style>
