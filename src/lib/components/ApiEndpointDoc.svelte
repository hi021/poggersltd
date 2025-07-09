<script lang="ts">
  interface Props {
    method?: "GET" | "POST";
    urlApi?: string;
    urlCategory?: string;
    urlMain: string;
    urlParams?: App.ApiParams | undefined;
    exampleUrl?: string | undefined;
    returnValueHtml?: string | undefined;
  }

  let {
    method = "GET",
    urlApi = "/api/",
    urlCategory = "",
    urlMain,
    urlParams = undefined,
    exampleUrl = undefined,
    returnValueHtml = undefined
  }: Props = $props();

  function buildParamsRouteString() {
    if (!urlParams) return "";

    let string = "";
    for (const paramName in urlParams) {
      const optional = urlParams[paramName].optional;
      string += `/[${paramName}${optional ? "?" : ""}]`;
    }

    return string;
  }
</script>

<h4 class="endpoint-url">
  {urlApi}{urlCategory}<span class="emphasis">{urlMain}</span><span class="endpoint-params"
    >{buildParamsRouteString()}</span>
  <span class="method {method}"></span>
  {#if exampleUrl}
    <a class="a btn-anchor" href={exampleUrl} target="_blank">See example</a>
  {/if}
</h4>

{#if urlParams}
  <table class="param-table">
    <caption>Route (positional) parameters</caption>
    <tbody>
      {#each Object.entries(urlParams) as [name, param]}
        <tr>
          <td class="name-cell">{name}</td>
          <td class="type-cell">{param.type}</td>
          <td class="description-cell">{@html param.description}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

{#if returnValueHtml}
  <h5>Returns</h5>
  <p class="return-values">
    <code>{@html returnValueHtml}</code>
  </p>
{/if}

<style>
  h5 {
    margin-bottom: 4px;
  }
  .btn-anchor {
    font-size: 80%;
    padding: 4px 6px;
    border-radius: 999px;
    background-color: color-mix(in srgb, var(--color-active) 50%, transparent);
  }

  .description-main {
    font-size: 0.9375rem;
    opacity: 0.9;
  }
  .description {
    font-size: 0.875rem;
    display: block;
  }
  .type-name {
    font-weight: 500;
    color: #80cbc4;
  }
  .type-type {
    padding: 3px;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .endpoint-params {
    color: #999;
  }
  .method {
    font-size: 80%;
    padding: 3px 5px;
    border-radius: 999px;
  }
  .method.GET {
    background-color: #558b2f;
  }
  .method.GET::after {
    content: "GET";
  }
  .method.POST {
    background-color: #c9c043;
  }
  .method.POST::after {
    content: "POST";
  }
  .return-values {
    margin: 0;
  }
  .return-values > code {
    padding: 3px;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .param-table {
    border-spacing: 5px;
  }
  .param-table caption {
    font-weight: 300;
    font-size: 1.125em;
    margin-bottom: 10px;
  }
  .name-cell {
    font-weight: 500;
    text-align: right;
  }
  .type-cell {
    padding: 3px;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.1);
    font-family: monospace;
  }
  .description-cell {
    font-size: 0.875em;
  }

  .emphasis {
    color: var(--color-active);
  }
</style>
