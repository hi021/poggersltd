<script>
  import { page } from "$app/stores";
</script>

<svelte:head>
  <title>oopsie - poggers</title>
</svelte:head>

<main>
  <h2>fuckie wuckie &gt; ~ &lt;</h2>
  <div class="flex-center" style="margin-bottom: 36px; align-items: stretch; line-height: 1;">
    <div class="error-status">
      {$page.status || ":("}
    </div>
    <div class="vr" style="margin: 26px 32px;" />
    <p class="flex-center" style="font-weight: 300; font-size: 2.25rem;">
      {$page?.error?.message || "An error has occurred..."}
    </p>
  </div>

  <a class="a" href="/home">Go home</a>
</main>

<style>
  /* TODO switch to column direction on media width */
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
</style>
