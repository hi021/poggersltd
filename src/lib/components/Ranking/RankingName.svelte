<script lang="ts">
  import { RANKING_BADGES, tooltip } from "$lib/util";
  import { goto } from "$app/navigation";
  export let plr: App.RankingEntry;
  export let category: string; // score category url param

  const goToProfile = (plr: App.RankingEntry) => goto(`/osu/player/${plr.name}/${category}`);
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
    {#if RANKING_BADGES[plr._id]}
      <img
        class="osu-badge"
        alt="pog"
        src={RANKING_BADGES[plr._id].img}
        use:tooltip={{ content: RANKING_BADGES[plr._id].title ?? "" }} />
    {/if}
  </div>
</td>
