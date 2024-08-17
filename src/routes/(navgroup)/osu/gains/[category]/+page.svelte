<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Loader from "$lib/components/Loader.svelte";
  import RankingCountry from "$lib/components/Ranking/RankingCountry.svelte";
  import RankingEmpty from "$lib/components/Ranking/RankingEmpty.svelte";
  import RankingName from "$lib/components/Ranking/RankingName.svelte";
  import { formatNumber, getAvatarURL, tooltip } from "$lib/util";
  import type { PageData } from "./$types";

  export let data: PageData;
  let scoreCategory = $page.params.category;
  $: scoreCategory = $page.params.category;

  const setURL = () => goto(`/osu/gains/${scoreCategory || "top50"}`);
</script>

<svelte:head>
  <title>most gained - poggers</title>
</svelte:head>

<nav class="secondary-nav row">
  <div class="secondary-nav-inner row">
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top50"}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          scoreCategory = "top50";
          setURL();
        }
      }}
      on:click={() => {
        scoreCategory = "top50";
        setURL();
      }}>
      Top 50
    </button>
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top25"}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          scoreCategory = "top25";
          setURL();
        }
      }}
      on:click={() => {
        scoreCategory = "top25";
        setURL();
      }}>
      Top 25
    </button>
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top8"}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          scoreCategory = "top8";
          setURL();
        }
      }}
      on:click={() => {
        scoreCategory = "top8";
        setURL();
      }}>
      Top 8
    </button>
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top1"}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          scoreCategory = "top1";
          setURL();
        }
      }}
      on:click={() => {
        scoreCategory = "top1";
        setURL();
      }}>
      Top 1
    </button>
  </div>
</nav>

<main class="flex-fill osu-main">
  {#await data.rankingData}
    <Loader margin="2rem" sticky={true} />
  {:then data}
    {#if !data?.rankingData?.length}
      <RankingEmpty />
    {:else}
      <table class="osu-table">
        <tbody>
          {#each data.rankingData as plr}
            <tr
              class:top-rank={plr._id <= 3}
              style="background-position: 50% {plr._id * 46 + 320}px;">
              <td style="width: 5.25ch;">
                <strong>#{plr._id}</strong>
              </td>
              {#if data.rankingSettings.avatars}
                <td class="hide-width-640" style="width: 64px;">
                  <a
                    href="https://osu.ppy.sh/users/{plr.id}"
                    target="_blank"
                    rel="noreferrer"
                    use:tooltip={{ content: "osu! profile" }}>
                    <img class="osu-avatar-small" alt="" src={getAvatarURL(plr.id)} />
                  </a>
                </td>
              {/if}

              <RankingCountry country={plr.country} />

              <RankingName category={$page.params.category} {plr} />

              <td style="width: 25%;">
                +{formatNumber(plr.gained ?? 0, " ")}
                <small class="hide-width-640" style="margin-left: 8px;">
                  {formatNumber(plr.value - (plr.gained ?? 0), " ")} → {formatNumber(plr.value)}
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
  {/await}
</main>

<style>
  .date-text {
    white-space: nowrap;
    margin-left: 8px;
    color: #999;
  }

  @media screen and (max-width: 640px) {
    .date-text {
      font-size: 57.5%;
    }
  }
</style>
