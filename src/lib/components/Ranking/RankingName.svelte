<script lang="ts">
  import { tooltip } from "$lib/util";
  import { goto } from "$app/navigation";
  import { RANKING_BADGES } from "$lib/constants";

  interface Props {
    plr: App.RankingEntry | App.MostGainedRankingEntry;
    category?: App.RankingCategory | string | undefined;
    showBadge?: boolean;
  }

  let { plr, category = undefined, showBadge = true }: Props = $props();

  const goToProfile = (plr: App.RankingEntry | App.MostGainedRankingEntry) =>
    goto(`/osu/player/${plr._id}/${category}`);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") goToProfile(plr);
  };
</script>

<td
  class="osu-name-column"
  onclick={() => goToProfile(plr)}
  onkeypress={onKey}
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
