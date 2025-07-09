<script lang="ts">
  import { goto } from "$app/navigation";
  import { formatNumber, tooltip } from "$lib/util";
  import { VisCrosshair, VisLine, VisTooltip, VisXYContainer } from "@unovis/svelte";

  interface Props {
    ranks: Array<App.PlayerChartEntry> | undefined;
    stats: App.PlayerProfileStats;
    category: App.RankingCategory;
    playerId: number;
    days?: number;
    scoresChartVisible?: boolean;
    rankChartVisible?: boolean;
  }

  let {
    ranks,
    stats,
    category,
    playerId,
    days = 90,
    scoresChartVisible = $bindable(true),
    rankChartVisible = $bindable(true)
  }: Props = $props();

  let ranksMap: Array<App.PlayerChartEntry> | undefined = $derived(
    ranks?.toReversed().map((a, i) => {
      return { ...a, day: a?.day ?? i };
    })
  );

  const x = (d: App.PlayerChartEntry) => d.day;
  const y = (d: App.PlayerChartEntry) => d.scores;
  const yRank = (d: App.PlayerChartEntry) => (d.rank && stats ? stats.maxRank - d.rank : undefined);
  const padding = { top: 10, bottom: 10 };

  function tooltipTemplate(d: App.PlayerChartEntry) {
    const daysAgo = days - d.day - 1;
    const daysAgoString = `day${daysAgo == 1 ? "" : "s"} ago`;
    return (
      d?.scores &&
      d.rank &&
      `<table>
       <tbody>
        <tr><td class="tooltip-rank-label">rank</td><td>#${formatNumber(d.rank, ",")}</td></tr>
        <tr><td class="tooltip-scores-label">scores</td><td>${formatNumber(d.scores)}</td></tr>
        <tr><td colspan="2" class="tooltip-days-label">${daysAgo ? `${daysAgo} ${daysAgoString}` : "today"}</td></tr>
       </tbody>
       </table>`
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
        {padding}
        yDomain={[-1, stats.maxRank - stats.minRank + 1]}>
        <VisLine {x} y={yRank} color="var(--color-pink)" lineWidth={2} />
        {#if !scoresChartVisible}
          <VisTooltip horizontalShift={20} />
          <VisCrosshair
            template={tooltipTemplate}
            duration={0}
            {x}
            y={yRank}
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
        {padding}>
        <VisLine {x} {y} color="var(--color-active)" lineWidth={4} />
        <VisTooltip horizontalShift={20} />
        <VisCrosshair
          template={tooltipTemplate}
          duration={0}
          {x}
          {y}
          strokeColor="var(--color-active)"
          strokeWidth={3}
          color="var(--color-darkish)" />
      </VisXYContainer>
    {/if}
  {:else}
    <p class="solo-text">No recent data</p>
  {/if}
</div>

{#if ranksMap}
  <ul class="chart-buttons-container ul row">
    <li>
      <button
        aria-label="Toggle ranks"
        class="btn-icon"
        class:active-rank={rankChartVisible}
        onclick={() => (rankChartVisible = !rankChartVisible)}
        use:tooltip={{ content: "Toggle ranks" }}>
        <icon class="hash"></icon>
      </button>
    </li>
    <li>
      <button
        aria-label="Toggle scores"
        class="btn-icon"
        class:active-scores={scoresChartVisible}
        onclick={() => (scoresChartVisible = !scoresChartVisible)}
        use:tooltip={{ content: "Toggle scores" }}>
        {category.substring(3)}
      </button>
    </li>
    <li>
      <button
        aria-label="Go to full chart"
        class="btn-icon"
        onclick={() => goto(`/osu/players/${playerId}/${category}`)}
        use:tooltip={{ content: "Go to full chart" }}>
        <icon class="fullscreen"></icon>
      </button>
    </li>
  </ul>
{/if}

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

  :global(.tooltip-rank-label) {
    color: color-mix(in srgb, var(--color-pink) 50%, var(--color-lighter));
  }
  :global(.tooltip-scores-label) {
    color: color-mix(in srgb, var(--color-active) 50%, var(--color-lighter));
  }
  :global(.tooltip-days-label) {
    color: var(--color-active);
    font-size: 80%;
    text-align: center;
  }
</style>
