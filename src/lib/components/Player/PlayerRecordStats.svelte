<script lang="ts">
  import { formatNumber, tooltip } from "$lib/util";
  export let playerCategory: App.PlayerRankingFull;
</script>

<div class="stats-container">
  {#if playerCategory.mostGained}
    <span class="stat-name left"> most gained </span>
    <span class="stat-value" use:tooltip={{ content: playerCategory.mostGained.date }}>
      {formatNumber(playerCategory.mostGained.scores)}
    </span>
  {/if}
  {#if playerCategory.peak}
    <span class="stat-name left"> peak </span>
    <span class="stat-value" use:tooltip={{ content: playerCategory.peak.date }}>
      {formatNumber(playerCategory.peak.scores)}
    </span>
  {/if}
  {#if playerCategory.lowest}
    <span class="stat-name left"> lowest </span>
    <span class="stat-value" use:tooltip={{ content: playerCategory.lowest.date }}>
      {formatNumber(playerCategory.lowest.scores)}
    </span>
  {/if}
</div>
