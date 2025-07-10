<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    onChange?: undefined | ((e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void);
    checked: boolean;
    disabled?: boolean;
    size?: string;
    style?: string;
    before?: Snippet;
    after?: Snippet;
  }

  let {
    onChange = undefined,
    checked = $bindable(),
    disabled = false,
    size = "1.625rem",
    style = "gap: 2px;",
    before,
    after
  }: Props = $props();
</script>

<label class="column" {style}>
  {@render before?.()}
  <div class="switch" class:disabled>
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
  .switch.disabled {
    opacity: 0.5;
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
  input:focus + .slider {
    box-shadow: 0 0 1px var(--color-purple);
  }
  input:checked + .slider:before {
    transform: translateX(var(--size));
  }
</style>
