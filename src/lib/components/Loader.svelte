<script lang="ts">
  import { onMount } from "svelte";

  export let size = "4.2rem";
  export let thickness = "0.78rem";
  export let margin = "1rem";
  export let sticky = false;
  let element: HTMLDivElement;

  onMount(() => {
    element.style.setProperty("--loader-size", size);
    element.style.setProperty("--loader-thickness", thickness);
  });
</script>

<div
  class="loader"
  class:loader-sticky={sticky}
  bind:this={element}
  style={"margin-top: " + margin} />

<style>
  .loader {
    --loader-size: 4.2rem;
    --loader-thickness: 0.78rem;
    display: flex;
    justify-content: center;
    overflow: hidden;
    z-index: 3;
  }
  .loader-sticky {
    position: -webkit-sticky;
    position: sticky;
    top: 50%;
    margin-top: calc(var(--loader-size) * (-1) + var(--loader-thickness) * (-2));
  }
  .loader::after {
    content: "";
    width: var(--loader-size);
    height: var(--loader-size);
    border: var(--loader-thickness) solid rgba(0, 0, 0, 0.1);
    border-top-color: #fff;
    border-radius: 50%;
    animation: loader 0.82s linear infinite;
  }
  @keyframes loader {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
