// returns an object of arrays sorted descending by gains: {[category]: Array<{id, name, country, value, gained, avg}>}
// gained and avg will be null if player doesn't exist on startDate, player will be ignored completely if doesn't exist on endDate
// used for osu! wrapped stats

import * as path from "path";
import * as dotenv from "dotenv";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { getDaysBetweenDates } from "../shared.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const startDate = "2024-01-01";
const endDate = "2025-01-01";
const daysBetween = getDaysBetweenDates(new Date(endDate), new Date(startDate));
const categories = { top50: 1 }; // ranking categories to count (as a mongodb projection object)
const outputDir = "./results/most-gained-year.json";

// initialize arrays with necessary categories
const arr = {};
const arrFinal = {};
for (const cat of categories) {
  arr[cat] = {};
  arrFinal[cat] = [];
}

const client = await MongoClient.connect(process.env.DB_URI);
const coll = client.db(process.env.DB_NAME).collection("rankings");

const startData = await coll.find({ _id: startDate }, { projection: categories }).toArray();
const endData = await coll.find({ _id: endDate }, { projection: categories }).toArray();

for (const cat of categories) {
  if (!startData?.[cat]) {
    console.warn(`No data on start date (${startDate})!`);
    process.exit(1);
  }
  if (!endData?.[cat]) {
    console.warn(`No data on end date (${endDate})!`);
    process.exit(1);
  }
}

for (const category of endData) {
  if (category == "_id") continue;
  for (const p in category) {
    const plr = category[p];
    arr[category][plr._id] = {
      name: plr.name,
      country: plr.country,
      scores: plr.scores,
      gainedScores: null
    };
  }
}

for (const category of startData) {
  if (category == "_id") continue;
  for (const p in category) {
    const plr = category[p];
    if (!arr[category][plr._id]) continue; // player not in ranking on endDate

    arr[category][plr._id].gainedScores = arr[category][plr._id].scores - plr.scores;
    arr[category][plr._id].avg =
      Math.round((arr[category][plr._id].gainedScores / daysBetween) * 100) / 100;
  }
}

for (const cat in arr)
  for (const plrId in arr[cat]) arrFinal[cat].push({ ...arr[cat][plrId], id: plrId });
for (const cat in arrFinal)
  arrFinal[cat].sort((a, b) => (a.gainedScores < b.gainedScores ? 1 : -1));

if (outputDir) writeFileSync(outputDir, JSON.stringify(arrFinal));
else console.log(arrFinal);

client.close();
