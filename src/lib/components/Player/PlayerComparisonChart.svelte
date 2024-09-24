<script lang="ts">
  import { formatDate, formatNumber, isObjEmpty } from "$lib/util";
  import { VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from "@unovis/svelte";

//   TODO: TYPINGS AND COLORS
  export let data: {
    players: Array<App.ComparisonChartPlayer & { scoresVisible?: boolean; rankVisible?: boolean }>;
    ranks: App.ComparisonChartEntries[];
  };
  export let category: App.RankingCategory;

  const x = (d: App.ComparisonChartEntry) => Number(d.date);
  const y = (d: any, plrId: string, field: string) => d[plrId]?.[field];

  function tooltipPlayerHTML(d: any, plrId: string) {
    const plrDataIndex = data.players.findIndex((plr) => plr.id == plrId);
    const scores = d[plrId]?.scores;
    if (!scores || plrDataIndex === -1) return "";
    const rank = d[plrId].rank;
    const name = data.players[plrDataIndex].name;
    const color = data.players[plrDataIndex].color ?? "inherit";

    return `<tr>
    <td style="color: ${color}; text-align: right;">${name}</td>
    <td><strong>#</strong> ${formatNumber(rank, ",")}</td>
    <td><strong>${category.substring(3)}</strong> ${formatNumber(scores)}</td>
    </tr>`;
  }

  function tooltipTemplate(d: any) {
    const timestamp = Number(d?.date);
    if (isNaN(timestamp)) return;

    let tooltipString = "<table class='comparison-tooltip-table'><tbody>";
    for (const plrId in d) tooltipString += tooltipPlayerHTML(d, plrId);

    return (
      tooltipString +
      `<tr><td colspan='3' style='text-align: center;'>
    <small style="color: var(--color-active);">${formatDate(new Date(timestamp))}</small>
    </td></tr>
    </tbody>
    </table>`
    );
  }

  const margin = { left: 62, right: 0, top: 0, bottom: 36 };
  const tickFormatX = (timestamp: number) => formatDate(new Date(timestamp));
  const tickFormatY = (scores: number) => formatNumber(scores);
</script>

{#if data?.ranks && !isObjEmpty(data.ranks)}
  <VisXYContainer
    class="player-chart-container chart-ranks"
    yDirection="south"
    data={data.ranks}
    duration={200}
    autoMargin={false}
    {margin}
    padding={{ top: 22, bottom: 22 }}>
    {#each data.players as player (player.id)}
      {#if player.rankVisible !== false}
        <VisLine {x} y={(d) => y(d, player.id, "rank")} color="var(--color-pink)" lineWidth={2} />
        {#if player.scoresVisible === false}
          <VisTooltip horizontalShift={20} />
          <VisCrosshair
            template={(d) => tooltipTemplate(d, player.id)}
            {x}
            y={(d) => y(d, player.id, "rank")}
            duration={0}
            hideWhenFarFromPointerDistance={10}
            strokeColor="var(--color-pink)"
            strokeWidth={3}
            color="var(--color-darkish)" />
        {/if}
      {/if}
    {/each}
  </VisXYContainer>

  <VisXYContainer
    class="player-chart-container chart-scores"
    data={data.ranks}
    duration={200}
    autoMargin={false}
    {margin}
    padding={{ top: 10, bottom: 10 }}>
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
      tickCount={5}
      tickTextFontSize="14px"
      position="left" />
    {#each data.players as player (player.id)}
      {#if player.scoresVisible !== false}
        <VisLine
          {x}
          y={(d) => y(d, player.id, "scores")}
          color="var(--color-active)"
          lineWidth={4} />
        <VisTooltip horizontalShift={20} {x} y={(d) => y(d, player.id, "scores")} />
        <VisCrosshair
          template={(d) => tooltipTemplate(d, player.id)}
          duration={0}
          strokeColor="var(--color-active)"
          strokeWidth={3}
          color="var(--color-darkish)" />
      {/if}
    {/each}
  </VisXYContainer>
{:else}
  <p class="solo-text">No data</p>
{/if}

<style>
</style>
