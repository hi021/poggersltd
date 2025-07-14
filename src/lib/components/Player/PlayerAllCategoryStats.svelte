<script lang="ts">
  import { CATEGORY_COLORS } from "$lib/constants";
  import { addDays, formatDate, formatNumber } from "$lib/util";
  interface Props {
    playerCategory: App.PlayerRankingFull;
    country: string;
    title?: string;
  }

  let { playerCategory, country, title = "" }: Props = $props();
  const color = CATEGORY_COLORS[`top${title}` as App.RankingCategory];
</script>

<ul class="player-stats-container ul hoverable">
  <li><h3 class="player-category-header">#<strong style="color: {color}">{title}</strong></h3></li>
  <li>
    <span class="player-stat-name"> scores </span>
    <span class="player-stat-value">
      {formatNumber(playerCategory.scores)}
      <small class="player-stat-small"
        >#{formatNumber(playerCategory.rank, ",")} ({country}#{formatNumber(
          playerCategory.countryRank,
          ","
        )})</small>
    </span>
  </li>
  {#if playerCategory.peak?.scores != null}
    <li>
      <span class="player-stat-name"> peak </span>
      <span class="player-stat-value">
        {formatNumber(playerCategory.peak.scores)}
        <small class="player-stat-small">{playerCategory.peak.date}</small>
      </span>
    </li>
  {/if}
  {#if playerCategory.lowest?.scores != null}
    <li>
      <span class="player-stat-name"> lowest </span>
      <span class="player-stat-value">
        {formatNumber(playerCategory.lowest.scores)}
        <small class="player-stat-small">{playerCategory.lowest.date}</small>
      </span>
    </li>
  {/if}
  {#if playerCategory.gainedScores != null}
    <li>
      <span class="player-stat-name"> gained </span>
      <span class="player-stat-value">
        {playerCategory.gainedScores}
        <small class="player-stat-small"
          >since {formatDate(
            addDays(new Date(playerCategory.date), -((playerCategory.gainedDays ?? 0) + 1))
          )}</small>
      </span>
    </li>
  {/if}
</ul>
