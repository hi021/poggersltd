<script lang="ts">
  import { formatDate, MIN_DATE, addDays } from "$lib/util";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { rankingSettings } from "$lib/stores";

  const MAX_DATE = formatDate();
  let date =
    !$page.params.date || $page.params.date === "latest" || $page.params.date === "last"
      ? MAX_DATE
      : $page.params.date;
  let scoreCategory: string;
  $: scoreCategory = $page.params.category;
  let type: string; // players, countries, or gains
  $: type = $page.url.pathname.split("/")[3];
  let country = $page.params.country;
  let rankingMode: string; // ranking or gains
  $: rankingMode = $page.url.pathname.split("/")[2];

  function addDateNav(days: number) {
    let curDate = new Date(date);
    if (isNaN(curDate.getTime())) curDate = new Date(MAX_DATE);

    const newDate = addDays(curDate, days);
    const formattedDate = formatDate(newDate);
    if (formattedDate < MIN_DATE) date = MIN_DATE;
    else if (formattedDate > MAX_DATE) date = MAX_DATE;
    else date = formattedDate;
    setURL();
  }

  const setURL = (noScroll = true) => {
    const categoryUrl = "/" + (scoreCategory || "top50");
    if (rankingMode !== "ranking") return goto(`/osu/gains${categoryUrl}`);

    const typeUrl = "/" + (type || "players");
    const dateUrl = "/" + (date || "latest");
    const extraUrl = $page.params.extra ? "/" + $page.params.extra : "";
    const ranksUrl = $page.params.ranks || extraUrl ? "/" + ($page.params.ranks || "") : "";
    const countryUrl = country || ranksUrl || extraUrl ? "/" + (country || "all") : "";

    goto(`/osu/ranking${typeUrl}${dateUrl}${categoryUrl}${countryUrl}${ranksUrl}${extraUrl}`, {
      noScroll
    });
  };
</script>

<nav class="secondary-nav row">
  <div class="secondary-nav-inner row">
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top50"}
      on:click={() => {
        scoreCategory = "top50";
        setURL();
      }}>
      Top 50
    </button>
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top25"}
      on:click={() => {
        scoreCategory = "top25";
        setURL();
      }}>
      Top 25
    </button>
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top8"}
      on:click={() => {
        scoreCategory = "top8";
        setURL();
      }}>
      Top 8
    </button>
    <button
      tabindex="0"
      class="secondary-nav-tab btn-none btn-rect"
      class:active={scoreCategory === "top1"}
      on:click={() => {
        scoreCategory = "top1";
        setURL();
      }}>
      Top 1
    </button>
  </div>

  {#if rankingMode === "ranking"}
    <div class="secondary-nav-inner row">
      <button
        tabindex="0"
        class="secondary-nav-tab btn-none btn-rect"
        class:active={type === "countries"}
        on:click={() => {
          type = "countries";
          setURL();
        }}>
        Countries
      </button>
      <button
        tabindex="0"
        class="secondary-nav-tab btn-none btn-rect"
        class:active={type === "gains"}
        on:click={() => {
          type = "gains";
          setURL();
        }}>
        Gains
      </button>
      <button
        tabindex="0"
        class="secondary-nav-tab btn-none btn-rect"
        class:active={type === "players"}
        on:click={() => {
          type = "players";
          setURL();
        }}>
        Players
      </button>
    </div>
  {/if}
</nav>

{#if rankingMode === "ranking"}
  <form
    id="group-container"
    class="row"
    class:sticky={$rankingSettings.dateSticky}
    on:submit|preventDefault={() => setURL(true)}>
    <button
      class="arrow-button btn-none"
      type="button"
      title="Previous day"
      disabled={date <= MIN_DATE}
      on:click={() => addDateNav(-1)}>
      <icon class="single-arrow flip-h" />
    </button>
    <div class="group">
      <input
        class="input-dark normal-size"
        type="date"
        placeholder="date"
        max={MAX_DATE}
        min={MIN_DATE}
        bind:value={date} />
      <button class="yoink-button" type="submit">yoink</button>
    </div>
    <button
      class="arrow-button btn-none"
      type="button"
      title="Next day"
      disabled={date >= MAX_DATE}
      on:click={() => addDateNav(1)}>
      <icon class="single-arrow" />
    </button>
  </form>
{/if}

<slot />

<style>
  .secondary-nav {
    background: linear-gradient(
      var(--color-darker) -12%,
      var(--color-dark) 20%,
      var(--color-dark) 80%,
      var(--color-darker) 112%
    );
    justify-content: space-between;
    padding: 0 20px;
    margin-bottom: 16px;
    font-size: 0.825rem;
  }
  .secondary-nav-tab {
    padding: 8px 12px;
    cursor: pointer;
    color: var(--color-light);
  }
  .secondary-nav-tab:is(:hover, :focus) {
    outline-color: transparent;
    color: var(--color-lightest);
  }
  .secondary-nav-tab.active {
    color: var(--color-active);
  }

  #group-container {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    margin: 0 2.5%;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
  #group-container.sticky {
    position: sticky;
    top: 0;
  }
  .group {
    display: flex;
    align-items: stretch;
  }

  .yoink-button {
    background-color: var(--color-active);
    transition: opacity 0.2s;
  }
  .yoink-button:is(:hover, :focus) {
    opacity: 0.75;
  }

  .arrow-button {
    --radius: 10px;
    color: inherit;
    font-size: 1.25rem;
    border-radius: 0;
    padding: 0 12px;
    background-color: rgba(0, 0, 0, 0.15);
  }
  .arrow-button:first-child {
    border-bottom-left-radius: var(--radius);
    border-top-left-radius: var(--radius);
  }
  .arrow-button:last-child {
    border-bottom-right-radius: var(--radius);
    border-top-right-radius: var(--radius);
  }
  .arrow-button:disabled {
    background-color: rgba(0, 0, 0, 0);
    opacity: 0.2;
  }
  .arrow-button:not(:disabled):hover {
    background-color: rgba(0, 0, 0, 1);
  }

  @media (width <= 40rem) {
    :global(.osu-table) {
      border-spacing: 0 2px;
      margin: 10px 2%;
    }
    :global(.osu-table td:first-child) {
      padding-left: 1px;
      font-size: 0.875rem;
    }
    :global(.osu-table td:last-child) {
      padding-right: 1px;
    }

    .secondary-nav-inner {
      flex-direction: column;
      padding-top: 12px;
    }
    .secondary-nav-tab {
      padding: 6px;
    }
  }
</style>
