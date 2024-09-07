<script lang="ts">
  import { formatNumber } from "$lib/util";
  import { VisCrosshair, VisLine, VisTooltip, VisXYContainer } from "@unovis/svelte";

  export let ranks: Array<App.PlayerChartEntry> | undefined;
  export let stats: App.PlayerProfileStats;
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
      `<span><strong>rank</strong> #${formatNumber(d.rank, ",")}</span><br/>
    <span><strong>scores</strong> ${formatNumber(d.scores)}</span><br/>
    <small style="color: var(--color-active);"><em>${daysAgo ? `${daysAgo} ${daysAgoString}` : "today"}</em></small>`
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
            strokeColor="var(--color-active)"
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

<style>
  .chart-wrapper {
    position: relative;
    width: 40rem;
    height: 14rem;
    background-color: var(--color-darkish);
    border-radius: 12px;
    overflow: hidden;
  }
  :global(.player-chart-container) {
    --vis-crosshair-circle-stroke-opacity: 1;
    --vis-crosshair-line-stroke-width: 3;
    --vis-crosshair-line-stroke-color: var(--color-active);
    --vis-tooltip-background-color: var(--color-darker);
    --vis-dark-tooltip-background-color: var(--color-darker);
    --vis-tooltip-border-color: transparent;
    --vis-dark-tooltip-border-color: transparent;
    --vis-tooltip-text-color: var(--color-light);
    --vis-dark-tooltip-text-color: var(--color-light);
    --vis-tooltip-padding: 4px 6px;
    position: absolute !important;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  :global(.player-chart-container circle) {
    r: 6;
  }
  :global(.player-chart-container path) {
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  /*
  .tooltip {
    position: absolute;
    padding: 10px;
    border-radius: 10px;
    color: var(--color-lightest);
    background-color: rgba(0, 0, 0, 0.4);
    font-size: 0.75rem;
    width: max-content;
    z-index: 2;
    pointer-events: none;
  }
  .tooltip-point {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: var(--color-dark);
    border: 3px solid var(--color-active);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1;
  }
  .tooltip-line {
    position: absolute;
    width: 2px;
    height: 200px;
    background-color: var(--color-active);
    pointer-events: none;
  } */
</style>
