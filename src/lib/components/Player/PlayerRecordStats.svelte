<script lang="ts">
  import { formatNumber, tooltip } from "$lib/util";
  interface Props {
    playerCategory: App.PlayerRankingFull;
  }

  let { playerCategory }: Props = $props();
</script>

<ul class="player-stats-container right-align ul">
  {#if playerCategory.mostGained}
    <li>
      <span class="player-stat-name"> most gained </span>
      <span class="player-stat-value" use:tooltip={{ content: playerCategory.mostGained.date }}>
        {formatNumber(playerCategory.mostGained.scores)}
      </span>
    </li>
  {/if}
  {#if playerCategory.peak}
    <li>
      <span class="player-stat-name"> peak </span>
      <span class="player-stat-value" use:tooltip={{ content: playerCategory.peak.date }}>
        {formatNumber(playerCategory.peak.scores)}
      </span>
    </li>
  {/if}
  {#if playerCategory.lowest}
    <li>
      <span class="player-stat-name"> lowest </span>
      <span class="player-stat-value" use:tooltip={{ content: playerCategory.lowest.date }}>
        {formatNumber(playerCategory.lowest.scores)}
      </span>
    </li>
  {/if}
</ul>
