<script lang="ts">
  import RankingGainedRanks from "$lib/components/RankingGainedRanks.svelte";
  import RankingSettings from "$lib/components/RankingSettings.svelte";
  import RankingAvatar from "$lib/components/RankingAvatar.svelte";
  import RankingEmpty from "$lib/components/RankingEmpty.svelte";
  import RankingName from "$lib/components/RankingName.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { formatNumber, COUNTRIES } from "$lib/util";
  import Loader from "$lib/components/Loader.svelte";
  import type { PageData } from "./$types";
  import { page } from "$app/stores";

  export let data: PageData;
  let pageData: App.RankingEntry[];
  let maxPage: number;
  const perPage = 50;
  let curPage = 1;

  $: pageData = data.rankingData.slice(perPage * (curPage - 1), perPage * curPage);
  $: maxPage = Math.ceil((data?.rankingData?.length ?? 0) / perPage);
</script>

<svelte:head>
  <title>{$page.params.date || "gains"} - poggers</title>
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
      <table class="osu-table">
        <tbody>
          {#each pageData as plr, i}
            <tr class:top-rank={plr.rank <= 3}>
              <td style="width: 5.25ch;">
                <strong>#{i + 1 + (curPage - 1) * perPage}</strong>
              </td>
              <RankingGainedRanks gainedRanks={plr.gainedRanks} />
              {#if data.rankingSettings.avatars}
                <RankingAvatar id={plr._id} />
              {/if}
              <td style="width: 40px;">
                <img
                  class="osu-flag-small"
                  alt={plr.country}
                  title={COUNTRIES[plr.country]}
                  src="/flags/{plr.country}.svg" />
              </td>
              <RankingName category={$page.params.category} {plr} />
              <td style="width: 25%;">
                {(plr.gainedScores ?? -1) >= 0 ? "+" : ""}{formatNumber(plr.gainedScores ?? 0, " ")}
                <small style="margin-left: 8px;">
                  <span class="hide-width-640">
                    {formatNumber(plr.scores - (plr.gainedScores ?? 0), " ")} → {formatNumber(
                      plr.scores
                    )}
                  </span>
                  {#if plr.gainedDays}
                    ({Math.round(((plr.gainedScores ?? 0) / plr.gainedDays) * 100) / 100}/day)
                  {/if}
                </small>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="column flex-center" style="margin-bottom: 21px;">
        {#if maxPage > 1}
          <Pagination page={curPage} {maxPage} onPageChange={(newPage) => (curPage = newPage)} />
        {/if}
        <div style="font-weight: 300; margin-top: 4px;">
          Page <strong>{curPage}</strong>/{maxPage}
        </div>
      </div>
    {/if}
  {/await}
</main>

<style>
</style>
