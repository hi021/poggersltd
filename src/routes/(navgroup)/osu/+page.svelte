<script lang="ts">
  import { goto } from "$app/navigation";
  import UserSearch from "$lib/components/UserSearch.svelte";

  const gotoPlayer = (idOrName: string | number) => goto("/osu/player/" + idOrName + "/top50");
</script>

<svelte:head>
  <title>osu! search - poggers</title>
</svelte:head>

<main class="flex-fill column" style="padding: 0 3.5%">
  <div class="search-logo">
    <div class="logo-letter" style="color: #5cc4ff;">p</div>
    <div class="logo-letter" style="color: #ff82e3;">o</div>
    <div class="logo-letter" style="color: #fbfbfb;">g</div>
    <div class="logo-letter logo-letter-tilted" style="color: #fbfbfb;">g</div>
    <div class="logo-letter" style="color: #fbfbfb;">e</div>
    <div class="logo-letter" style="color: #ff82e3;">r</div>
    <div class="logo-letter" style="color: #5cc4ff;">s</div>
  </div>
  <UserSearch {gotoPlayer} gotoPlayerKey={gotoPlayer} />
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

  @media screen and (max-width: 640px) {
    .search-logo {
      font-size: 5.25rem;
      margin: 2rem;
    }
  }
</style>
