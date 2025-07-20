<script lang="ts">
  import { formatNumber } from "$lib/util";

  interface Props {
    stats: App.PlayerProfileStats;
    days?: number;
  }

  let { stats, days = 90 }: Props = $props();

  let changeScores = $derived(stats.endScores - stats.startScores);
  let avgPerDay = $derived(Math.round((changeScores / days) * 100) / 100);
</script>

<div class="player-chart-stats-container-header">Last <strong>{days}</strong> days</div>
<div class="player-chart-stats-container column">
  <ul class="player-stats-container center-align ul row">
    <li>
      <span class="player-stat-name">Peak</span>
      <span class="player-stat-value">{formatNumber(stats.maxScores)}</span>
    </li>
    <li>
      <span class="player-stat-name">Change</span>
      <span class="player-stat-value">
        {changeScores > 0 ? "+" : ""}{formatNumber(changeScores)}
        <small class="player-stat-small">{avgPerDay}/day</small>
      </span>
    </li>
    <li>
      <span class="player-stat-name">Lowest</span>
      <span class="player-stat-value">{formatNumber(stats.minScores)}</span>
    </li>
  </ul>
</div>

<style>
  .player-chart-stats-container-header,
  .player-chart-stats-container {
    background-color: var(--color-darkish);
    border-radius: 12px;
  }
  .player-chart-stats-container-header {
    margin: 0 auto;
    margin-top: 16px;
    padding: 4px 16px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    width: fit-content;
  }
  .player-chart-stats-container {
    padding: 8px;
    gap: 8px;
  }

  .ul li {
    flex-direction: column;
  }
</style>
