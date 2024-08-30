<script lang="ts">
  import { formatNumber } from "$lib/util";
  export let playerCategory: App.PlayerRankingFull;
  export let country: string;
  export let title = "";
</script>

<div class="player-stats-container hoverable" style="margin-right: 32px;">
  <h3 class="player-category-header">{title}</h3>
  <span class="player-stat-name"> scores </span>
  <span class="player-stat-value">
    {formatNumber(playerCategory.scores)}
    <small class="player-stat-small"
      >#{formatNumber(playerCategory.rank, ",")} ({country}#{formatNumber(
        playerCategory.countryRank,
        ","
      )})</small>
  </span>
  {#if playerCategory.peak?.scores != null}
    <span class="player-stat-name"> peak </span>
    <span class="player-stat-value">
      {formatNumber(playerCategory.peak.scores)}
      <small class="player-stat-small">{playerCategory.peak.date}</small>
    </span>
  {/if}
  {#if playerCategory.lowest?.scores != null}
    <span class="player-stat-name"> lowest </span>
    <span class="player-stat-value">
      {formatNumber(playerCategory.lowest.scores)}
      <small class="player-stat-small">{playerCategory.lowest.date}</small>
    </span>
  {/if}
  {#if playerCategory.gainedScores != null}
    <span class="player-stat-name"> gained </span>
    <span class="player-stat-value">
      {playerCategory.gainedScores}
      <!-- TODO: Say when that entry was -->
      <small class="player-stat-small">since last entry</small>
    </span>
  {/if}
</div>
