<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Loader from "$lib/components/Loader.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import RankingSettings from "$lib/components/RankingSettings.svelte";
  import {
    formatNumber,
    COUNTRIES,
    getAvatarURL,
    RANKING_BADGES,
    addDate,
    formatDate,
    tooltip,
  } from "$lib/util";
  import type { PageData } from "./$types";

  export let data: PageData;
  let pageData: App.RankingEntry[];
  const perPage = 50;
  let curPage = 1;
  let maxPage: number;

  $: pageData = data.rankingData.slice(
    perPage * (curPage - 1),
    perPage * curPage,
  );
  $: maxPage = Math.ceil((data?.rankingData?.length ?? 0) / perPage);

  let rankingSettings: App.RankingSettings = {avatars: true, scoreDifferences: false};

  const goToProfile = (plr: App.RankingEntry) =>
    goto(`/osu/player/${plr.name}/${$page.params.category}`);
</script>

<svelte:head>
  <title>{$page.params.date || "ranking"} - poggers</title>
</svelte:head>

<main class="flex-fill column osu-main">
  <div class="flex-center" style="margin-top: 21px;">
    {#if maxPage > 1}
      <Pagination
        page={curPage}
        {maxPage}
        onPageChange={(newPage) => (curPage = newPage)}
      />
    {/if}
  </div>

  <RankingSettings bind:settings={rankingSettings}></RankingSettings>

  {#await pageData}
    <Loader margin="2rem" sticky={true} />
  {:then pageData}
    {#if !pageData?.length}
      <p class="solo-text">
        No data for the given query<br />
        <small>There's probably no archive entry for this date...</small>
      </p>
    {:else}
      {#if pageData[0].gainedDays}
        <p class="gains-notice">
          Showing gained counts over <strong>{pageData[0].gainedDays}</strong>
          days
          <br />
          <small>
            due to a gap between
            {formatDate(
              addDate(new Date($page.params.date), -pageData[0].gainedDays),
            )}
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
              <td style="width: 22px;">
                {#if plr.gainedRanks == undefined}
                  <div class="circle" use:tooltip={"New"} />
                {:else if (plr.gainedRanks ?? -1) > 0}
                  <div class="arrow" use:tooltip={`Up by ${plr.gainedRanks}`} />
                {:else if (plr.gainedRanks ?? 1) < 0}
                  <div
                    class="arrow-down"
                    use:tooltip={`Down by ${-(plr.gainedRanks ?? 0)}`}
                  />
                {:else if plr.gainedRanks === 0}
                  <div class="line" use:tooltip={"No change"} />
                {/if}
              </td>
              
              {#if rankingSettings.avatars}
                <td class="hide-width-640" style="width: 36px;">
                  <a
                    href="https://osu.ppy.sh/users/{plr._id}"
                    target="_blank"
                    rel="noreferrer"
                    use:tooltip={"osu! profile"}
                  >
                    <img
                      class="osu-avatar-small"
                      alt=""
                      src={getAvatarURL(plr._id)}
                    />
                  </a>
                </td>
              {/if}
              <td style="width: 4.25ch; text-align: end; padding-right: 3px;">
                #{plr.countryRank}
              </td>
              <td style="width: 40px;">
                <img
                  class="osu-flag-small"
                  alt={plr.country}
                  use:tooltip={COUNTRIES[plr.country]}
                  src="/flags/{plr.country}.svg"
                />
              </td>
              <td
                class="osu-name-column"
                on:click={() => goToProfile(plr)}
                on:keypress={(e) => {
                  if (e.key === "Enter") goToProfile(plr);
                }}
              >
                <div class="row">
                  <span>{plr.name}</span>
                  {#if RANKING_BADGES[plr._id]}
                    <img
                      class="osu-badge"
                      alt="pog"
                      src={RANKING_BADGES[plr._id].img}
                      use:tooltip={RANKING_BADGES[plr._id].title}
                    />
                  {/if}
                </div>
              </td>
              <td style="width: 25%;">
                {formatNumber(plr.scores ?? 0, " ")}
                {plr.gainedRanks == undefined
                  ? ""
                  : `(${(plr.gainedRanks ?? -1) >= 0 ? "+" : ""}${plr.gainedRanks})`}
              </td>
            </tr>

            {#if rankingSettings.scoreDifferences && pageData[i + 1]}
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
          onPageChange={(newPage) => (curPage = newPage)}
        />
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
