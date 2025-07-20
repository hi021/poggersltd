<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    onChange?: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
    checked: boolean;
    disabled?: boolean;
    size?: string;
    style?: string;
    labelOrientation?: "row" | "column";
    before?: Snippet;
    after?: Snippet;
  }

  let {
    onChange,
    checked = $bindable(),
    disabled = false,
    size = "1.625rem",
    style = "gap: 2px;",
    labelOrientation = "column",
    before,
    after
  }: Props = $props();
</script>

<label class={labelOrientation} {style} class:disabled>
  {@render before?.()}
  <div class="switch">
    <input type="checkbox" class="no-appearance" {disabled} onchange={onChange} bind:checked />
    <span class="slider" style="--size: {size};"></span>
  </div>
  {@render after?.()}
</label>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 3.875rem;
    height: 2rem;
    cursor: pointer;
  }
  label.disabled {
    opacity: 0.5;
  }
  label.disabled > .switch {
    cursor: default;
  }

  .switch .slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-dark);
    transition: 0.25s;
    border-radius: 9999px;
  }
  .switch .slider:before {
    position: absolute;
    content: "";
    height: var(--size);
    width: var(--size);
    left: 0.25rem;
    bottom: 0.1875rem;
    background-color: var(--color-darker);
    transition: 0.25s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: var(--color-purple);
  }
  input:is(:focus, :focus-visible) {
    box-shadow: none;
  }
  input:is(:focus, :focus-visible) + .slider {
    box-shadow: 0 0 3px var(--color-purple);
  }
  input:checked + .slider:before {
    transform: translateX(var(--size));
  }
</style>
