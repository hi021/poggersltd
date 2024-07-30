<script lang="ts">
  import { onMount, tick } from "svelte";
  import { getAvatarURL } from "$lib/util";

  let searchInputElement: HTMLInputElement;
  let autocompleteEntries: Array<{ _id: number; name: string }> = [];
  export let value = "";
  export let gotoPlayer: (idOrName: string) => void;
  export let gotoPlayerForce: (idOrName: string) => void;

  function handleClick(e: MouseEvent) {
    if (!(e.target as Element).className?.includes("autocmp-item")) autocompleteEntries = [];
  }

  async function getAutocomplete(query: string) {
    if (!query || query.length < 3) {
      autocompleteEntries = [];
      return;
    }

    try {
      const res = await fetch("/api/player/" + query + "/search");
      const resJson = await res.json();

      if (resJson?.length) autocompleteEntries = resJson;
      else autocompleteEntries = [];
    } catch (e) {
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
      type="text"
      placeholder="osu! username"
      autocomplete="new-password"
      spellcheck="false"
      bind:this={searchInputElement}
      bind:value
      on:input={() => getAutocomplete(value)}
      on:keypress={(e) => {
        if (e.key === "Enter") {
          gotoPlayerForce(value);
          autocompleteEntries = [];
        }
      }} />
    <ul class="autocmp-items">
      {#each autocompleteEntries as a}
        <li>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a
            href=""
            class="autocmp-item"
            tabindex="0"
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
  <button type="submit" class="btn-none icon icon-search" />
</div>

<style>
  /* SEARCH WRAPPER */
  .search-input-wrapper {
    position: relative;
    width: 100%;
    margin-top: 22px;
    align-items: center;
    padding: 0;
    /* overflow: hidden; would also hide input's focus shadow and autocomplete */
  }
  .icon-search {
    position: absolute;
    width: 1.75rem;
    right: 6px;
    filter: invert(100%);
  }
  .icon-search:hover,
  .icon-search:focus {
    filter: invert(0);
  }
  .search-input {
    padding-right: calc(2rem + 8px);
    background-color: transparent;
    width: 100%;
  }
  .search-input:focus {
    box-shadow: 0 0 2px 0.2rem rgba(255, 255, 255, 0.35);
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
    padding: 0 10px;
    z-index: 2;
    list-style: none;
  }

  .autocmp-item {
    /* .autocmp-item-image */
    top: 100%;
    left: 0;
    right: 0;
    cursor: pointer;
    color: inherit;
    background-color: var(--color-darkish);
    text-decoration: none;
  }
  .autocmp-item:focus,
	.autocmp-item:focus-visible
	/* .autocmp-item-image:focus,
	.autocmp-item-image:focus-visible */ {
    outline: none;
  }
  .autocmp-item {
    display: flex;
    align-items: center;
    line-height: 1;
    padding: 0.5rem;
  }
  .autocmp-item:hover,
  .autocmp-item:focus {
    background-color: var(--color-active-dark);
  }
  /* .autocmp-item-image {
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	} */

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
