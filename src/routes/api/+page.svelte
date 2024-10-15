<svelte:head>
  <title>api - poggers</title>
</svelte:head>

<main>
  <h1>poggers api</h1>
  <p>
    This API is not private but it sure is a mess
    <br />
    Yell at <code>hiihailey</code> in case it explodes
    <br />
    <small>server smol please be gentle;;</small>
  </p>
  <small>v3.1 (<a href="#changelog" title="changelog">2024-09-06</a>)</small>

  <h2 id="types">Types</h2>
  <span class="type-name">PlayerRanking</span>
  <ul>
    <li>
      <span>date</span>
      <code class="type-type">string</code>
      <span class="description"> YYYY-MM-DD day from which the data was taken </span>
    </li>
    <li>
      <span>value</span>
      <code class="type-type">number</code>
      <span class="description">amount of scores</span>
    </li>
    <li>
      <span>rank</span>
      <code class="type-type">number</code>
      <span class="description">global rank in given scores ranking</span>
    </li>
    <li>
      <span>countryRank</span>
      <code class="type-type">number</code>
    </li>
    <li>
      <span>gained</span>
      <code class="type-type">number | undefined</code>
      <span class="description"
        >amount of scores gained in the last `gainedDays` days, undefined if not in previous ranking
        archive</span>
    </li>
    <li>
      <span>gainedRank</span>
      <code class="type-type">number | undefined</code>
      <span class="description"
        >amount of ranks gained in the last `gainedDays` days, undefined if not in previous ranking
        archive</span>
    </li>
    <li>
      <span>gainedDays</span>
      <code class="type-type">number | undefined</code>
      <span class="description">defaults to 1, only set in case of a gap in archive entries</span>
    </li>
    <li>
      <span>mostGained</span>
      <code
        >{"{date: "}<code class="type-type">string</code>, value:
        <code class="type-type">number</code>{"}"}</code>
      <span class="description">value is most gained scores in one day, date is YYYY-MM-DD</span>
    </li>
    <li>
      <span>peak</span>
      <code
        >{"{date: "}<code class="type-type">string</code>, value:
        <code class="type-type">number</code>{"}"}</code>
      <span class="description">highest score count</span>
    </li>
    <li>
      <span>lowest</span>
      <code
        >{"{date: "}<code class="type-type">string</code>, value:
        <code class="type-type">number</code>{"}"}</code>
      <span class="description">lowest score count</span>
    </li>
  </ul>

  <span class="type-name">PlayerInfo</span>
  <ul>
    <li>
      <span>_id</span>
      <code class="type-type">number</code>
      <span class="description">osu! id</span>
    </li>
    <li>
      <span>name</span>
      <code class="type-type">string</code>
      <span class="description">current osu! username</span>
    </li>
    <li>
      <span>country</span>
      <code class="type-type">string</code>
      <span class="description">uppercase 2-letter country code</span>
    </li>
    <li>
      <span>oldName</span>
      <code class="type-type">string[]</code>
      <span class="description">previous osu! usernames (from when the player was tracked)</span>
    </li>
  </ul>

  <span class="type-name">RankingCategory</span>
  <ul>
    <li>
      <code class="type-type">'top50' | 'top25' | 'top8' | 'top1'</code>
    </li>
  </ul>

  <span class="type-name">Player</span>
  <ul>
    <li>
      <code class="type-type"
        >{"PlayerInfo & { [ranking in RankingCategory]?: PlayerRanking }"}</code>
    </li>
  </ul>

  <span class="type-name">CountryRanking</span>
  <p class="description-main">Used for country rankings at /api/ranking/countries</p>
  <ul>
    <li>
      <span>country</span>
      <code class="type-type">string</code>
      <span class="description">uppercase 2-letter country code</span>
    </li>
    <li>
      <span>total</span>
      <code class="type-type">number</code>
      <span class="description">total amount of given scores for the country</span>
    </li>
    <li>
      <span>players</span>
      <code class="type-type">number</code>
      <span class="description">total amount of players tracked in the country</span>
    </li>
    <li>
      <span>average</span>
      <code class="type-type">number</code>
      <span class="description">average amount of given scores for the country</span>
    </li>
    <li>
      <span>weighted</span>
      <code class="type-type">number</code>
      <span class="description">weighted amount of given scores for the country</span>
    </li>
  </ul>

  <span class="type-name">MostGainedRanking</span>
  <p class="description-main">Used for most gained rankings at /api/gains</p>
  <ul>
    <li>
      <span>_id</span>
      <code class="type-type">number</code>
      <span class="description">ranking position (1-99)</span>
    </li>
    <li>
      <span>id</span>
      <code class="type-type">number</code>
      <span class="description">player osu! id</span>
    </li>
    <li>
      <span>name</span>
      <code class="type-type">string</code>
      <span class="description">osu! username</span>
    </li>
    <li>
      <span>country</span>
      <code class="type-type">string</code>
      <span class="description">uppercase 2-letter country code</span>
    </li>
    <li>
      <span>value</span>
      <code class="type-type">number</code>
      <span class="description">number of scores total from the day after the gains</span>
    </li>
    <li>
      <span>gained</span>
      <code class="type-type">number</code>
      <span class="description">number of scores gained in 1 day</span>
    </li>
    <li>
      <span>date</span>
      <code class="type-type">string</code>
      <span class="description">YYYY-MM-DD</span>
    </li>
  </ul>

  <hr />

  <h2 id="endpoints">Endpoints</h2>
  <h4 class="endpoint-url">
    /api/ranking/<span class="emphasis">players</span>/[date]/[category]/[country]/[ranks]
    <span class="method get" />
  </h4>
  <h5>Route parameters (positional)</h5>
  <ul>
    <li>
      <span>date</span>
      <code class="type-type">string</code>
      <span class="description">YYYY-MM-DD date or "latest"; minimum date is 2020-05-10</span>
    </li>
    <li>
      <span>category</span>
      <code class="type-type">RankingCategory</code>
      <span class="description">score category</span>
    </li>
    <li>
      <span>country</span>
      <code class="type-type">string</code>
      <span class="description"
        >2-letter country code to show players only from given country or "all"</span>
    </li>
    <li>
      <span>ranks</span>
      <code class="type-type">string</code>
      <span class="description"
        >min-max rank/score ranking position (e.g. 1-100) or 0-0 to show all players</span>
    </li>
  </ul>
  <h5>Returns</h5>
  <code>Array&lt;<code class="type-type">Player</code>&gt;</code>

  <h4 class="endpoint-url">
    /api/ranking/<span class="emphasis">gains</span>/[date]/[category]/[country]/[ranks]/[...days]
    <span class="method get" />
  </h4>
  <h5>Route parameters (positional)</h5>
  <ul>
    <li>
      <span>date</span>
      <code class="type-type">string</code>
      <span class="description">YYYY-MM-DD date or "latest"; minimum date is 2020-05-10</span>
    </li>
    <li>
      <span>category</span>
      <code class="type-type">RankingCategory</code>
      <span class="description">score category</span>
    </li>
    <li>
      <span>country</span>
      <code class="type-type">string</code>
      <span class="description"
        >2-letter country code to show players only from given country or "all"</span>
    </li>
    <li>
      <span>ranks</span>
      <code class="type-type">string</code>
      <span class="description"
        >min-max rank/score ranking position (e.g. 1-100) or 0-0 to show all players</span>
    </li>
    <li>
      <span>days</span>
      <code class="type-type">number</code>
      <span class="description"
        >number of days to go back (defaults to 1), will return an empty array if there is no
        archive entry given days ago</span>
    </li>
  </ul>
  <h5>Returns</h5>
  <code>Array&lt;<code class="type-type">Player</code>&gt;</code>

  <h4 class="endpoint-url">
    /api/ranking/<span class="emphasis">countries</span>/[date]/[category]/[country]/[ranks]
    <span class="method get" />
  </h4>
  <h5>Route parameters (positional)</h5>
  <ul>
    <li>
      <span>date</span>
      <code class="type-type">string</code>
      <span class="description">YYYY-MM-DD date or "latest"; minimum date is 2020-05-10</span>
    </li>
    <li>
      <span>category</span>
      <code class="type-type">RankingCategory</code>
      <span class="description">score category</span>
    </li>
    <li>
      <span>country</span>
      <code class="type-type">string</code>
      <span class="description"
        >2-letter country code to show players only from given country or "all"</span>
    </li>
    <li>
      <span>ranks</span>
      <code class="type-type">string</code>
      <span class="description"
        >min-max rank/score ranking position (e.g. 1-100) or 0-0 to show all players</span>
    </li>
  </ul>
  <h5>Returns</h5>
  <code>Array&lt;<code class="type-type">CountryRanking</code>&gt;</code>

  <h2 id="changelog">Changelog</h2>
  <ul>
    <li>
      <span>v3.2 (2024-10-20)</span>
      <ol>
        <li>First public release</li>
      </ol>
    </li>
  </ul>
</main>

<style>
  main {
    padding: 0.5rem 2.5%;
  }

  .description-main {
    font-size: 0.9375rem;
    opacity: 0.9;
  }
  .description {
    font-size: 0.875rem;
  }
  .type-name {
    font-weight: 500;
    color: #80cbc4;
  }
  .type-type {
    padding: 3px;
    background-color: rgba(0, 0, 0, 0.3);
  }
  .method {
    padding: 5px;
    border-radius: 999px;
  }
  .method.get {
    background-color: #558b2f;
  }
  .method.get::after {
    content: "GET";
  }

  .emphasis {
    color: var(--color-active);
  }
</style>
