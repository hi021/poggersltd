<script lang="ts">
  import { slide } from "svelte/transition";
  import Switch from "../Switch.svelte";

  export let settings: App.RankingSettings;
  export let style = "";
  let visible = false;
</script>

<div class="wrapper" {style}>
  <button class="btn-icon" type="button" on:click={() => (visible = !visible)}>
    <icon class="settings" style="transform: rotate({visible ? 45 : 0}deg);" />
  </button>

  {#if visible}
    <div class="column background" transition:slide={{ duration: 200, axis: "y" }}>
      <Switch bind:checked={settings.avatars}>
        <span slot="before">Avatars</span>
      </Switch>
      <Switch bind:checked={settings.scoreDifferences}>
        <span slot="before">Score differences</span>
      </Switch>
      <label>
        Players per page
        <select bind:value={settings.perPage}>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={Infinity}>All</option>
        </select>
      </label>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 8px;
    gap: 6px;
  }
  .background {
    background-color: rgba(0, 0, 0, 0.2);
    min-width: 15svw;
    padding: 12px;
    border-radius: 8px;
    gap: 8px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  select {
    width: max-content;
  }

  .btn-icon {
    font-size: 1.75em;
    color: var(--color-lighter);
  }
  .btn-icon:focus {
    box-shadow: none;
  }
  icon.settings {
    transition: transform 0.4s;
  }
</style>
