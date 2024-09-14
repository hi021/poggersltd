<script lang="ts">
  import { tooltip } from "$lib/util";
  export let categoryStats: App.PlayerRankingFullAPI;

  const content = `${categoryStats.daysOutdated} day${categoryStats.daysOutdated == 1 ? "" : "s"} out of date`;
  const warningColor =
    categoryStats.daysOutdated && categoryStats.daysOutdated >= 28
      ? "hsl(var(--clr-red))"
      : categoryStats.daysOutdated && categoryStats.daysOutdated >= 3
        ? "hsl(var(--clr-yellow))"
        : "inherit";
</script>

<small class="date-container">
  Data from
  <strong class="flex-center">
    {categoryStats.date}
    {#if categoryStats.daysOutdated}
      <icon class="warning" style="color: {warningColor};" use:tooltip={{ content }} />
    {/if}
  </strong>
</small>

<style>
  .date-container {
    margin: auto;
    margin-bottom: 0;
  }
  strong {
    display: inline-flex;
    line-height: 1;
    gap: 0.333ch;
  }
</style>
