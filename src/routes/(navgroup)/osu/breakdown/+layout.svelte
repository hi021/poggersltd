<script lang="ts">
  import Switch from "$lib/components/Switch.svelte";
  import UserSearch from "$lib/components/UserSearch.svelte";
  import { tooltip } from "$lib/util";
  import { fly } from "svelte/transition";

  let singleRank = false;
  let rank: number;
  let mode: string = "0";
  let username: string;

  const gotoPlayer = ({ _id, name }: { _id?: number; name: string }) => {
    if (!singleRank) gotoPlayerOnEnter({ _id, name });
  };
  const gotoPlayerOnEnter = ({ _id, name }: { _id?: number; name: string }) => false;
  // TODO: re-implement for osustats api maybe
  // _id || name && goto(`/osu/breakdown/${_id || name}/${singleRank ? rank || 1 : "1-50"}/${mode}`);
</script>

<svelte:head>
  <title>breakdown - poggers</title>
</svelte:head>

<main class="flex-fill column" style="padding: 0 3.5%">
  <form
    class="row"
    spellcheck="false"
    on:submit|preventDefault={() => gotoPlayerOnEnter({ name: username })}>
    <UserSearch disabled={true} {gotoPlayer} {gotoPlayerOnEnter} bind:value={username} />

    <select
      class="input-dark"
      bind:value={mode}
      use:tooltip={{ content: "Game mode" }}
      disabled={true}>
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
    <Switch
      disabled={true}
      bind:checked={singleRank}
      style="flex-direction: row; gap: 8px; align-items: center;">
      <span slot="after">Single rank</span>
    </Switch>
  </div>

  <p class="solo-text">
    respektive's api was taken down :(<br />
    <small>go yell at peppy (violence)</small>
  </p>

  <slot />
</main>

<style>
  main > form {
    margin-top: 20px;
    gap: 20px;
  }

  @media (width <= 40rem) {
    main > form {
      flex-wrap: wrap;
    }
  }
</style>
