// Creates the most-gained ranking based on database entries, upserts it in the database, and saves it to `outputFile`

import { compareByGivenFieldDescendingOrId, getRankingEntries } from "./shared.js";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

////////////////////////////
const outputFile = "archive-other/most-gained.json";
const arbitraryMin = { top50: 175, top25: 50, top8: 25, top1: 9 };
// will skip these players at the given dates, used to fix data for MystExiStentia once (because of unban?)
const ignoredPlayers = { 9413991: ["2022-12-16"], 15787074: ["2023-01-10"] };
////////////////////////////

function getMostGainedPlayerForCategory(scoreArrays, category) {
  const player = scoreArrays[category][0];
  return {
    id: player._id,
    name: player.name,
    gainedScores: player.gainedScores,
    scores: player.scores
  };
}

export async function setMostGainedRanking(mongoClient = null) {
  const useOwnClient = mongoClient == null;
  if (useOwnClient) mongoClient = await MongoClient.connect(process.env.DB_URI);

  const scoreArrays = { top50: [], top25: [], top8: [], top1: [] };
  const rankingEntries = await getRankingEntries();
  for (const entry of rankingEntries) {
    const date = entry._id;

    for (const category in entry) {
      if (category == "_id") continue;

      for (const player of entry[category]) {
        if (
          ignoredPlayers[player._id]?.includes(date) ||
          player.gainedDays > 1 ||
          player.gainedScores < arbitraryMin[category]
        )
          continue;

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

  const mostGainedPerCategory = {};
  // sort descending and leave only up to `maxScores` elements
  for (const category in scoreArrays) {
    const maxScores = Number(process.env.MAX_GAINED_RANKING_SIZE) || 99;
    scoreArrays[category].sort((a, b) => compareByGivenFieldDescendingOrId(a, b, "gainedScores"));
    scoreArrays[category] = scoreArrays[category].slice(0, maxScores);

    for (const i in scoreArrays[category]) scoreArrays[category][i].rank = Number(i) + 1;
    const mostGainedPlayer = getMostGainedPlayerForCategory(scoreArrays, category);
    mostGainedPerCategory[category] = mostGainedPlayer;

    console.log(
      `Inserting ${scoreArrays[category].length} ${category} entries into 'most-gained' collection...`
    );
    console.log(`Most gained ${mostGainedPlayer.gainedScores} by ${mostGainedPlayer.name}`);
    await db
      .collection("most-gained")
      .updateOne({ _id: category }, { $set: { ranking: scoreArrays[category] } }, { upsert: true });
  }

  if (useOwnClient) mongoClient.close();

  console.log(`Writing results to ${outputFile}...`);
  fs.writeFileSync(path.join(__dirname, outputFile), JSON.stringify(scoreArrays));
  console.log("Most gained ranking updated ✅");
  return mostGainedPerCategory;
}

if (process.argv[1] === import.meta.filename) setMostGainedRanking();
