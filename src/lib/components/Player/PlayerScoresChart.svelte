<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatNumber, tooltip } from "$lib/util";
  import { VisCrosshair, VisLine, VisTooltip, VisXYContainer } from "@unovis/svelte";

  export let ranks: Array<App.PlayerChartEntry> | undefined;
  export let stats: App.PlayerProfileStats;
  export let category: App.RankingCategory;
  export let idOrName: string;
  export let days = 90;
  export let scoresChartVisible = true;
  export let rankChartVisible = true;

  let ranksMap: Array<App.PlayerChartEntry> | undefined;
  $: {
    ranksMap = ranks?.toReversed().map((a, i) => {
      return { ...a, day: a?.day ?? i };
    });
  }
  const x = (d: App.PlayerChartEntry) => d.day;
  const y = (d: App.PlayerChartEntry) => d.scores;
  const yRank = (d: App.PlayerChartEntry) => (d.rank && stats ? stats.maxRank - d.rank : undefined);

  function tooltipTemplate(d: App.PlayerChartEntry) {
    const daysAgo = days - d.day - 1;
    const daysAgoString = "day" + (daysAgo == 1 ? "" : "s") + " ago";
    return (
      d?.scores &&
      d.rank &&
      `<span><strong><em>rank</em></strong> #${formatNumber(d.rank, ",")}</span><br/>
    <span><strong><em>scores</em></strong> ${formatNumber(d.scores)}</span><br/>
    <small style="color: var(--color-active);">${daysAgo ? `${daysAgo} ${daysAgoString}` : "today"}</small>`
    );
  }
</script>

<div class="chart-wrapper">
  {#if ranksMap}
    {#if rankChartVisible}
      <VisXYContainer
        class="player-chart-container chart-ranks"
        data={ranksMap}
        duration={200}
        padding={{ top: 10, bottom: 10 }}
        yDomain={[-1, stats.maxRank - stats.minRank + 1]}>
        <VisLine {x} y={yRank} color="var(--color-pink)" lineWidth={2} />
        {#if !scoresChartVisible}
          <VisTooltip horizontalShift={20} />
          <VisCrosshair
            template={tooltipTemplate}
            {x}
            y={yRank}
            duration={0}
            hideWhenFarFromPointerDistance={10}
            strokeColor="var(--color-pink)"
            strokeWidth={3}
            color="var(--color-darkish)" />
        {/if}
      </VisXYContainer>
    {/if}

    {#if scoresChartVisible}
      <VisXYContainer
        class="player-chart-container chart-scores"
        data={ranksMap}
        duration={200}
        padding={{ top: 10, bottom: 10 }}>
        <VisLine {x} {y} color="var(--color-active)" lineWidth={4} />
        <VisTooltip horizontalShift={20} />
        <VisCrosshair
          template={tooltipTemplate}
          duration={0}
          {x}
          {y}
          hideWhenFarFromPointerDistance={10}
          strokeColor="var(--color-active)"
          strokeWidth={3}
          color="var(--color-darkish)" />
      </VisXYContainer>
    {/if}
  {:else}
    <p class="solo-text">No data</p>
  {/if}
</div>
<ul class="chart-buttons-container ul row">
  <li>
    <button
      class="btn-icon"
      class:active-rank={rankChartVisible}
      on:click={() => (rankChartVisible = !rankChartVisible)}
      use:tooltip={{ content: "Toggle ranks" }}>
      <icon class="hash" />
    </button>
  </li>
  <li>
    <button
      class="btn-icon"
      class:active-scores={scoresChartVisible}
      on:click={() => (scoresChartVisible = !scoresChartVisible)}
      use:tooltip={{ content: "Toggle scores" }}>
      {category.substring(3)}
    </button>
  </li>
  <li>
    <button
      class="btn-icon"
      on:click={() => goto(`/osu/players/${idOrName}/${category}`)}
      use:tooltip={{ content: "Go to full chart" }}>
      <icon class="fullscreen" />
    </button>
  </li>
</ul>

<style>
  .chart-wrapper {
    position: relative;
    height: 14rem;
    background-color: var(--color-darkish);
    border-radius: 12px;
    overflow: hidden;
  }

  .chart-buttons-container {
    font-size: 0.75em;
    padding-left: 12px;
  }
  .chart-buttons-container button {
    font-weight: 500;
    color: var(--color-lighter);
    background-color: var(--color-darkish);
    border-radius: 0;
    padding: 2px 5px;
    opacity: 1;
  }
  .chart-buttons-container button.active-rank {
    color: var(--color-pink);
  }
  .chart-buttons-container button.active-scores {
    color: var(--color-active);
  }
  .chart-buttons-container button:hover {
    background-color: var(--color-dark);
  }
  .chart-buttons-container li:first-child button {
    border-bottom-left-radius: 6px;
  }
  .chart-buttons-container li:last-child button {
    border-bottom-right-radius: 6px;
  }
</style>
