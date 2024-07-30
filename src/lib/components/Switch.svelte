<script lang="ts">
  export let onChange:
    | undefined
    | ((e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void) = undefined;
  export let checked: boolean;
</script>

<label class="column" style="gap: 2px;">
  <slot />
  <div class="switch">
    <input type="checkbox" on:change={onChange} bind:checked />
    <span class="slider" />
  </div>
</label>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    --size: 26px;
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
    background-color: var(--color-active-dark);
  }
  input:focus + .slider {
    box-shadow: 0 0 1px var(--color-active-dark);
  }
  input:checked + .slider:before {
    transform: translateX(var(--size));
  }
</style>
