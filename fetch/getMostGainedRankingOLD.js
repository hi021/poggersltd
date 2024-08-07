/* eslint-disable no-async-promise-executor */
import * as path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import fs from "fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const client = await MongoClient.connect(process.env.DB_URI);
const db = client.db(process.env.DB_NAME);

//
const outputDir = "archive-other/";
const arbitraryMin = { top50: 130, top25: 36, top8: 19, top1: 5 };
//
const scoreArr = { top50: [], top25: [], top8: [], top1: [] };
// will skip these players at those dates, used to fix data for MystExiStentia once (unban?)
const idToIgnore = { 9413991: ["2022-12-16"], 15787074: ["2023-01-10"] };

const collections = await getRankingCollections();
for (const i of collections) {
  const date = i.name;
  const dayData = await db.collection("rankings").findOne({ _id: date });
  if (!dayData) {
    console.log(`Ranking entry for ${date} not found`);
    return client.close();
  }

  for (const cat of dayData) {
    const category = cat._id;
    for (const plr of cat.ranking) {
      if (idToIgnore[plr._id]?.includes(date)) continue;
      if (!plr.gainedDays && plr.gained >= arbitraryMin[category]) {
        delete plr.countryRank;
        delete plr.rank;
        delete plr.gainedRank;
        scoreArr[category].push({ ...plr, date });
      }
    }
  }
}

// sort descending and leave only up to `maxScores` elements
for (const cat in scoreArr) {
  scoreArr[cat].sort((a, b) => (a.gained < b.gained ? 1 : -1));
  scoreArr[cat] = scoreArr[cat].slice(0, process.env.MAX_MOST_GAINED);

  for (const j in scoreArr[cat]) {
    const plr = scoreArr[cat][j];
    plr.id = plr._id; // set osu! id
    plr._id = Number(j) + 1;
  }
}

fs.writeFileSync(path.join(__dirname, outputDir, "mostGained.json"), JSON.stringify(scoreArr));
await db.collection("most-gained").insertOne(scoreArr);

client.close();
