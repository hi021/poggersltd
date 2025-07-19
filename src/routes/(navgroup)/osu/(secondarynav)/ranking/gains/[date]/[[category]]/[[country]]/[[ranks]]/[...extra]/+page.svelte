<script lang="ts">
  import RankingGainedRanks from "$lib/components/Ranking/RankingGainedRanks.svelte";
  import RankingSettings from "$lib/components/Ranking/RankingSettings.svelte";
  import RankingCountry from "$lib/components/Ranking/RankingCountry.svelte";
  import RankingAvatar from "$lib/components/Ranking/RankingAvatar.svelte";
  import RankingEmpty from "$lib/components/Ranking/RankingEmpty.svelte";
  import RankingName from "$lib/components/Ranking/RankingName.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { rankingSettings } from "$lib/stores";
  import { formatNumber } from "$lib/util";
  import { page } from "$app/state";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let maxPage = $derived(Math.ceil((data?.rankingData?.length ?? 0) / $rankingSettings.perPage));
  let curPage = $state(1);
  let pageData = $derived(
    data.rankingData.slice(
      $rankingSettings.perPage * (curPage - 1),
      $rankingSettings.perPage * curPage
    )
  );

  $effect(() => {
    if (maxPage && curPage > maxPage) curPage = maxPage;
  });
</script>

<svelte:head>
  <title>{page.params.date || "gains"} - poggers</title>
</svelte:head>

<main class="flex-fill column osu-main">
  {#if $rankingSettings.perPage > 25 && maxPage > 1}
    <div class="flex-center" style="margin-top: 21px;">
      <Pagination
        page={curPage}
        {maxPage}
        onPageChange={(newPage) => (curPage = newPage)}
        entries={data.rankingData.length} />
    </div>
  {/if}

  <RankingSettings bind:settings={$rankingSettings} viewMode="gains" />
  {#if !pageData?.length}
    <RankingEmpty />
  {:else}
    <table class="osu-table">
      <tbody>
        {#each pageData as plr, i (plr._id)}
          <tr>
            <td style="width: 5.25ch;">
              <strong>#{i + 1 + (curPage - 1) * $rankingSettings.perPage}</strong>
            </td>

            <RankingGainedRanks gainedRanks={plr.gainedRanks} />

            {#if $rankingSettings.avatars}
              <RankingAvatar id={plr._id} />
            {/if}

            <RankingCountry country={plr.country} />

            <RankingName category={page.params.category} {plr} />

            <td style="width: 25%;">
              {(plr.gainedScores ?? -1) >= 0 ? "+" : ""}{formatNumber(plr.gainedScores ?? 0, " ")}
              <small style="margin-left: 8px; white-space: nowrap;">
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

    {#if maxPage > 1}
      <Pagination
        {maxPage}
        page={curPage}
        showPageNumber={true}
        style="margin-bottom: 21px;"
        entries={data.rankingData.length}
        onPageChange={(newPage) => (curPage = newPage)} />
    {/if}
  {/if}
</main>
