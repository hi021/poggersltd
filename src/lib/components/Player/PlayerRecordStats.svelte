<script lang="ts">
  import { formatNumber, tooltip } from "$lib/util";
  export let playerCategory: App.PlayerRankingFull;
</script>

<div class="player-stats-container">
  {#if playerCategory.mostGained}
    <span class="player-stat-name"> most gained </span>
    <span class="player-stat-value" use:tooltip={{ content: playerCategory.mostGained.date }}>
      {formatNumber(playerCategory.mostGained.scores)}
    </span>
  {/if}
  {#if playerCategory.peak}
    <span class="player-stat-name"> peak </span>
    <span class="player-stat-value" use:tooltip={{ content: playerCategory.peak.date }}>
      {formatNumber(playerCategory.peak.scores)}
    </span>
  {/if}
  {#if playerCategory.lowest}
    <span class="player-stat-name"> lowest </span>
    <span class="player-stat-value" use:tooltip={{ content: playerCategory.lowest.date }}>
      {formatNumber(playerCategory.lowest.scores)}
    </span>
  {/if}
</div>
