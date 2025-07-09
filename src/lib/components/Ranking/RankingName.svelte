<script lang="ts">
  import { tooltip } from "$lib/util";
  import { goto } from "$app/navigation";
  import { RANKING_BADGES } from "$lib/constants";

  export let plr: App.RankingEntry | App.MostGainedRankingEntry;
  export let category: App.RankingCategory | string | undefined = undefined;
  export let showBadge = true;

  const goToProfile = (plr: App.RankingEntry | App.MostGainedRankingEntry) =>
    goto(`/osu/player/${plr._id}/${category}`);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") goToProfile(plr);
  };
</script>

<td
  class="osu-name-column"
  on:click={() => goToProfile(plr)}
  on:keypress={onKey}
  style="cursor: pointer;">
  <div class="row">
    <span>{plr.name}</span>
    <!-- {#if plr.currentName}
        <small>{plr.currentName}</small>
    {/if} -->
    {#if showBadge && RANKING_BADGES[plr._id]}
      <img
        class="osu-badge"
        alt="pog"
        src={RANKING_BADGES[plr._id].img}
        use:tooltip={{ content: RANKING_BADGES[plr._id].title ?? "" }} />
    {/if}
  </div>
</td>
