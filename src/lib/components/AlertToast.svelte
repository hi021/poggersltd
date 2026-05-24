<script lang="ts">
	import { fly } from "svelte/transition";

	interface Props {
		alert?: App.AlertData;
		onClose?: () => void;
	}

	let { alert, onClose }: Props = $props();
	let dialogElement = $state() as HTMLDialogElement;
</script>

{#if alert}
	<dialog
		onclick={() => dialogElement.close()}
		onclose={onClose}
		transition:fly={{ y: -100, duration: 150 }}
		class="flex-center alert-toast {alert.type}"
		open
		bind:this={dialogElement}>
		{#if alert.showIcon == null || alert.showIcon}
			<icon class="big {alert.type}"></icon>
		{/if}
		<span>{alert.message}</span>
	</dialog>
{/if}

<style>
	.alert-toast {
		position: fixed;
		padding: 24px 32px;
		border-radius: 12px;
		top: 25px;
		left: 50%;
		transform: translateX(-50%);
		gap: 6px;
		background-color: color-mix(in oklch, var(--color) 90%, transparent);
		border: 3px solid color-mix(in oklch, var(--color) 80%, var(--color-light));
		cursor: pointer;
		box-shadow: 1px 2px 5px 3px rgba(0, 0, 0, 0.3);
		z-index: 900;
	}

	.alert-toast.error {
		--color: var(--color-red);
	}
	.alert-toast.warning {
		--color: var(--color-yellow);
	}
	.alert-toast.success {
		--color: var(--color-green);
	}
	.alert-toast.info {
		--color: var(--color-blue);
	}
</style>
