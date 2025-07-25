<script lang="ts">
  import {
    formatNumber,
    getAvatarURL,
    transitionHeight,
    tooltip,
    getOsuProfileURL
  } from "$lib/util";
  import Loader from "$lib/components/Loader.svelte";
  import { COUNTRIES } from "$lib/constants";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  //   let loading = $state(true);
  const chartHeight = 320; // px
  let showRaw = $state(false);
</script>

<svelte:head>
  <title>{data.user.name || "breakdown"} - poggers</title>
</svelte:head>

{#await data}
  <Loader sticky={true} />
{:then data}
  <div class="user-header row flex-center">
    <a use:tooltip={{ content: "osu! profile" }} href={getOsuProfileURL(data.user.id)}>
      <img class="osu-avatar-small" alt="" src={getAvatarURL(data.user.id)} />
    </a>
    <span style="font-size: 1.125rem; margin: 0 12px;">{data.user.name}</span>
    <img
      class="osu-flag-small"
      alt={data.user.country}
      src="/flags/{data.user.country}.svg"
      use:tooltip={{
        content: COUNTRIES[data.user.country] || data.user.country
      }} />
  </div>

  {#if data.breakdown.length == 1}
    <table class="raw-table">
      <tbody>
        <tr>
          <td style="width: 5ch;"><strong>#{data.breakdown[0].rank}</strong></td>
          <td>{data.breakdown[0].value}</td>
        </tr>
      </tbody>
    </table>
  {:else}
    <div class="chart-container" style="height: {chartHeight}px;">
      {#each data.breakdown as d, i}
        <div
          class="chart-column-container"
          style="width: calc({100 / data.breakdown.length}% - 4px); left: {(i /
            data.breakdown.length) *
            100}%;">
          <div
            class="chart-column-bar"
            style="height: {(d.value / data.max) * 100}%;"
            in:transitionHeight={{
              maxHeight: chartHeight,
              duration: 200,
              delay: 12 * i
            }}>
          </div>
          <div class="column flex-center">
            <strong>#{d.rank}</strong>
            <div>{formatNumber(d.value)}</div>
          </div>
        </div>
      {/each}
    </div>

    <div class="stats-container">
      <table class="stat-table">
        <thead>
          <tr>
            <th></th>
            <th>Count</th>
            <th>Percentage of all maps</th>
            <th>Global rank</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(data.stats) as [k, v]}
            <tr>
              <td>
                <strong>{k}</strong>
              </td>
              <td>
                {formatNumber(v.value)}
              </td>
              <td>
                {Math.round((v.value / data.beatmaps) * 10000) / 100}%
              </td>
              <td>
                {#if v.rank}
                  #{formatNumber(v.rank, ",")}
                {:else}
                  -
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      <small class="row" style="justify-content: center; margin-top: 12px;">
        <span>out of</span><strong style="margin: 0 1ch;">{formatNumber(data.beatmaps)}</strong
        ><span>maps</span>
      </small>
    </div>

    <button
      type="button"
      class="btn-gray"
      style="margin-bottom: 16px;"
      onclick={() => (showRaw = !showRaw)}>
      Show raw data
    </button>
    {#if showRaw}
      <div class="table-container" transition:transitionHeight={{ maxHeight: 3200, duration: 800 }}>
        <table class="raw-table">
          <tbody>
            {#each data.breakdown as breakdown}
              <tr>
                <td style="width: 5ch;"><strong>#{breakdown.rank}</strong></td>
                <td>{breakdown.value}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
{/await}

<style>
  .table-container {
    overflow-y: hidden;
  }

  .raw-table {
    margin-bottom: 16px;
    width: 100%;
  }
  .raw-table td {
    background-color: rgba(0, 0, 0, 0.25);
    font-size: 0.825rem;
    padding: 3px;
  }
  .raw-table td:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .user-header {
    background-color: rgba(0, 0, 0, 0.25);
    padding: 12px;
    margin: 16px 0;
    line-height: 1;
  }

  .chart-container {
    box-sizing: border-box;
    width: 86%;
    margin: 32px auto;
    position: relative;
  }

  .chart-column-container {
    position: absolute;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.04);
  }
  .chart-column-container:hover > .chart-column-bar {
    opacity: 0.8;
  }
  .chart-column-bar {
    position: absolute;
    background-color: var(--color-active);
    width: 100%;
    bottom: 0;
  }

  .stats-container {
    padding: 0 6%;
    margin-bottom: 32px;
  }

  .stat-table {
    width: 100%;
  }
  .stat-table th {
    font-size: 90%;
  }
  .stat-table td {
    padding: 6px;
  }
  .stat-table tr {
    background-color: rgba(0, 0, 0, 0.25);
  }
  .stat-table tr:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
