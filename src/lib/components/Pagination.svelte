<script lang="ts">
	export let page: number;
	export let maxPage: number;
	export let onPageChange: (newPage: number) => void;
</script>

<div class="row group page-container">
	<button type="button" disabled={page <= 1} on:click={() => onPageChange(1)}>&lt;&lt;</button>
	<button type="button" disabled={page <= 1} on:click={() => onPageChange(page - 1)}>&lt;</button>
	<button type="button" disabled={page >= maxPage} on:click={() => onPageChange(page + 1)}
		>&gt;</button
	>
	<button type="button" disabled={page >= maxPage} on:click={() => onPageChange(maxPage)}
		>&gt;&gt;</button
	>
</div>

<style>
	.page-container {
		gap: 2px;
		padding: 0;
		margin: 0;
	}
	button {
		color: inherit;
		background-color: rgba(0, 0, 0, 0.15);
		padding: 6px 12px;
		user-select: none;
		cursor: pointer;
	}
	button:not([disabled]):hover {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
