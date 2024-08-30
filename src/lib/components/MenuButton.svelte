<script lang="ts">
  import { tooltip } from "$lib/util";

  export let href: string;
  export let label: string;
  export let backgroundColor: string;
  export let backgroundImage: string;
  export let tooltipContent = "";
</script>

<div class="btn-menu-main" use:tooltip={{ content: tooltipContent, options: { theme: "large" } }}>
  <a {href}>
    <div
      class="btn-menu"
      style="background-color: {backgroundColor}; background-image: {backgroundImage};" />
    <div class="btn-menu-label">{label}</div>
  </a>
</div>

<style>
  .btn-menu-main {
    box-shadow: -2px 3px 8px 1px color-mix(in srgb, var(--color-light) 50%, transparent);
    border-radius: 20px;
    background-color: var(--color-lighter);
    background-position: center;
    min-width: 240px;
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
    color: #777;
  }
</style>
