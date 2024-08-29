<script lang="ts">
  import { formatNumber } from "$lib/util";
  export let playerCategory: App.PlayerRankingFull;
</script>

<div class="stats-container">
  <span class="stat-name"> scores </span>
  <span class="stat-value">
    {formatNumber(playerCategory.scores)}
  </span>
  <span class="stat-name"> rank </span>
  <span class="stat-value">
    #{formatNumber(playerCategory.rank, ",")}
  </span>
  <span class="stat-name"> country rank </span>
  <span class="stat-value">
    #{formatNumber(playerCategory.countryRank, ",")}
  </span>
</div>
