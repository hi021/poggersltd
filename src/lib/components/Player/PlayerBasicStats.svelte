<script lang="ts">
  import { formatNumber } from "$lib/util";
  export let playerCategory: App.PlayerRankingFull;
</script>

<div class="player-stats-container">
  <span class="player-stat-name"> scores </span>
  <span class="player-stat-value">
    {formatNumber(playerCategory.scores)}
  </span>
  <span class="player-stat-name"> rank </span>
  <span class="player-stat-value">
    #{formatNumber(playerCategory.rank, ",")}
  </span>
  <span class="player-stat-name"> country rank </span>
  <span class="player-stat-value">
    #{formatNumber(playerCategory.countryRank, ",")}
  </span>
</div>
