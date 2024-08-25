<script lang="ts">
    import { formatNumber } from "$lib/util";
    export let playerCategory: App.PlayerRankingFull
    export let country: string;
    export let title = "";
</script>

<div class="stats-container hoverable" style="margin-right: 32px;">
    <h3 class="category-header">{title}</h3>
    <span class="stat-name"> scores </span>
    <span class="stat-value">
        {formatNumber(playerCategory.scores)}
        <small class="stat-small"
        >#{formatNumber(playerCategory.rank, ",")} ({country}#{formatNumber(
            playerCategory.countryRank,
            ","
        )})</small>
    </span>
    {#if playerCategory.peak?.scores != null}
        <span class="stat-name"> peak </span>
        <span class="stat-value">
        {formatNumber(playerCategory.peak.scores)}
        <small class="stat-small">{playerCategory.peak.date}</small>
        </span>
    {/if}
    {#if playerCategory.lowest?.scores != null}
        <span class="stat-name"> lowest </span>
        <span class="stat-value">
        {formatNumber(playerCategory.lowest.scores)}
        <small class="stat-small">{playerCategory.lowest.date}</small>
        </span>
    {/if}
    {#if playerCategory.gainedScores != null}
        <span class="stat-name"> gained </span>
        <span class="stat-value">
        {playerCategory.gainedScores}
        <!-- TODO: Say when that entry was -->
        <small class="stat-small">since last entry</small>
        </span>
    {/if}
</div>
  