<script lang="ts">
  import { outClick } from "$lib/util";
  import type { Snippet } from "svelte";

  export let options: { [value: string]: string } = {};
  export let optionComponent: Snippet<[{value: string, label: string}]>;
  export let value: string | null = null;
  let dropdownOptionsElement: HTMLDivElement;
  let dropdownVisible = false;

  function onFocus() {
    dropdownVisible = true;
    console.log(options);
  }

  function onBlur() {
    dropdownVisible = false;
  }

  function filterOptions() {
    const query = (value ?? "").toUpperCase();
    const labels = dropdownOptionsElement.getElementsByTagName("label");
    let anyVisible = false;

    for (const label of labels) {
      const checkboxElement = label.firstChild as HTMLInputElement;
      const countryCode = checkboxElement.value;
      const countryName = label.textContent || label.innerText;

      const isMatched = query == countryCode || countryName.toUpperCase().includes(query);
      label.style.display = isMatched ? "" : "none";
      if (isMatched) anyVisible = true;
    }

    dropdownVisible = anyVisible;
  }
</script>

<div class="dropdown">
  <input
    type="text"
    class="input-dark"
    placeholder="Countries"
    bind:value
    on:focus={onFocus}
    on:keyup={filterOptions}
    use:outClick={[dropdownOptionsElement]}
    on:outclick={onBlur} />
  <div
    class="dropdown-options"
    style="display: {dropdownVisible ? 'block' : 'none'};"
    bind:this={dropdownOptionsElement}>
    {#each Object.entries(options) as [value, label]}
      {@render optionComponent({value, label})}
    {/each}
  </div>
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
    max-height: minmax(150px, 25vh);
    overflow-y: auto;
    border: 1px solid #ccc;
    background: #fff;
    width: 100%;
    z-index: 1;
  }

  .dropdown-options label {
    display: block;
    padding: 5px;
    cursor: pointer;
  }

  .dropdown-options label:hover {
    background-color: #f0f0f0;
  }
</style>
