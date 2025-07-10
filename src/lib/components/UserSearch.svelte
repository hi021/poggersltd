<script lang="ts">
  import { preventDefault } from "svelte/legacy";
  import { onMount, tick } from "svelte";
  import { debounce, getAvatarURL } from "$lib/util";
  import { slide } from "svelte/transition";

  let searchInputElement = $state() as HTMLInputElement;
  let autocompleteEntries: Array<{ _id: number; name: string }> = $state([]);
  interface Props {
    value?: string;
    style?: string;
    disabled?: boolean;
    autofocus?: boolean;
    gotoPlayer: ({ _id, name }: { _id?: number; name: string }) => void;
    gotoPlayerOnEnter?: ({ _id, name }: { _id?: number; name: string }) => void;
  }

  let {
    value = $bindable(""),
    style = "",
    disabled = false,
    autofocus = true,
    gotoPlayer,
    gotoPlayerOnEnter = gotoPlayer
  }: Props = $props();

  export const focusInput = () => tick().then(() => searchInputElement.focus());

  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (
      !target?.className?.includes?.("autocmp-item") &&
      !target?.className?.includes?.("search-input")
    )
      autocompleteEntries = [];
  }

  async function getAutocomplete(query = value) {
    if (query?.length < 3 || disabled) {
      autocompleteEntries = [];
      return;
    }

    autocompleteDebounced(query);
  }

  const autocompleteDebounced = debounce(async (query) => {
    try {
      const res = await fetch(`/api/player/${query}/search`);
      const resJson = await res.json();

      if (resJson?.length) autocompleteEntries = resJson;
      else autocompleteEntries = [];
    } catch (e) {
      console.error("Failed to fetch players autocomplete:", e);
      autocompleteEntries = [];
    }
  }, 500);

  onMount(() => {
    addEventListener("click", handleClick);
    if (autofocus) focusInput();

    return () => removeEventListener("click", handleClick);
  });
</script>

<form
  class="search-input-wrapper input-dark row"
  class:disabled
  {style}
  onsubmit={preventDefault(() => gotoPlayerOnEnter({ name: value }))}>
  <div class="autocmp-wrapper">
    <input
      class="search-input input-dark"
      style="--shadow-color: {autocompleteEntries.length ? 'transparent' : 'var(--color-darkest)'}"
      type="text"
      placeholder="osu! username"
      autocomplete="new-password"
      spellcheck="false"
      bind:this={searchInputElement}
      bind:value
      {disabled}
      onfocus={() => getAutocomplete(value)}
      oninput={() => getAutocomplete(value)} />

    <ul class="autocmp-items">
      {#each autocompleteEntries as a (a._id)}
        <li transition:slide={{ duration: 100, axis: "y" }}>
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a
            href=""
            class="autocmp-item"
            tabindex="0"
            role="button"
            onclick={preventDefault(() => {
              value = a.name;
              gotoPlayer(a);
              autocompleteEntries = [];
            })}>
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

  <button type="submit" class="btn-search btn-none" aria-label="Search" {disabled}>
    <icon class="search big"></icon>
  </button>
</form>

<style>
  /* SEARCH WRAPPER */
  .search-input-wrapper {
    --radius: 9999px;
    position: relative;
    width: 100%;
    min-width: 2rem;
    align-items: center;
    padding: 0;
    border-radius: var(--radius);
  }
  .search-input-wrapper.disabled {
    opacity: 0.5;
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
  .btn-search:not(:disabled):hover {
    background-color: var(--color-darker);
  }
  .search-input {
    padding-left: 1em;
    padding-right: 2.875em;
    background-color: transparent;
    width: 100%;
  }
  .search-input:focus {
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
  .autocmp-item:is(:global(:hover, :focus)) {
    outline-color: transparent;
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
