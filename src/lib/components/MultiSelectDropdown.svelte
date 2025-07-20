<script lang="ts">
  import { outClick } from "$lib/util";
  import { slide } from "svelte/transition";
  import type { Snippet } from "svelte";

  interface Props {
    options: { [value: string]: string };
    selected: Set<string>;
    optionComponent: Snippet<[{ value: string; label: string; onchange: (e: Event) => void }]>;
    onBlur?: (e?: FocusEvent) => void;
    placeholder?: string;
    query?: string;
  }

  let {
    options = {},
    selected = $bindable(),
    optionComponent,
    onBlur,
    placeholder,
    query = $bindable()
  }: Props = $props();
  let dropdownOptionsElement = $state() as HTMLUListElement;
  let dropdownVisible = $state(false);
  let hasChanged = false;

  function onFocus() {
    dropdownVisible = true;
  }

  function onOutClick() {
    dropdownVisible = false;
    if (hasChanged) onBlur?.();
    hasChanged = false;
  }

  function clearAll() {
    selected.clear();
  }

  function onOptionChecked(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    selected = target.checked ? selected.add(value) : selected.difference(new Set([value]));
    hasChanged = true;
  }

  function filterOptions(e: KeyboardEvent) {
    if (e.key === "Escape" || e.key == "Enter") return onOutClick();

    const optionsQuery = (query ?? "").toUpperCase();
    const labels = dropdownOptionsElement!.getElementsByTagName("label");
    let anyVisible = false;

    for (const label of labels) {
      const checkboxElement = label.firstChild as HTMLInputElement;
      const countryCode = checkboxElement.value;
      const countryName = label.textContent || label.innerText;

      const isMatched =
        optionsQuery == countryCode || countryName.toUpperCase().includes(optionsQuery);
      label.style.display = isMatched ? "" : "none";
      if (isMatched) anyVisible = true;
    }

    dropdownVisible = anyVisible;
  }
</script>

<div class="dropdown">
  {#if dropdownOptionsElement}
    <input
      type="text"
      class="input-dark normal-size"
      {placeholder}
      bind:value={query}
      onfocus={onFocus}
      onkeyup={filterOptions}
      use:outClick={[dropdownOptionsElement]}
      onoutclick={onOutClick}
      onblur={onBlur} />
  {/if}
  {#key dropdownVisible}
    <ul
      class="dropdown-options ul scrollbar-small scrollbar-dark"
      style="display: {dropdownVisible ? 'block' : 'none'};"
      transition:slide={{ duration: 100, axis: "y" }}
      bind:this={dropdownOptionsElement}>
      {#each Object.entries(options) as [value, label] (value)}
        <li class:selected={selected.has(value)}>
          {@render optionComponent({ value, label, onchange: onOptionChecked })}
        </li>
      {/each}
    </ul>
  {/key}
</div>

<style>
  .dropdown {
    position: relative;
    min-width: 300px;
  }

  input[type="text"] {
    width: 100%;
    box-sizing: border-box;
  }

  input[type="text"]:focus {
    outline-color: transparent;
    box-shadow: 2px 2px 4px var(--shadow-color);
  }

  .dropdown-options {
    position: absolute;
    max-height: clamp(150px, 25vh, 40vh);
    overflow-y: auto;
    width: calc(100% - 44px);
    margin: 0 22px;
    margin-top: 1px;
    border-radius: 0 8px;
    z-index: 1;
  }

  :global(.dropdown-options li label) {
    display: flex;
    gap: 4px;
    padding: 4px;
    background-color: var(--color-darkish);
    cursor: pointer;
  }
  :global(.dropdown-options li.selected > label) {
    background-color: var(--color-active);
  }
  :global(.dropdown-options li label:hover) {
    background-color: var(--color-purple);
  }
  :global(.dropdown-options label > input:focus) {
    box-shadow: none;
  }

  .scrollbar-small::-webkit-scrollbar-track,
  .scrollbar-small::-webkit-scrollbar-thumb {
    border-radius: 0;
  }
</style>
