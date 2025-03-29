<script lang="ts">
  import { tooltip } from "$lib/util";
  export let categoryStats: App.PlayerRankingFullAPI;

  // TODO FIXME: when changing tabs this can be undefined before its set to proper value
 $: console.log(categoryStats.daysOutdated)
  const content = `${categoryStats.daysOutdated} day${categoryStats.daysOutdated == 1 ? "" : "s"} out of date`;
  const warningColor =
    categoryStats.daysOutdated && categoryStats.daysOutdated >= 28
      ? "var(--color-red)"
      : categoryStats.daysOutdated && categoryStats.daysOutdated >= 3
        ? "var(--color-yellow)"
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

  @media (width <= 40rem) {
    .date-container {
      margin-top: 20px;
    }
  }
</style>
