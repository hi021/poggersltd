<script lang="ts">
  import { onMount, tick } from "svelte";
  import { getAvatarURL } from "$lib/util";
  import { slide } from "svelte/transition";

  let searchInputElement: HTMLInputElement;
  let autocompleteEntries: Array<{ _id: number; name: string }> = [];
  export let value = "";
  export let gotoPlayer: (idOrName: string) => void;
  export let gotoPlayerForce: (idOrName: string) => void;

  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (
      !target?.className?.includes("autocmp-item") &&
      !target?.className?.includes("search-input")
    )
      autocompleteEntries = [];
  }

  async function getAutocomplete(query = value) {
    if (!query || query.length < 3) {
      autocompleteEntries = [];
      return;
    }

    try {
      const res = await fetch(`/api/player/${query}/search`);
      const resJson = await res.json();

      if (resJson?.length) autocompleteEntries = resJson;
      else autocompleteEntries = [];
    } catch (e) {
      console.error("Failed to fetch players autocomplete:", e);
      autocompleteEntries = [];
    }
  }

  onMount(() => {
    addEventListener("click", handleClick);
    tick().then(() => searchInputElement.focus());

    return () => {
      removeEventListener("click", handleClick);
    };
  });
</script>

<div class="search-input-wrapper input-dark row">
  <div class="autocmp-wrapper">
    <input
      class="search-input input-dark"
      style="--shadow-color: {autocompleteEntries.length
        ? 'transparent'
        : value.length % 2
          ? 'var(--color-claret)'
          : 'var(--color-darkest)'}"
      type="text"
      placeholder="osu! username"
      autocomplete="new-password"
      spellcheck="false"
      bind:this={searchInputElement}
      bind:value
      on:focus={() => getAutocomplete(value)}
      on:input={() => getAutocomplete(value)}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          gotoPlayerForce(value);
          autocompleteEntries = [];
        }
      }} />

    <ul class="autocmp-items">
      {#each autocompleteEntries as a (a._id)}
        <li transition:slide={{ duration: 100, axis: "y" }}>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a
            href=""
            class="autocmp-item"
            tabindex="0"
            role="button"
            on:click|preventDefault={() => {
              value = a.name;
              gotoPlayer(a.name);
              autocompleteEntries = [];
            }}>
            <img
              class="osu-avatar-small"
              alt=""
              src={getAvatarURL(a._id)}
              style="margin-right: 1rem;" />
            {a.name}
          </a>
        </li>
      {/each}
    </ul>
  </div>
  <button type="submit" class="btn-search btn-none">
    <icon class="search big" />
  </button>
</div>

<style>
  /* SEARCH WRAPPER */
  .search-input-wrapper {
    --radius: 9999px;
    position: relative;
    width: 100%;
    margin-top: 22px;
    align-items: center;
    padding: 0;
    border-radius: var(--radius);
  }
  .btn-search {
    position: absolute;
    width: 3em;
    height: 100%;
    right: -1px;
    color: var(--color-lighter);
    padding: 10px;
    border-radius: 0;
    border-top-right-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
  }
  .btn-search:hover,
  .btn-search:focus {
    background-color: var(--color-darker);
  }
  .search-input {
    padding-left: 1em;
    padding-right: 2.875em;
    background-color: transparent;
    width: 100%;
  }
  .search-input:focus,
  .search-input:focus-visible {
    box-shadow: 2px 2px 4px var(--shadow-color);
    outline: none;
    outline-color: transparent;
  }
  /* SEARCH WRAPPER */

  /* AUTOCOMPLETE */
  .autocmp-wrapper {
    width: 100%;
    position: relative;
    display: inline-flex;
  }
  .autocmp-items {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0 24px;
    z-index: 2;
    list-style: none;
  }
  .autocmp-items > li:last-child > .autocmp-item {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .autocmp-item {
    display: flex;
    top: 100%;
    left: 0;
    right: 0;
    cursor: pointer;
    color: inherit;
    background-color: var(--color-darkish);
    text-decoration: none;
    align-items: center;
    line-height: 1;
    padding: 0.5rem;
  }
  .autocmp-item:hover,
  .autocmp-item:focus,
  .autocmp-item:focus-visible {
    outline: none;
    background-color: var(--color-purple);
  }

  /* .autocmp-cntry {
		padding: 10px;
		display: flex;
		align-items: center;
		text-align: left;
	}
	.autocmp-cntry:hover,
	.autocmp-cntry:focus {
		background-color: #35a4ff;
		outline: none;
	}

	.autocmp-inside {
		padding: 10px;
		background-color: rgba(255, 255, 255, 0.8);
		display: flex;
	}
	.autocmp-inside:hover,
	.autocmp-inside:focus {
		background-color: rgba(255, 255, 255, 0.4);
		outline: none;
	} */
  /* AUTOCOMPLETE */
</style>
