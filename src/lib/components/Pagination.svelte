<script lang="ts">
  import { tooltip } from "$lib/util";

  interface Props {
    page: number;
    maxPage: number;
    entries?: number | undefined;
    onPageChange: (newPage: number) => void;
    showPageNumber?: boolean;
    style?: string;
  }

  let {
    page,
    maxPage,
    entries = undefined,
    onPageChange,
    showPageNumber = true,
    style = ""
  }: Props = $props();
</script>

<div class="column flex-center" style:gap="2px" {style}>
  <div class="row group page-container">
    <button
      type="button"
      title="First page"
      disabled={page <= 1}
      onclick={() => onPageChange(1)}
      use:tooltip={{ content: "First page" }}>
      <icon class="double-arrow flip-h"></icon>
    </button>
    <button
      type="button"
      title="Previous page"
      disabled={page <= 1}
      onclick={() => onPageChange(page - 1)}>
      <icon class="single-arrow flip-h"></icon>
    </button>

    <button
      type="button"
      title="Next page"
      disabled={page >= maxPage}
      onclick={() => onPageChange(page + 1)}>
      <icon class="single-arrow"></icon>
    </button>
    <button
      type="button"
      title="Last page"
      disabled={page >= maxPage}
      onclick={() => onPageChange(maxPage)}
      use:tooltip={{ content: "Last page" }}>
      <icon class="double-arrow"></icon>
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
