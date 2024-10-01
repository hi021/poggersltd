<script lang="ts">
  import { goto } from "$app/navigation";
  import UserSearch from "$lib/components/UserSearch.svelte";

  let dialogElement: HTMLDialogElement;

  const gotoPlayer = ({ _id, name }: { _id?: number; name: string }) =>
    goto(`osu/player/${_id}/top50`);
</script>

<svelte:head>
  <title>osu! search - poggers</title>
</svelte:head>

<dialog bind:this={dialogElement}>
  <h2>
    <span>Lucky you!</span>
    <form method="dialog">
      <button type="submit" class="btn-icon"><icon class="close" /></button>
    </form>
  </h2>
  <img
    alt="imagine cute gay women"
    src="https://cdn.discordapp.com/attachments/1213506859596644382/1215839151354810401/d33df31f96f5a19fa6404a4db2ca3a6d.png?ex=66fbfe32&is=66faacb2&hm=eb34d45e02511456758e6de7047e71c2b0b12cf02b18c5209c7831bbe2b35ec8&" />
</dialog>

<main class="flex-fill column" style="padding: 0 3.5%">
  <span class="search-logo">
    <div class="logo-letter" style="color: #5cc4ff;">p</div>
    <div class="logo-letter" style="color: #ff82e3;">o</div>
    <div class="logo-letter" style="color: #fbfbfb;">g</div>
    <div class="logo-letter logo-letter-tilted" style="color: #fbfbfb;">g</div>
    <div class="logo-letter" style="color: #fbfbfb;">e</div>
    <div class="logo-letter" style="color: #ff82e3;">r</div>
    <div class="logo-letter" style="color: #5cc4ff;">s</div>
  </span>

  <UserSearch {gotoPlayer} />

  <span class="buttons-container">
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a
      class="search-button"
      href=""
      data-text="I'm feeling lucky"
      on:click={() => dialogElement.showModal()}>
      I'm feeling lucky
      <icon class="heart" />
    </a>
    <a class="search-button" href="/osu/players" data-text="Player comparison chart">
      Player comparison chart
      <icon class="chart-bold" />
    </a>
  </span>
</main>

<style>
  .search-logo {
    font-weight: 700;
    font-size: 7.5rem;
    letter-spacing: -0.5625rem;
    display: flex;
    justify-content: center;
    cursor: default;
    margin: 3rem;
    user-select: none;
  }
  .logo-letter {
    transition: transform 0.15s ease;
  }
  .logo-letter:hover {
    transform: translateY(-10px);
  }
  .logo-letter-tilted {
    transform: rotate(12deg);
    transition:
      transform 0.15s ease,
      margin 0.15s ease;
  }
  .logo-letter-tilted:hover {
    transform: rotate(0deg);
    margin-left: 0;
  }

  .buttons-container {
    display: inline-flex;
    font-size: 1.125rem;
    margin: 20px auto;
    gap: 12px;
  }
  .search-button {
    position: relative;
    color: transparent;
    text-decoration: none;
    padding: 12px 16px;
    border-radius: 9999px;
    background-color: var(--color-dark);
    overflow: hidden;
  }
  .search-button > icon {
    position: absolute;
    font-size: 1.333rem;
    color: var(--color-lighter);
    top: 0;
    left: 50%;
    height: 100%;
    opacity: 0;
    transform: translateX(-50%);
  }
  .search-button::after {
    content: attr(data-text);
    color: var(--color-lighter);
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    line-height: calc(24px + 1.5rem);
    background: var(--color-dark);
    transition: opacity 0.1s linear;
  }
  .search-button:hover {
    background: linear-gradient(
      130deg,
      var(--color-dark),
      #c51162,
      #aa00ff,
      #6200ea,
      var(--color-dark)
    );
  }
  .search-button:hover > icon {
    opacity: 0.7;
  }
  .search-button:hover::after {
    opacity: 0;
  }

  dialog {
    position: relative;
    border-radius: 16px;
    color: var(--color-lighter);
    border: none;
    background-color: var(--color-dark);
    box-shadow: 4px 4px 0.4rem 1px var(--color-darker);
    animation: fade-in 0.2s ease-in forwards;
  }
  dialog::after {
    content: "src: mabin";
    position: absolute;
    bottom: calc(1em + 12px);
    left: calc(1em + 12px);
    color: #272727;
    opacity: 0.5;
  }
  dialog::backdrop {
    opacity: 0.3;
    background-color: var(--color-light);
  }
  dialog h2 {
    display: flex;
    justify-content: space-between;
    margin-top: 0;
    padding-left: 4px;
    font-size: 2rem;
  }
  dialog h2 icon {
    color: var(--color-lighter);
    font-size: 2rem;
  }
  dialog img {
    max-width: 88svw;
    max-height: 86svh;
    border-radius: 12px;
    border: 2px solid var(--color-darkest);
    user-select: none;
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @media screen and (max-width: 40rem) {
    .search-logo {
      font-size: 5.25rem;
      margin: 2rem;
    }
  }
</style>
