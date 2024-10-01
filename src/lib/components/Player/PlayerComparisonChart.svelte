<script lang="ts">
  import { CHART_COLORS, CHART_RANK_COLORS, formatDate, formatNumber } from "$lib/util";
  import { VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from "@unovis/svelte";

  export let data: {
    players: Array<App.ComparisonChartPlayer & { scoresVisible?: boolean; rankVisible?: boolean }>;
    ranks: App.ComparisonChartEntries[];
  };
  export let category: App.RankingCategory;

  const x = (d: App.ComparisonChartEntry) => Number(d.date);
  const y = (d: any, plrId: string, field: string) => d.players[plrId]?.[field];

  function tooltipPlayerHTML(d: any, plrId: string) {
    const plrDataIndex = data.players.findIndex((plr) => plr.id == plrId);
    const scores = d.players?.[plrId]?.scores;
    if (!scores || plrDataIndex === -1) return "";
    const rank = d.players[plrId].rank;
    const name = data.players[plrDataIndex].name;
    const color = data.players[plrDataIndex].color ?? "inherit";

    return `<tr>
    <td style="text-align: right;">${name}</td>
    <td><strong style="color: ${color};">#</strong> ${formatNumber(rank, ",")}</td>
    <td><strong style="color: ${color};">${category.substring(3)}</strong> ${formatNumber(scores)}</td>
    </tr>`;
  }

  function tooltipTemplate(d: any) {
    const timestamp = Number(d?.date);
    if (isNaN(timestamp)) return;

    let tooltipString = "<table class='comparison-tooltip-table'><tbody>";
    for (const plrId in d.players) tooltipString += tooltipPlayerHTML(d, plrId);

    return `${tooltipString}
    <tr><td colspan='3' style='text-align: center;'>
    <small style="color: var(--color-active);">${formatDate(new Date(timestamp))}</small>
    </td></tr>
    </tbody>
    </table>`;
  }

  const margin = { left: 62, right: 0, top: 0, bottom: 36 };
  const tickFormatX = (timestamp: number) => formatDate(new Date(timestamp));
  const tickFormatY = (scores: number) => formatNumber(scores);
</script>

{#if data?.ranks?.length}
  <VisXYContainer
    class="player-chart-container chart-ranks"
    data={data.ranks}
    yDirection="south"
    duration={200}
    padding={{ top: 30, bottom: 30 }}
    autoMargin={false}
    {margin}>
    {#each data.players as player, i (player.id)}
      {#if player.rankVisible !== false}
        <VisLine
          {x}
          y={(d) => y(d, player.id, "rank")}
          color={CHART_RANK_COLORS[i % CHART_RANK_COLORS.length]}
          lineWidth={4} />
        {#if player.scoresVisible === false}
          <VisTooltip horizontalShift={20} {x} y={(d) => y(d, player.id, "rank")} />
          <VisCrosshair
            template={tooltipTemplate}
            duration={0}
            strokeColor={CHART_RANK_COLORS}
            strokeWidth={4}
            color="var(--color-darkish)" />
        {/if}
      {/if}
    {/each}
  </VisXYContainer>

  <VisXYContainer
    class="player-chart-container chart-scores"
    data={data.ranks}
    duration={200}
    padding={{ top: 10, bottom: 10 }}
    autoMargin={false}
    {margin}>
    <VisAxis
      type="x"
      gridLine={false}
      domainLine={false}
      tickLine={false}
      tickTextColor="var(--color-lighter)"
      tickFormat={tickFormatX}
      tickTextFontSize="14px"
      tickCount={5}
      position="bottom" />
    <VisAxis
      type="y"
      gridLine={true}
      domainLine={false}
      tickLine={false}
      tickTextColor="var(--color-lighter)"
      tickFormat={tickFormatY}
      tickTextFontSize="14px"
      tickCount={5}
      position="left" />

    {#each data.players as player (player.id)}
      {#if player.scoresVisible !== false}
        <VisLine {x} y={(d) => y(d, player.id, "scores")} color={player.color} lineWidth={6} />
        <VisTooltip horizontalShift={20} {x} y={(d) => y(d, player.id, "scores")} />
        <VisCrosshair
          template={tooltipTemplate}
          duration={0}
          strokeColor={CHART_COLORS}
          strokeWidth={4}
          color="var(--color-darkish)" />
      {/if}
    {/each}
  </VisXYContainer>
{:else}
  <p class="solo-text">No data</p>
{/if}

<style>
</style>
