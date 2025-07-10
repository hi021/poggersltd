<script lang="ts">
  import { outClick } from "$lib/util";
  import type { Snippet } from "svelte";

  interface Props {
    options: { [value: string]: string };
    selected: string[];
    optionComponent: Snippet<[{ value: string; label: string }]>;
    query?: string | undefined;
  }

  let {
    options = {},
    selected = $bindable([]),
    optionComponent,
    query = $bindable()
  }: Props = $props();
  let dropdownOptionsElement = $state() as HTMLUListElement;
  let dropdownVisible = $state(false);

  function onFocus() {
    dropdownVisible = true;
    console.log(options);
  }

  function onBlur() {
    dropdownVisible = false;
  }

  function filterOptions() {
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
      placeholder="Countries"
      bind:value={query}
      onfocus={onFocus}
      onkeyup={filterOptions}
      use:outClick={[dropdownOptionsElement]}
      onoutclick={onBlur} />
  {/if}
  <ul
    class="dropdown-options ul scrollbar-small scrollbar-dark"
    style="display: {dropdownVisible ? 'block' : 'none'};"
    bind:this={dropdownOptionsElement}>
    {#each Object.entries(options) as [value, label]}
      <li class:selected={selected.includes(value)}>
        {@render optionComponent({ value, label })}
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
    padding: 8px;
    box-sizing: border-box;
  }

  .dropdown-options {
    position: absolute;
    max-height: clamp(150px, 25vh, 40vh);
    overflow-y: auto;
    border: 1px solid #ccc;
    background: #fff;
    width: 100%;
    z-index: 1;
  }

  :global(.dropdown-options li label) {
    display: flex;
    gap: 4px;
    padding: 4px;
    background-color: var(--color-darkish);
    cursor: pointer;
  }
  .dropdown-options li.selected {
    background-color: var(--color-active);
  }
  :global(.dropdown-options li label:hover) {
    background-color: var(--color-purple);
  }
</style>
