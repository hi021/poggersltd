// returns an object {category: Array<{id, name, country, value, gained, date}>}
// used for osu! wrapped stats

import { getRankingEntries } from "../shared.js";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const startDate = "2023-01-01";
const endDate = "2024-01-01";
const categories = ["top50"]; // score categories to count
const maxPlayers = 500;
const minGained = 60;
const outputDir = "results/most-gained-1day.json";

const arr = {};
for (const i of categories) arr[i] = [];

const rankingEntries = await getRankingEntries(startDate, endDate);
const client = await MongoClient.connect(process.env.DB_URI);

for (const rankingEntry of rankingEntries) {
  console.log("Getting data for " + rankingEntry._id);

  for (const cat of categories) {
    // only show day to day gains
    if (!rankingEntry[cat] || rankingEntry[cat][0].gainedDays > 0) continue;

    for (const player of rankingEntry[cat]) {
      if (player.gainedScores >= minGained)
        arr[cat].push({
          id: player._id,
          name: player.name,
          country: player.country,
          scores: player.scores,
          gainedScores: player.gainedScores,
          date: rankingEntry._id
        });
    }
  }
}

const arrFinal = {};
for (const i in arr) {
  arr[i].sort((a, b) => (a.gainedScores < b.gainedScores ? 1 : -1));
  arrFinal[i] = arr[i].slice(0, maxPlayers);
}

if (outputDir) {
  writeFileSync(outputDir, JSON.stringify(arrFinal));
  console.log("Saved output to " + outputDir);
} else console.log(arrFinal);

client.close();
