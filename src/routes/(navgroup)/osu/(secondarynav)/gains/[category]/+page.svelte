<script lang="ts">
  import RankingSettings from "$lib/components/Ranking/RankingSettings.svelte";
  import RankingCountry from "$lib/components/Ranking/RankingCountry.svelte";
  import RankingAvatar from "$lib/components/Ranking/RankingAvatar.svelte";
  import RankingEmpty from "$lib/components/Ranking/RankingEmpty.svelte";
  import RankingName from "$lib/components/Ranking/RankingName.svelte";
  import { rankingSettings } from "$lib/stores";
  import { formatNumber } from "$lib/util";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>most gained - poggers</title>
</svelte:head>

<main class="flex-fill column osu-main">
  {#if !data?.rankingData?.length}
    <RankingEmpty />
  {:else}
    <RankingSettings bind:settings={$rankingSettings} viewMode="gains" />

    <table class="osu-table">
      <tbody>
        {#each data.rankingData as plr}
          <tr>
            <td style="width: 5.25ch;">
              <strong>#{plr.rank}</strong>
            </td>

            {#if $rankingSettings.avatars}
              <RankingAvatar id={plr._id} />
            {/if}

            <RankingCountry country={plr.country} />

            <!-- TODO: Add players' current name next to old name -->
            <RankingName category={$page.params.category} {plr} />

            <td style="width: 30%;">
              <span>+{formatNumber(plr.gained ?? 0, " ")}</span>

              <small class="hide-width-640" style="margin-left: 8px; white-space: nowrap;">
                {formatNumber(plr.scores - (plr.gained ?? 0), " ")} → {formatNumber(plr.scores)}
              </small>

              <small class="date-text">
                {plr.date}
              </small>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</main>

<style>
  .date-text {
    white-space: nowrap;
    margin-left: 8px;
    color: #999;
  }

  @media (width <= 40rem) {
    .date-text {
      font-size: 57.5%;
    }
  }
</style>
