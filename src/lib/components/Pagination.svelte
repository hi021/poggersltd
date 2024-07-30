<script lang="ts">
  export let page: number;
  export let maxPage: number;
  export let onPageChange: (newPage: number) => void;
  export let showPageNumber = true;
  export let style = "";
</script>

<div class="column flex-center" style:gap="2px" {style}>
  <div class="row group page-container">
    <button type="button" disabled={page <= 1} on:click={() => onPageChange(1)}>
      <icon class="double-arrow flip-h" />
    </button>
    <button type="button" disabled={page <= 1} on:click={() => onPageChange(page - 1)}>
      <icon class="single-arrow flip-h" />
    </button>

    <button type="button" disabled={page >= maxPage} on:click={() => onPageChange(page + 1)}>
      <icon class="single-arrow" />
    </button>
    <button type="button" disabled={page >= maxPage} on:click={() => onPageChange(maxPage)}>
      <icon class="double-arrow" />
    </button>
  </div>
  {#if showPageNumber}
    <div style="font-weight: 300;">
      Page <strong>{page}</strong>/{maxPage}
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
    background-color: rgba(0, 0, 0, 0.5);
    padding: 6px 12px;
    user-select: none;
    cursor: pointer;
  }
  button:not([disabled]):hover {
    background-color: rgba(0, 0, 0, 0.9);
  }
</style>
