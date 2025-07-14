<script lang="ts">
  import { VisStackedBar, VisTooltip, VisXYContainer } from "@unovis/svelte";
  import { Direction, Orientation, StackedBar } from "@unovis/ts";
  import { CATEGORY_COLORS, SCORE_CATEGORIES } from "$lib/constants";
  import type { PageData } from "../../../routes/(navgroup)/osu/player/[idOrName]/[[category]]/$types";

  interface Props {
    data: PageData;
    forceVisible?: boolean;
  }
  type ChartData = {
    [category in App.RankingCategory]: number;
  };

  let { data, forceVisible }: Props = $props();
  const enoughDataToRender = isEnoughDataToRender();
  const chartData = convertCategoryData(data);
  const tooltipData = getTooltipData(data);

  function removeOutdatedCategories(data: PageData) {
    for (const category of SCORE_CATEGORIES) {
      const categoryData = data[category];
      console.log(categoryData);
    }
    // TODO
  }

  function isEnoughDataToRender() {
    if (forceVisible) return true;
    removeOutdatedCategories(data);

    let fitCategoryCount = 0;
    for (const category of SCORE_CATEGORIES) {
      const categoryData = data[category];
      if (categoryData?.scores) ++fitCategoryCount;
    }

    return fitCategoryCount >= 2;
  }

  function convertCategoryData(data: PageData) {
    const convertedData: ChartData[] = [];
    if (!enoughDataToRender) return convertedData;

    for (const category of SCORE_CATEGORIES) {
      const categoryData = data[category];
      if (!categoryData) continue;

      convertedData[0] = { ...(convertedData[0] ?? {}), [category]: categoryData.scores };
    }

    return convertedData.reverse();
  }

  function getTooltipData(data: PageData) {
    return "";
  }

  const x = (d: ChartData, i: number) => i;
  const y = SCORE_CATEGORIES.map((category) => (d: ChartData) => d[category]);

  function tooltipTemplate() {
    return `<table>
       <tbody>
        <tr><td class="">scores</td></tr>
        <tr><td class="">uaua ${tooltipData}</tr>
       </tbody>
    </table>`;
  }
</script>

{#if enoughDataToRender}
  <div class="player-all-chart-wrapper">
    <VisXYContainer
      class="player-all-chart"
      data={chartData}
      height={50}
      yDirection={Direction.South}>
      <VisStackedBar
        {x}
        {y}
        data={chartData}
        orientation={Orientation.Horizontal}
        color={(d: ChartData, i: number) => CATEGORY_COLORS[SCORE_CATEGORIES[i]]} />
      <VisTooltip
        triggers={{ [StackedBar.selectors.bar]: tooltipTemplate }}
        verticalPlacement="bottom"
        verticalShift={30}
        container={document.body} />
    </VisXYContainer>
  </div>
{/if}

<style>
  .player-all-chart-wrapper {
    max-width: clamp(480px, 50%, 100%);
    margin: 12px auto 0 auto;
    border-radius: 12px;
    overflow: hidden;
  }
</style>
