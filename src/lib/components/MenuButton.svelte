<script lang="ts">
  import { tooltip } from "$lib/util";
  import type { Snippet } from "svelte";

  interface Props {
    href: string;
    label: string;
    backgroundColor: string;
    backgroundImage?: string;
    tooltipContent?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    href,
    label,
    backgroundColor,
    backgroundImage = "",
    tooltipContent = "",
    style = "",
    children
  }: Props = $props();
</script>

<a
  {href}
  aria-label={label}
  class="btn-menu-main"
  use:tooltip={{ content: tooltipContent, options: { theme: "large", placement: "bottom" } }}>
  <div
    class="btn-menu"
    style="background-color: {backgroundColor}; background-image: {backgroundImage}; {style}">
    {@render children?.()}
  </div>
  <div class="btn-menu-label" aria-hidden="true">{label}</div>
</a>

<style>
  .btn-menu-main {
    position: relative;
    height: fit-content;
    flex: 1;
    min-width: 300px;
    max-width: 600px;
    text-decoration: none;
    border-radius: 20px;
    background-color: var(--color-lighter);
    box-shadow: -2px 3px 8px 1px color-mix(in srgb, var(--color-light) 50%, transparent);
    transition: transform 0.25s ease;
    overflow: hidden;
  }
  .btn-menu-main .btn-menu-label {
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

  .btn-menu-main:is(:hover, :focus) {
    transform: translateY(-9px);
    outline: transparent 3px solid;
  }
  .btn-menu-main:is(:hover, :focus) .btn-menu-label {
    color: var(--color-dark);
  }
</style>
