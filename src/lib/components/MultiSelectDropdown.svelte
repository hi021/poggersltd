<script lang="ts">
  import { outClick } from "$lib/util";
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";

  interface Props {
    options: { [value: string]: string };
    selected: string[];
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

  function onFocus() {
    dropdownVisible = true;
  }

  function onOutClick() {
    dropdownVisible = false;
    onBlur?.();
  }

  function clearAll() {
    selected = [];
  }

  function onOptionChecked(e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    if (target.checked) selected.push(value);
    else selected = selected.filter((it) => it != value);
  }

  function filterOptions(e: KeyboardEvent) {
    if (e.key == "Escape") return onOutClick();

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
      class="input-dark"
      {placeholder}
      bind:value={query}
      onfocus={onFocus}
      onkeyup={filterOptions}
      use:outClick={[dropdownOptionsElement]}
      onoutclick={onOutClick}
      onblur={onBlur} />
  {/if}
  <ul
    class="dropdown-options ul scrollbar-small scrollbar-dark"
    style="display: {dropdownVisible ? 'block' : 'none'};"
    transition:slide={{ duration: 100, axis: "y" }}
    bind:this={dropdownOptionsElement}>
    {#each Object.entries(options) as [value, label]}
      <li class:selected={selected.includes(value)}>
        {@render optionComponent({ value, label, onchange: onOptionChecked })}
      </li>
    {/each}
  </ul>
</div>

<style>
  .dropdown {
    position: relative;
  }

  input[type="text"] {
    width: 100%;
    box-sizing: border-box;
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
