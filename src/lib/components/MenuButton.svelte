<script lang="ts">
  import { tooltip } from "$lib/util";

  export let href: string;
  export let label: string;
  export let backgroundColor: string;
  export let backgroundImage = "";
  export let tooltipContent = "";
  export let style = "";
</script>

<div
  aria-label={label}
  role="button"
  class="btn-menu-main"
  use:tooltip={{ content: tooltipContent, options: { theme: "large", placement: "bottom" } }}>
  <a {href} aria-hidden="true">
    <div
      class="btn-menu"
      style="background-color: {backgroundColor}; background-image: {backgroundImage}; {style}">
      <slot />
    </div>
    <div class="btn-menu-label" aria-hidden="true">{label}</div>
  </a>
</div>

<style>
  .btn-menu-main {
    position: relative;
    box-shadow: -2px 3px 8px 1px color-mix(in srgb, var(--color-light) 50%, transparent);
    border-radius: 20px;
    background-color: var(--color-lighter);
    min-width: 300px;
    max-width: 600px;
    height: fit-content;
    overflow: hidden;
    flex: 1;
    transition: transform 0.25s ease;
  }
  .btn-menu-main a {
    text-decoration: none;
    color: var(--color-darkest);
    font-weight: 700;
    font-size: 1.25rem;
    transition: color 0.25s;
  }
  .btn-menu {
    padding: 120px 120px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position-x: center;
  }
  .btn-menu-label {
    padding: 0.875rem;
    text-align: right;
  }

  .btn-menu-main:hover {
    transform: translateY(-9px);
  }
  .btn-menu-main:hover a {
    color: var(--color-dark);
  }
</style>
