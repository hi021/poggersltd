<script lang="ts">
  import { formatNumber } from "$lib/util";
  export let playerCategory: App.PlayerRankingFull;
</script>

<ul class="player-stats-container ul">
  <li>
    <span class="player-stat-name"> scores </span>
    <span class="player-stat-value">
      {formatNumber(playerCategory.scores)}
    </span>
  </li>
  <li>
    <span class="player-stat-name"> rank </span>
    <span class="player-stat-value">
      #{formatNumber(playerCategory.rank, ",")}
    </span>
  </li>
  <li>
    <span class="player-stat-name"> country rank </span>
    <span class="player-stat-value">
      #{formatNumber(playerCategory.countryRank, ",")}
    </span>
  </li>
</ul>
