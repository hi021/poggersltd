<script lang="ts">
  import { tooltip } from "$lib/util";

  export let page: number;
  export let maxPage: number;
  export let entries: number | undefined = undefined;
  export let onPageChange: (newPage: number) => void;
  export let showPageNumber = true;
  export let style = "";
</script>

<div class="column flex-center" style:gap="2px" {style}>
  <div class="row group page-container">
    <button
      type="button"
      disabled={page <= 1}
      on:click={() => onPageChange(1)}
      use:tooltip={{ content: "First page" }}>
      <icon class="double-arrow flip-h" />
    </button>
    <button type="button" disabled={page <= 1} on:click={() => onPageChange(page - 1)}>
      <icon class="single-arrow flip-h" />
    </button>

    <button type="button" disabled={page >= maxPage} on:click={() => onPageChange(page + 1)}>
      <icon class="single-arrow" />
    </button>
    <button
      type="button"
      disabled={page >= maxPage}
      on:click={() => onPageChange(maxPage)}
      use:tooltip={{ content: "Last page" }}>
      <icon class="double-arrow" />
    </button>
  </div>
  {#if showPageNumber || entries}
    <div style="font-weight: 300;">
      {#if showPageNumber}
        Page <span style="font-weight: 400;">{page}</span>/{maxPage}
        {#if entries}
          ●
        {/if}
      {/if}
      {#if entries}
        {entries} {entries == 1 ? "entry" : "entries"}
      {/if}
    </div>
  {/if}
</div>

<style>
  .page-container {
    gap: 2px;
    padding: 0;
    margin: 0;
  }
  button {
    color: inherit;
    background-color: rgba(0, 0, 0, 0.55);
    padding: 6px 12px;
    user-select: none;
    cursor: pointer;
  }
  button:not([disabled]):hover {
    background-color: rgba(0, 0, 0, 0.96);
  }
</style>
