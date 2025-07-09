<script>
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>oopsie - poggers</title>
</svelte:head>

<main>
  <h2>fuckie wuckie &gt; ~ &lt;</h2>
  <div
    class="flex-center column-width-960"
    style="margin-bottom: 36px; align-items: stretch; line-height: 1;">
    <div class="error-status">
      {page.status || ":("}
    </div>
    <div class="vr hide-width-960" style="margin: 26px 32px;"></div>
    <p class="flex-center" style="font-weight: 300; font-size: 2.25rem;">
      {page?.error?.message || "An error has occurred..."}
    </p>
  </div>

  <a class="a" href="/home">Go home</a>
</main>

<style>
  h2 {
    font-weight: 400;
    font-size: 1.75rem;
  }
  main {
    padding: 3rem 0.25rem;
    text-align: center;
  }
  .error-status {
    font-weight: 600;
    font-size: 7.25rem;
    margin-left: -8rem;
  }
  a {
    font-weight: 300;
    color: var(--color-lightest);
  }

  @media (width <= 60rem) {
    .error-status {
      margin-left: 0;
    }
  }
</style>
