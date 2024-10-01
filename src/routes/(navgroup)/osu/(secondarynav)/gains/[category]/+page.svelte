<script lang="ts">
  import RankingCountry from "$lib/components/Ranking/RankingCountry.svelte";
  import RankingEmpty from "$lib/components/Ranking/RankingEmpty.svelte";
  import RankingName from "$lib/components/Ranking/RankingName.svelte";
  import { formatNumber, getAvatarURL, getOsuProfileURL, tooltip } from "$lib/util";
  import type { PageData } from "./$types";
  import { page } from "$app/stores";

  export let data: PageData;
  let scoreCategory = $page.params.category;
  $: scoreCategory = $page.params.category;
</script>

<svelte:head>
  <title>most gained - poggers</title>
</svelte:head>

<main class="flex-fill column osu-main">
  {#if !data?.rankingData?.length}
    <RankingEmpty />
  {:else}
    <table class="osu-table">
      <tbody>
        {#each data.rankingData as plr}
          <tr>
            <td style="width: 5.25ch;">
              <strong>#{plr.rank}</strong>
            </td>

            {#if data.rankingSettings.avatars}
              <td class="hide-width-640" style="width: 64px;">
                <a
                  href={getOsuProfileURL(plr._id)}
                  target="_blank"
                  rel="noreferrer"
                  use:tooltip={{ content: "osu! profile" }}>
                  <img class="osu-avatar-small" alt="" src={getAvatarURL(plr._id)} />
                </a>
              </td>
            {/if}

            <RankingCountry country={plr.country} />

            <RankingName category={$page.params.category} {plr} />

            <td style="width: 25%;">
              +{formatNumber(plr.gained ?? 0, " ")}
              <small class="hide-width-640" style="margin-left: 8px;">
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

  @media screen and (max-width: 40rem) {
    .date-text {
      font-size: 57.5%;
    }
  }
</style>
