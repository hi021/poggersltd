<script lang="ts">
  import "../style.css";
  import "../icons.css";
  interface Props {
    children?: import("svelte").Snippet;
  }

  let { children }: Props = $props();
</script>

{@render children?.()}
