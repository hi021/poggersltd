// returns an object of arrays sorted descending by gains: {[category]: Array<{id, name, country, value, gained, avg}>}
// `gained` and `avg` will be null if player doesn't exist on startDate, player will be ignored completely if doesn't exist on endDate
// used for osu! wrapped stats

import { getDaysBetweenDates } from "../shared.js";
import { fileURLToPath } from "url";
import { writeFileSync } from "fs";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const startDate = "2023-01-01";
const endDate = "2024-01-01";
const categories = { top50: 1 }; // ranking categories to count (as a mongodb projection object)
const outputDir = "results/most-gained-year.json";

// initialize arrays with necessary categories
const arr = {};
const arrFinal = {};
for (const cat in categories) {
  arr[cat] = {};
  arrFinal[cat] = [];
}

const client = await MongoClient.connect(process.env.DB_URI);
const coll = client.db(process.env.DB_NAME).collection("rankings");

const daysBetween = getDaysBetweenDates(new Date(endDate), new Date(startDate));
const startData = await coll.findOne({ _id: startDate }, { projection: categories });
const endData = await coll.findOne({ _id: endDate }, { projection: categories });

for (const cat in categories) {
  if (!startData?.[cat]?.length) {
    console.warn(`No ranking data on start date (${startDate})!`);
    process.exit(1);
  }
  if (!endData?.[cat]?.length) {
    console.warn(`No ranking data on end date (${endDate})!`);
    process.exit(1);
  }
}

for (const category in endData) {
  if (category == "_id") continue;
  for (const player of endData[category]) {
    arr[category][player._id] = {
      name: player.name,
      country: player.country,
      scores: player.scores,
      gainedScores: null
    };
  }
}

for (const category in startData) {
  if (category == "_id") continue;
  for (const player of startData[category]) {
    if (!arr[category][player._id]) continue; // player not in ranking on endDate

    arr[category][player._id].gainedScores = arr[category][player._id].scores - player.scores;
    arr[category][player._id].avg =
      Math.round((arr[category][player._id].gainedScores / daysBetween) * 100) / 100;
  }
}

for (const cat in arr)
  for (const plrId in arr[cat]) arrFinal[cat].push({ ...arr[cat][plrId], id: plrId });
for (const cat in arrFinal)
  arrFinal[cat].sort((a, b) => (a.gainedScores < b.gainedScores ? 1 : -1));

if (outputDir) {
  writeFileSync(outputDir, JSON.stringify(arrFinal));
  console.log("Saved output to " + outputDir);
} else console.log(arrFinal);

client.close();
