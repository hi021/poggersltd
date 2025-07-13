<script lang="ts">
  import "../style.css";
  import "../icons.css";
  import type { Snippet } from "svelte";
  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

{@render children?.()}
