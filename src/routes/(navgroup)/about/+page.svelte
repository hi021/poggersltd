<svelte:head>
  <title>about - poggers</title>
</svelte:head>

<main>
  <h1>hii</h1>
  <p style="margin-bottom: 44px;">
    This is an ongoing rewrite of a rewrite of poggers.ltd/pogowanie - a site that tracks <em
      >osu! score leaderboards.</em>
    <br />
    Feel free to click around!
    <br />
    Most of the functionality is already implemented, but some of it lacks polish. I'll be working on
    that!
  </p>

  <h2>What's different?</h2>
  <p class="para">
    The site and API were remade from scratch to hopefully be much more performant and nicer to use.
    <br />
    <s>I've also moved away from osu!stats to respektive's newer API.</s> Well that got shut down;
    <!-- The biggest change was the inclusion of tracking for top 25, top 8, and top 1 scores. There are also
    user profiles and woah... the site is in dark mode with a brand new UI... -->
  </p>

  <h2>Caveats & inaccuracies</h2>
  <p class="para">
    poggers.ltd uses data from osu!stats, which isn't too reliable. Here are some of the things to
    keep in mind:
  </p>
  <ul>
    <li>
      Missing countries - there is a handful of players with enough top 50s to qualify for tracking
      missing from the database due to osu!stats only keeping track of select 59 countries.
    </li>
    <li>Only up to 150 players per country</li>
    <li>
      Only osu!standard - maybe I was just lazy but osu!stats is slow and doesn't like me bombarding
      it with requests
    </li>
    <li>
      Top 25, top 8, and top 1 scores were only collected from oct 2022 to ??? respektive api ahhh
    </li>
    <li>Gaps in data due to API downtime (though the site is designed around it)</li>
  </ul>

  <h2>Credits</h2>
  <p class="para">
    90% of credit goes to respektive and <a
      class="a"
      href="https://osustats.respektive.pw"
      target="_blank"
      rel="noreferrer">osustats.respektive.pw</a
    >, the other 10% goes to stack overflow.
    <br />
    The site also uses images from
    <a class="a" href="https://osu.ppy.sh" target="_blank" rel="noreferrer">osu.ppy.sh</a>
    and flag icons from
    <a class="a" href="https://github.com/lipis/flag-icons" target="_blank" rel="noreferrer"
      >this repository</a
    >.
  </p>

  <h2>Contact</h2>
  <p class="para">
    Scream at <code>hiihailey</code> on Discord in case something breaks;;<br />
    If you'd like to contribute mandarin translations or something, GitHub repo can be found
    <a class="a" href="https://github.com/hi021/poggersltd" target="_blank" rel="noreferrer">here</a
    >.
  </p>

  <h2>osu! score ranking archive</h2>
  <h4>Why are there no scores at a given date?</h4>
  <p class="para">
    Probably because the API was down for the entire day or it never updated with that day's data
    and it wasn't possible to retrieve the ranking.
    <br />
    Top 25s, 8s, and 1s have been tracked since October 9th 2022 and there is no data beyond that date.
    <br />
    <br />
    If you're looking at today's ranking, that becomes available around <em>2 p.m. UTC</em>.
    <br />
    <!-- <small>respektive's API is still quite unstable, so the time may drastically vary from day to day.</small> -->
  </p>
  <h4>How does it work?</h4>
  <p class="para">barely\</p>

  <h2>poggers API</h2>
  <p class="para">
    The site's API is not private and possibly usable.<br />
    Basic documentation can be found <a href="/api">here</a>.
  </p>

  <h2>Other osu! stat-tracking sites</h2>
  <ul>
    <li>
      <s
        ><strong><a href="https://osustats.respektive.pw">respektive's osu!stats</a></strong> - the site
        where all the data comes from with the full ranking including people below 1000 top 50s</s>
    </li>
    <li>
      <strong><a href="https://osustats.ppy.sh">osu!Stats</a></strong> - the original site for score
      rankings where all the data comes from
    </li>
    <li>
      <strong><a href="https://snipe.huismetbenen.nl">osu!snipe</a></strong> - for global #1s, country
      #1s, and other sniping needs
    </li>
    <li>
      <strong><a href="https://ameobea.me/osutrack">osu!track</a></strong> - profile stats tracking with
      satisfying charts
    </li>
    <li>
      <strong><a href="https://osudaily.net">osu!daily</a></strong> - lots of rankings like playcount,
      SS count, etc. & automatic daily profile stats tracking similar to osu!track
    </li>
    <li>
      <strong><a href="https://osuskills.com">osu!Skills</a></strong> - pp ranking but even more broken
    </li>
  </ul>
</main>

<style>
  main {
    padding: 0 12%;
  }

  h1 {
    font-weight: 700;
  }
  h2 {
    margin-top: 22px;
    margin-bottom: -6px;
    font-weight: 400;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 8px;
    border-radius: 8px;
  }
  em {
    color: var(--color-active);
    font-style: normal;
  }

  .para {
    padding-inline-start: 1rem;
  }

  a {
    color: var(--color-active);
  }
  .a {
    color: #999;
  }
  code {
    color: var(--color-active);
    background-color: rgba(0, 0, 0, 0.15);
    padding: 4px;
  }

  @media screen and (max-width: 40rem) {
    main {
      padding: 0 2.5%;
    }
  }
</style>
