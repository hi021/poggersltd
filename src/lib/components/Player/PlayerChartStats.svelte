<script lang="ts">
  import { formatNumber } from "$lib/util";

  export let stats: App.PlayerProfileStats;
  export let days = 90;

  let change: number;
  let avgPerDay: number;
  $: {
    change = stats.maxScores - stats.minScores;
    avgPerDay = Math.round((change / days) * 100) / 100;
  }
</script>

<ul class="player-stats-container ul row" style="justify-content: space-around;">
  <li>
    <span class="player-stat-name">Change</span>
    <span class="player-stat-value">{formatNumber(change)}</span>
  </li>
  <li>
    <span class="player-stat-name">Average</span>
    <span class="player-stat-value">{formatNumber(avgPerDay)}</span>
  </li>
</ul>

<style>
  .ul li {
    flex-direction: column;
  }
</style>
