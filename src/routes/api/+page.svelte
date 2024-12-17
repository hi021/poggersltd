<script lang="ts">
  import ApiEndpointDoc from "$lib/components/ApiEndpointDoc.svelte";
  import { MIN_DATE } from "$lib/util";

  const paramsCommon: App.ApiParams = {
    date: {
      type: "string",
      optional: false,
      description: `Date in YYYY-MM-DD format or "latest"/"last" to use today's UTC date<br />
        Minimum date is ${MIN_DATE}, maximum is today's UTC date - throws a 400 error outside that range`
    },
    category: {
      type: "RankingCategory",
      optional: true,
      description: `Score category (defaults to top50), throws a 400 error on invalid category`
    },
    country: {
      type: "string",
      optional: true,
      description: `"all" or 2-letter country codes separated by commas to filter players from given countries, any invalid value is ignored<br />
        E.g. "CL" for Chile, defaults to showing all players`
    },
    ranks: {
      type: "string",
      optional: true,
      description: `Min-Max rank inclusive (score ranking position), 0 or empty count as range bound<br />
        E.g. 2-100 to show the top 100 excluding the first player, defaults to showing all players`
    }
  };

  const rankingParams: App.ApiParams = {
    date: paramsCommon.date,
    category: paramsCommon.category,
    country: paramsCommon.country,
    ranks: paramsCommon.ranks
  };
  const rankingGainsParams: App.ApiParams = {
    ...rankingParams,
    gainedDays: {
      type: "number",
      optional: true,
      description: `Number of days to go back, defaults to 1`
    }
  };
</script>

<svelte:head>
  <title>api - poggers</title>
</svelte:head>

<main>
  <h1>poggers api</h1>
  <p>
    This API is not private but it sure is a mess
    <br />
    Yell at <code class="emphasis">hiihailey</code> in case it explodes
    <br />
    <small>server smol please be gentle;;</small>
  </p>
  <small>v3.2 (<a class="a" href="#changelog" title="changelog">2024-10-21</a>)</small>

  <h2 id="types">Types</h2>
  <div><code>?</code> signifies an optional (nullable) type</div>
  <span id="PlayerRanking" class="type-name">PlayerRanking</span>
  <ul>
    <li>
      <span>date</span>
      <code class="type-type">string</code>
      <span class="description"> YYYY-MM-DD day from which the data was taken </span>
    </li>
    <li>
      <span>scores</span>
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
      <span>gainedScores</span>
      <code class="type-type">number?</code>
      <span class="description"
        >amount of scores gained in the last `gainedDays` days, undefined if not in previous ranking
        archive</span>
    </li>
    <li>
      <span>gainedRanks</span>
      <code class="type-type">number?</code>
      <span class="description"
        >amount of ranks gained in the last `gainedDays` days, undefined if not in previous ranking
        archive</span>
    </li>
    <li>
      <span>gainedDays</span>
      <code class="type-type">number?</code>
      <span class="description">defaults to 1, only set in case of a gap in archive entries</span>
    </li>
    <li>
      <span>mostGained</span>
      <code
        >{"{date: "}<code class="type-type">string</code>, scores:
        <code class="type-type">number</code>{"}"}</code>
      <span class="description">value is most gained scores in one day, date is YYYY-MM-DD</span>
    </li>
    <li>
      <span>peak</span>
      <code
        >{"{date: "}<code class="type-type">string</code>, scores:
        <code class="type-type">number</code>{"}"}</code>
      <span class="description">highest score count</span>
    </li>
    <li>
      <span>lowest</span>
      <code
        >{"{date: "}<code class="type-type">string</code>, scores:
        <code class="type-type">number</code>{"}"}</code>
      <span class="description">lowest score count</span>
    </li>
  </ul>

  <span id="PlayerInfo" class="type-name">PlayerInfo</span>
  <ul>
    <li>
      <span>_id</span>
      <code class="type-type">number</code>
      <span class="description">osu! id</span>
    </li>
    <li>
      <span>name</span>
      <code class="type-type">string</code>
      <span class="description">last known osu! username</span>
    </li>
    <li>
      <span>country</span>
      <code class="type-type">string</code>
      <span class="description">uppercase 2-letter country code (e.g. "CL")</span>
    </li>
    <li>
      <span>oldNames</span>
      <code class="type-type">Array&lt;string&gt;?</code>
      <span class="description">past osu! usernames (from when the player was tracked)</span>
    </li>
  </ul>

  <span id="RankingCategory" class="type-name">RankingCategory</span>
  <ul>
    <li>
      <code class="type-type">'top50' | 'top25' | 'top8' | 'top1'</code>
    </li>
  </ul>

  <span id="Player" class="type-name">Player</span>
  <ul>
    <li>
      <code class="type-type"
        >{"PlayerInfo & { [ranking in RankingCategory]?: PlayerRanking }"}</code>
    </li>
  </ul>

  <span id="CountryRanking" class="type-name">CountryRanking</span>
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

  <span id="MostGainedRanking" class="type-name">MostGainedRanking</span>
  <p class="description-main">Used for most gained rankings at /api/gains</p>
  <ul>
    <li>
      <span>rank</span>
      <code class="type-type">number</code>
      <span class="description">ranking position (1-99)</span>
    </li>
    <li>
      <span>_id</span>
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
      <span>scores</span>
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

  <ApiEndpointDoc
    urlCategory="ranking/"
    urlMain="players"
    urlParams={rankingParams}
    exampleUrl="/api/ranking/players/2024-01-01/top50/US,GB,AU/20-180"
    returnValueHtml={`Array&lt;<a class="a" href="#Player"><code class="type-type">Player</code></a>&gt;`} />
  <ApiEndpointDoc
    urlCategory="ranking/"
    urlMain="gains"
    urlParams={rankingGainsParams}
    exampleUrl="/api/ranking/gains/2024-01-01/top50/US,GB,AU/0-0/10"
    returnValueHtml={`Array&lt;<a class="a" href="#Player"><code class="type-type">Player</code></a>&gt;`} />
  <ApiEndpointDoc
    urlCategory="ranking/"
    urlMain="countries"
    urlParams={rankingParams}
    exampleUrl="/api/ranking/countries/2024-01-01/top50"
    returnValueHtml={`Array&lt;<a class="a" href="#CountryRanking"><code class="type-type">CountryRanking</code></a>&gt;`} />

  <hr />

  <h2 id="changelog">Changelog</h2>
  <ul>
    <li>
      <span>v2.0 (2022-10)</span>
      <ol>
        <li>First prototype</li>
      </ol>
    </li>
  </ul>
</main>

<style>
  main {
    padding: 0.5rem 7.5%;
    color: #ddd;
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

  .emphasis {
    color: var(--color-active);
  }
</style>
