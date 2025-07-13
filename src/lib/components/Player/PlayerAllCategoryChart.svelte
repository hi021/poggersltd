<script lang="ts">
  import { VisStackedBar, VisTooltip, VisXYContainer } from "@unovis/svelte";
  import { SCORE_CATEGORIES } from "$lib/constants";
  import { Direction, Orientation, StackedBar } from "@unovis/ts";
  import type { PageData } from "../../../routes/(navgroup)/osu/player/[idOrName]/[[category]]/$types";

  interface Props {
    data: PageData;
    forceVisible?: boolean;
  }
  interface ChartData {
    [category: string]: number;
  }

  const CATEGORY_COLORS = {
    top50: "var(--color-active)",
    top25: "",
    top8: "",
    top1: "var(--color-pink)"
  };

  let { data, forceVisible }: Props = $props();
  let chartData = convertCategoryData(data);

  function convertCategoryData(data: PageData) {
    const convertedData: ChartData[] = [];

    for (const category of SCORE_CATEGORIES) {
      const categoryData = data[category];
      if (!categoryData) continue;

      convertedData[0] = { ...(convertedData[0] ?? {}), [category]: categoryData.scores };
    }

    return convertedData.reverse();
  }

  const x = (d: ChartData, i: number) => i;
  const y = SCORE_CATEGORIES.map((i) => (d: ChartData) => d[i]);

  function tooltipTemplate(d: ChartData, i: number) {
    const category = SCORE_CATEGORIES[i];
    return `<div style="font-size: 12px">
    ${category}
    ${d[category]}
    </div>`;
  }
</script>

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
    <VisTooltip triggers={{ [StackedBar.selectors.bar]: tooltipTemplate }} />
  </VisXYContainer>
</div>

<style>
  .player-all-chart-wrapper {
    max-width: clamp(480px, 50%, 100%);
    margin: 12px auto 0 auto;
    border-radius: 12px;
    overflow: hidden;
  }
</style>
