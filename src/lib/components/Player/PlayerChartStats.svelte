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

<div class="player-chart-stats-container column">
  <span class="day-span">Last <strong>{days}</strong> days:</span>
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
  .player-chart-stats-container {
    margin-top: 16px;
    gap: 8px;
    background-color: var(--color-darkish);
    padding: 8px;
    border-radius: 12px;
  }
  .ul li {
    flex-direction: column;
  }
  .day-span {
    text-align: center;
  }
</style>
