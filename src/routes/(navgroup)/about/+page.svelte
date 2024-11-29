<svelte:head>
  <title>about - poggers</title>
</svelte:head>

<main>
  <h1>hii</h1>
  <p style="margin-bottom: 48px;">
    This is an ongoing rewrite of a rewrite of poggers.ltd/pogowanie - a site that tracks <em
      >osu! score leaderboards</em
    >.
    <br />
    Feel free to click around!
    <br />
    Most of the functionality is already implemented, but some of it lacks polish. I'll be working on
    that...
  </p>

  <h2>What's different?</h2>
  <p class="para">
    The site and its API were remade from scratch to hopefully be much more performant and nicer to
    use.
    <br />
    <s>I've also moved away from osu!Stats to respektive's newer API.</s> Well that got shut down...
    the plan was to have top 25, top 8, and top 1 tracking too;
  </p>

  <h2>Caveats & inaccuracies</h2>
  <p class="para">
    poggers.ltd gets its data from osu!Stats, which isn't too reliable.
    <br />
    Here are some of the things to keep in mind:
  </p>
  <ul>
    <li>Only players with at least 1000 (or 1020 since December 1?, 2024) top 50s are included.</li>
    <li>
      Only up to 150 players per country - the US is in trouble! It's an osu!Stats limitation that I
      can't do anything about.
    </li>
    <li>
      For the first 2.5 months or so, only the global top of 150 players was tracked. July 26, 2020
      marks a switch to the 150 players per country tracking mentioned above.
    </li>
    <li>
      Missing countries - there is a handful of players with enough top 50s to qualify for tracking
      missing from the database due to osu!Stats only keeping track of select 59 countries.
    </li>
    <li>
      The final score count depends on the time at which osu!Stats API gets to the given player.
      There could be minor differences if scores are set while osu!Stats is scraping maps, so scores
      that show up as gained on one day might actually have been set a day earlier.
    </li>
    <li>
      Only osu!standard - maybe I was just lazy for not adding in support for other modes, but
      osu!Stats is slow and doesn't like me bombarding it with requests...
    </li>
    <li>
      No osu!lazer scores (sorry Maklovitz) - lazer leaderboards are still funky and osu!Stats only
      collects classic rankings.
    </li>
    <li>
      Top 25, top 8, and top 1 scores were only collected from Oct 9, 2022 until Mar 20, 2023 (they
      killed respektive's api aaa)
    </li>
    <li>There are gaps in data due to API downtime (though the site is designed around them).</li>
  </ul>

  <h2>osu! score ranking archive</h2>
  <h4>Why are there no scores at a given date?</h4>
  <p class="para">
    Probably because the API was down for the entire day or it never updated with that day's data,
    making it impossible to retrieve the ranking.
    <br />
    Top 25s, 8s, and 1s have been tracked between October 9, 2022 and March 20, 2023 - there is no data
    beyond that period.
    <br />
    <br />
    If you're looking for today's ranking, it becomes available around <em>3:45 p.m. UTC</em>.
    <br />
  </p>
  <h4>How does it work?</h4>
  <p class="para">barely\</p>

  <h2>Credits</h2>
  <p class="para">
    90% of credit goes to Piotrekol, Ezoda, and <s
      ><a class="a" href="https://osustats.ppy.sh" target="_blank" rel="noreferrer"
        >osustats.ppy.sh</a
      ></s
    >, the other 10% goes to stack overflow.
    <br />
    This site has no affiliation with
    <a class="a" href="https://osu.ppy.sh" target="_blank" rel="noreferrer">osu.ppy.sh</a>, but uses
    some of its visual elements.
    <br />
    Flag icons come from
    <a class="a" href="https://github.com/lipis/flag-icons" target="_blank" rel="noreferrer">
      this repository
    </a>.
  </p>

  <h2>Contact</h2>
  <p class="para">
    <span class="centered"
      ><icon class="discord big" /> Scream at <code>hiihailey</code> in case something breaks;;</span>
    <br />
    <span class="centered"
      ><icon class="github big" /> If you'd like to contribute mandarin translations or see where
      your data is being sold to,
      <a class="a" href="https://github.com/hi021/poggersltd" target="_blank" rel="noreferrer"
        >here</a> is the full repo.</span>
  </p>

  <h2>poggers API</h2>
  <p class="para">
    There's a little REST-like API, it's probably usable if you'd like to use the site's data.<br />
    Basic documentation can be found <a class="a" href="/api">here</a>.
  </p>

  <h2>Other osu! stat-tracking sites</h2>
  <ul>
    <li>
      <s><strong><a href="https://osustats.respektive.pw">respektive's osu!stats</a></strong></s>
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
        <strong><a href="https://score.kirino.sh">osu! scores inspector</a></strong> - tons of great stats & clans ☻
    </li>
    <li>
      <strong><a href="https://osudaily.net">osu!daily</a></strong> - lots of rankings like playcount,
      SS count, etc. & automatic daily profile stats tracking similar to osu!track
    </li>
    <li>
        <strong><a href="https://inex.osekai.net">Osekai</a></strong> - everything about medals and more interesting stats
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
      font-weight: 400;
      background-color: rgba(0, 0, 0, 0.3);
    margin-top: 30px;
    margin-bottom: -6px;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 3px 0 rgba(0,0,0,0.3);
  }
  h4 {
    margin-bottom: 1px;
  }
  em {
    color: var(--color-active);
    font-style: normal;
  }
  ul {
    line-height: 1.75;
  }

  .para {
    padding-inline-start: 1.25rem;
  }
  .centered {
    display: inline-flex;
    align-items: center;
    gap: 0.5ch;
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

  @media (width <= 40rem) {
    main {
      padding: 0 2.5%;
    }
  }
</style>
