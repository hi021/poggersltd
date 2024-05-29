<script lang="ts">
    import { slide } from "svelte/transition";
    import Switch from "./Switch.svelte";

    export let settings: App.RankingSettings;
    export let style = "";
    let visible = false;
</script>

<div class="wrapper" {style}>
    <button class="btn-icon" type="button" on:click={() => visible = !visible}>
        <icon class="settings" style="transform: rotate({visible ? 45 : 0}deg);" />
    </button>

    {#if visible}
    <div class="column background" transition:slide={{duration: 200, axis: "y"}}>
        <Switch bind:checked={settings.avatars}>
            <span>Avatars</span>
        </Switch>
        <Switch bind:checked={settings.scoreDifferences}>
            <span>Score differences</span>
        </Switch>
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
        background-color: var(--color-darkest);
        padding: 12px;
        border-radius: 8px;
        gap: 8px;
    }

    .btn-icon {
        font-size: 1.5em;
        color: var(--color-lighter);
    }
    icon.settings {
        transition: transform 0.2s;
    }
</style>