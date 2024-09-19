<script lang="ts">
  export let onChange:
    | undefined
    | ((e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void) = undefined;
  export let checked: boolean;
  export let disabled = false;
  export let size = "26px";
  export let style = "gap: 2px;";
</script>

<label class="column" {style}>
  <slot name="before" />
  <div class="switch">
    <input type="checkbox" {disabled} on:change={onChange} bind:checked />
    <span class="slider" style="--size: {size};" />
  </div>
  <slot name="after" />
</label>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }
  .switch input {
    appearance: none;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-dark);
    transition: 0.25s;
    border-radius: 9999px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: var(--size);
    width: var(--size);
    left: 4px;
    bottom: 4px;
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
