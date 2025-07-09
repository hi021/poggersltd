<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    size?: string;
    thickness?: string;
    margin?: string;
    sticky?: boolean;
  }

  let { size = "4.2rem", thickness = "0.78rem", margin = "1rem", sticky = false }: Props = $props();
  let element: HTMLDivElement | undefined = $state();

  onMount(() => {
    element!.style.setProperty("--loader-size", size);
    element!.style.setProperty("--loader-thickness", thickness);
  });
</script>

<div
  class="loader"
  class:loader-sticky={sticky}
  bind:this={element}
  style={"margin-top: " + margin}>
</div>

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
