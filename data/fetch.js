// Fetch today's ranking from osu!Stats API and save it as a json and upsert the database entry
// OUTPUT -> ./archive-fetched/

import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { formatDate } from "./shared.js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const today = formatDate();

////////////////////////////
const OUTPUT_FILE = path.resolve(__dirname, "archive-fetched", today + ".json");
const MIN_TOP50 = 1020;
const MAX_PAGE = 10;
////////////////////////////

const client = await MongoClient.connect(process.env.DB_URI);
const dbRankings = client.db(process.env.DB_NAME).collection("rankings");

async function fetchCountryPage(country, page = 1) {
  console.time(`${country} #${page}`);
  let hasNextPage = true;
  let players = [];

  try {
    const body = JSON.stringify({ gamemode: "0", page, rankMin: "1", rankMax: "50", country });
    const response = await fetch("https://osustats.ppy.sh/api/getScoreRanking", {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json"
      }
    });
    if (!response.ok) throw new Error(response.statusText);

    const data = await response.json();
    if (!data?.length) throw new Error("No data returned");

    data.forEach((plr, index) => {
      const scores = Number(plr.count);
      if (scores >= MIN_TOP50) {
        players.push({
          _id: plr.userId,
          name: plr.osu_user.userName,
          rank: 0,
          scores,
          countryRank: (page - 1) * 15 + index + 1,
          country: plr.osu_user.country
        });
      } else {
        hasNextPage = false;
        return false;
      }
    });
  } catch (e) {
    console.log("Failed to fetch country:", e);
    hasNextPage = false;
    players = null;
  } finally {
    console.timeEnd(`${country} #${page}`);
    return { players, hasNextPage };
  }
}

const countries = [
  "US",
  "RU",
  "ID",
  "TW",
  "JP",
  "KR",
  "CN",
  "DE",
  "FR",
  "PL",
  "BR",
  "CL",
  "PH",
  "CA",
  "TH",
  "MX",
  "GB",
  "HK",
  "AR",
  "MY",
  "AU",
  "IT",
  "UA",
  "ES",
  "VN",
  "SG",
  "NL",
  "FI",
  "SE",
  "PE",
  "CO",
  "VE",
  "TR",
  "CZ",
  "BY",
  "BE",
  "NO",
  "PT",
  "AT",
  "HU",
  "RO",
  "DK",
  "KZ",
  "NZ",
  "LT",
  "CH",
  "IL",
  "UY",
  "EE",
  "GR",
  "BG",
  "EC",
  "SK",
  "LV",
  "MO",
  "SA",
  "RS",
  "CR",
  "IE"
];

console.time(`Fetching ${today} ranking took`);
const rankingEntry = [];
for (const country of countries) {
  let page = 1;
  let pageData = { players: null, hasNextPage: true };
  while (pageData.hasNextPage && page <= MAX_PAGE) {
    pageData = await fetchCountryPage(country, page++);

    if (pageData.players == null) {
      console.log("Returned null, aborting.");
      client.close();
      process.exit(2);
    }
    if (!pageData.players.length) break;

    rankingEntry.push(...pageData.players);
  }

  // simplest rate limit to not spam the API
  await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
}

rankingEntry.sort((a, b) => b.scores - a.scores);
for (const i in rankingEntry) rankingEntry[i].rank = Number(i) + 1;

//TODO: most gained ranking

if (OUTPUT_FILE) {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(rankingEntry));
  console.log("Output saved to " + OUTPUT_FILE);
}

try {
  console.log("Inserting into database and creating indexes...");
  await dbRankings.updateOne({ _id: today }, { $set: { top50: rankingEntry } }, { upsert: true });
  await dbRankings.createIndexes([
    { key: { "top50._id": -1 } },
    { key: { "top50.rank": 1 } },
    { key: { "top50.country": -1 } },
    { key: { "top50.countryRank": -1 } },
    { key: { "top50.gainedScores": -1 } }
  ]);
  console.log(`${rankingEntry.length} players`);
} catch (e) {
  console.err("Failed to insert into database:", e);
} finally {
  client.close();
  console.timeEnd(`Fetching ${today} ranking took`);
}
