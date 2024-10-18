<script>
  import { goto } from "$app/navigation";
  const yoink = () => goto("/osu/ranking/players/last/top50");
</script>

<svelte:head>
  <title>ranking - poggers</title>
</svelte:head>

<main class="osu-main flex-fill">
  <p class="solo-text">
    Press <button type="button" class="btn-none" on:click={yoink}>yoink</button> to show the latest top
    50s ranking!
  </p>
</main>

<style>
  button {
    border-radius: 0;
    font-size: inherit;
    color: var(--color-active);
  }
  button:is(:hover, :focus) {
    box-shadow: none;
    text-decoration: underline;
  }
</style>
