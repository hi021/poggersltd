<script lang="ts">
  import { CATEGORY_COLORS } from "$lib/constants";
  import { addDays, formatDate, formatNumber, getDaysBetweenDates, tooltip } from "$lib/util";
  interface Props {
    playerCategory: App.PlayerRankingFull;
    country: string;
    title?: string;
  }

  let { playerCategory, country, title = "" }: Props = $props();

  const color = CATEGORY_COLORS[`top${title}` as App.RankingCategory];
  const peakDifference = formatNumber(playerCategory.scores - (playerCategory.peak?.scores ?? 0));
  const daysSincePeak = getDaysBetweenDates(new Date(playerCategory.peak?.date ?? 0).valueOf());
  const daysSincePeakString = daysSincePeak
    ? `${daysSincePeak} day${daysSincePeak == 1 ? "" : "s"} ago`
    : "now";
  const lowestDifference = formatNumber(
    playerCategory.scores - (playerCategory.lowest?.scores ?? 0)
  );
  const daysSinceLowest = getDaysBetweenDates(new Date(playerCategory.lowest?.date ?? 0).valueOf());
  const daysSinceLowestString = daysSinceLowest
    ? `${daysSinceLowest} day${daysSinceLowest == 1 ? "" : "s"} ago`
    : "now";
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
    <li
      use:tooltip={{
        content: `${peakDifference} ● ${daysSincePeakString}`,
        options: { placement: "right" }
      }}>
      <span class="player-stat-name"> peak </span>
      <span class="player-stat-value">
        {formatNumber(playerCategory.peak.scores)}
        <small class="player-stat-small">{playerCategory.peak.date}</small>
      </span>
    </li>
  {/if}
  {#if playerCategory.lowest?.scores != null}
    <li
      use:tooltip={{
        content: `+${lowestDifference} ● ${daysSinceLowestString}`,
        options: { placement: "right" }
      }}>
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
