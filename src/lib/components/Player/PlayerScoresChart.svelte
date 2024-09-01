<script lang="ts">
    import { formatNumber } from "$lib/util";
    import { VisCrosshair, VisLine, VisTooltip, VisXYContainer } from "@unovis/svelte";

  type ChartEntry = { day: number; scores?: number; rank?: number };
  export let ranks: Array<ChartEntry> | undefined;

  let days: number;
  let ranksMap: Array<ChartEntry> | undefined;
  $: {
   days = ranks?.length ?? 0;
    ranksMap = ranks?.reverse().map((a, i) => {return {...a, day: i}});
  }
  const x = (d: ChartEntry) => d.day
  const y = (d: ChartEntry) => d.scores
  const color = (d: ChartEntry, i: number) => ['var(--color-active)', 'var(--color-claret)'][i]

  function tooltipTemplate(d: ChartEntry) {
    const daysAgo = days - d.day;
    const daysAgoString = 'day' + (daysAgo == 1 ? '' : 's') + ' ago';
    return d?.scores ? `<span>${formatNumber(d.scores)}
    ${daysAgo ? `${daysAgo} ${daysAgoString}` : 'today'}</span>` : '';
  }
</script>
  
<div class="chart-wrapper">
  {#if ranksMap}
  <VisXYContainer class="player-chart-container" data={ranksMap} duration={200} padding={{top: 10, bottom: 10}}>
    <VisLine {x} {y} {color} lineWidth={4} />
    <VisTooltip />
    <VisCrosshair template={tooltipTemplate} {x} {y}/>
  </VisXYContainer>
  {/if}
</div>

<style>
  .chart-wrapper {
    width: 40rem;
    height: 14rem;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    margin: 0 16px;
    overflow: hidden;
  }
  :global(.player-chart-container) {
    width: inherit;
    height: inherit;
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
