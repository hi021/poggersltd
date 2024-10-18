// Creates the most-gained ranking based on database entries, inserts it into the database, and saves it to `outputFile`

import { getRankingEntries } from "./shared.js";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const client = await MongoClient.connect(process.env.DB_URI);
const db = client.db(process.env.DB_NAME);

const outputFile = "archive-other/mostGained.json";
const arbitraryMin = { top50: 170, top25: 40, top8: 20, top1: 5 };
const scoreArrays = { top50: [], top25: [], top8: [], top1: [] };
// will skip these players at the given dates, used to fix data for MystExiStentia once (because of unban?)
const ignoredPlayers = { 9413991: ["2022-12-16"], 15787074: ["2023-01-10"] };

const rankingEntries = await getRankingEntries();
for (const entry of rankingEntries) {
  const date = entry._id;

  for (const category in entry) {
    if (category == "_id") continue;

    for (const player of entry[category]) {
      if (ignoredPlayers[player._id]?.includes(date)) continue;
      if (!player.gainedDays && player.gainedScores >= arbitraryMin[category]) {
        scoreArrays[category].push({
          _id: player._id,
          name: player.name,
          country: player.country,
          scores: player.scores,
          gainedScores: player.gainedScores,
          date
        });
      }
    }
  }
}

// sort descending and leave only up to `maxScores` elements
for (const category in scoreArrays) {
  scoreArrays[category].sort((a, b) => (a.gainedScores < b.gainedScores ? 1 : -1));
  scoreArrays[category] = scoreArrays[category].slice(0, process.env.MAX_MOST_GAINED || 99);

  for (const i in scoreArrays[category]) scoreArrays[category][i].rank = Number(i) + 1;

  console.log(
    `Inserting ${scoreArrays[category].length} ${category} entries into 'most-gained' collection...`
  );
  await db.collection("most-gained").insertOne({ _id: category, ranking: scoreArrays[category] });
}

client.close();

console.log(`Writing results to ${outputFile}...`);
fs.writeFileSync(path.join(__dirname, outputFile), JSON.stringify(scoreArrays));
