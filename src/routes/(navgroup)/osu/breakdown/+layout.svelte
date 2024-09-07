<script lang="ts">
  import { goto } from "$app/navigation";
  import Switch from "$lib/components/Switch.svelte";
  import UserSearch from "$lib/components/UserSearch.svelte";
  import { tooltip } from "$lib/util";
  import { fly } from "svelte/transition";

  let singleRank = false;
  let rank: number;
  let mode: string = "0";
  let username: string;

  const gotoPlayer = (idOrName: string | number) => {
    if (!singleRank) gotoPlayerForce(idOrName);
  };
  const gotoPlayerForce = (idOrName: string | number) =>
    idOrName && goto(`/osu/breakdown/${idOrName}/${singleRank ? rank || 1 : "1-50"}/${mode}`);
</script>

<svelte:head>
  <title>breakdown - poggers</title>
</svelte:head>

<main class="flex-fill column" style="padding: 0 3.5%">
  <form class="row" spellcheck="false" on:submit|preventDefault={() => gotoPlayerForce(username)}>
    <UserSearch {gotoPlayer} {gotoPlayerForce} bind:value={username} />
    <select bind:value={mode} use:tooltip={{ content: "Game mode" }} class="input-dark">
      <option value="0">osu!</option>
      <option value="1">taiko</option>
      <option value="2">catch</option>
      <option value="3">mania</option>
    </select>
    {#if singleRank}
      <input
        transition:fly={{ duration: 200, x: -50 }}
        class="input-dark"
        type="number"
        placeholder="Rank (1-100)"
        use:tooltip={{ content: "Score rank" }}
        min="1"
        max="100"
        bind:value={rank} />
    {/if}
  </form>
  <div class="row" style="align-items: center; margin-top: 16px; width: fit-content;">
    <Switch bind:checked={singleRank} style="flex-direction: row; gap: 8px; align-items: center;">
      <span slot="after">Single rank</span>
    </Switch>
  </div>

  <slot />
</main>

<style>
  .input-dark {
    margin-left: 22px;
    margin-top: 22px;
    width: 20%;
  }
</style>
