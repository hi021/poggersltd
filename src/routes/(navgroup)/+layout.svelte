<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import { page } from "$app/state";
</script>

<header class="row">
  <a href="/home" class="logo-text flex-center unselectable"> poggers </a>

  <div class="vr hide-width-640"></div>
  <hr class="show-width-640" />

  <nav class="row column-width-640">
    <a
      href="/osu/ranking"
      class="nav-tab"
      class:active={page.url.pathname.startsWith("/osu/ranking")}>
      Ranking
    </a>
    <a
      href="/osu"
      class="nav-tab"
      class:active={page.url.pathname === "/osu" || page.url.pathname.startsWith("/osu/player")}>
      Player
    </a>
    <a
      href="/osu/breakdown"
      class="nav-tab"
      class:active={page.url.pathname.startsWith("/osu/breakdown")}>
      Breakdown
    </a>
    <a
      href="/osu/gains/top50"
      class="nav-tab"
      class:active={page.url.pathname.startsWith("/osu/gains")}>
      Most Gained
    </a>
    <a href="/about" class="nav-tab right" class:active={page.url.pathname.startsWith("/about")}>
      About
    </a>
  </nav>
</header>

<slot />

<Footer />

<style>
  header {
    background-color: var(--color-dark);
  }
  .logo-text {
    font-size: 1.25rem;
    font-weight: 500;
  }
  .vr {
    margin: 14px 8px;
  }
  hr {
    margin: 6px 10% 2px 10%;
  }

  nav {
    width: 100%;
  }

  .nav-tab {
    padding: 16px;
    color: inherit;
    text-decoration: none;
  }
  .nav-tab:is(:hover, :focus) {
    outline-color: transparent;
    background-color: rgba(0, 0, 0, 0.2);
  }
  .nav-tab.active {
    color: var(--color-active);
  }
  .nav-tab.right {
    margin-left: auto;
  }

  @media (width <= 40rem) {
    header {
      flex-direction: column;
    }

    .nav-tab {
      padding: 6px;
      text-align: center;
    }
    .nav-tab.right {
      margin-left: 0;
    }
  }
</style>
