<script>
  import Footer from "$lib/components/Footer.svelte";
  import MenuButton from "$lib/components/MenuButton.svelte";
</script>

<svelte:head>
  <title>poggers</title>
</svelte:head>

<header>
  <a href="/" class="logo-text unselectable">poggers</a>
</header>

<main class="row flex-fill">
  <MenuButton
    backgroundColor="#88bbff"
    href="/osu"
    label="osu! stats"
    backgroundImage="url(/osu_triangles.svg)"
    tooltipContent="All leaderboard scores ranking stats in one place" />
  <MenuButton
    backgroundColor="rgb(100,181,246)"
    href="https://ht.poggers.ltd"
    label="Hardware Tycoon"
    backgroundImage="url(/ht_thumb.jpg)"
    tooltipContent="A little browser strategy/management game about running a hardware company" />
</main>

<Footer />

<style>
  header {
    position: relative;
    text-align: center;
    font-weight: 600;
    font-size: 2rem;
    padding: 1.25rem 0.25rem;
    line-height: 1;
    margin-bottom: 42px;
    background-image: url("/4am_girl.png");
    background-position: 0 45%;
    background-repeat: no-repeat;
    box-shadow: 0 3px 2px var(--color-darkest);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  header::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(
      160deg,
      var(--color-purple) 25%,
      color-mix(in srgb, transparent, var(--color-pink) 25%)
    );
    z-index: -1;
  }

  main {
    padding: 0 2rem;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-bottom: 32px;
    align-content: baseline;
    justify-content: space-around;
  }
</style>
