// works on v3 files with set gains and gainsDays
// needs an up to date players database
// used for setting mostGained, peak, and lowest fields for all ranking categories
// saves the player json and attempts to update the db
// INPUT ./archive-new/ -> OUTPUT ./archive-other/

import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

////////////////////////////
const inputDir = path.resolve(__dirname, "archive-new");
const outputDir = path.resolve(__dirname, "archive-other");
const categoriesSkip = ["top100", "top15"]; // categories not in the db
////////////////////////////

try {
  const client = await MongoClient.connect(process.env.DB_URI);
  const dbPlayers = client.db(process.env.DB_NAME).collection("players");

  const playersDatabase = await dbPlayers.find().toArray();
  const playersMap = new Map();
  for (const i of playersDatabase) playersMap.set(i._id, i);

  const globFiles = fs.globSync(inputDir + "/*.json");
  for (const file of globFiles) {
    const date = path.basename(file, ".json");
    const fileJson = JSON.parse(fs.readFileSync(file));

    for (const category in fileJson) {
      if (categoriesSkip.includes(category)) continue;
      console.log(`Checking ${category} on ${date}`);

      for (const plr of fileJson[category]) {
        const _id = plr._id;
        const plrFromDatabase = playersMap.get(_id);
        if (!plrFromDatabase) {
          console.warn(
            `${plr.name} (${_id}) is in the ranking entry file but not in the database!`
          );
          continue;
        }

        let change = false;
        const plrFromDatabaseCategory = plrFromDatabase[category];
        if (!plrFromDatabaseCategory) continue;

        // only set mostGained for days without gaps for data consistency
        if (plr.gainedScores != null && !plr.gainedDays) {
          if (
            plrFromDatabaseCategory.mostGained?.value == null ||
            plrFromDatabaseCategory.mostGained.value < plr.gainedScores
          ) {
            plrFromDatabaseCategory.mostGained = {
              date,
              value: plr.gainedScores
            };
            change = true;
          }
        }

        // set peak and lowest
        const o = { date, value: plr.value };
        if (
          plrFromDatabaseCategory.peak?.value == null ||
          plrFromDatabaseCategory.peak.value < plr.scores
        ) {
          plrFromDatabaseCategory.peak = o;
          change = true;
        }
        if (
          plrFromDatabaseCategory.lowest?.value == null ||
          plrFromDatabaseCategory.lowest.value > plr.scores
        ) {
          plrFromDatabaseCategory.lowest = o;
          change = true;
        }

        if (change) playersMap.set(_id, plrFromDatabase);
      }
    }
  }

  const playersNew = Array.from(playersMap.values());
  fs.writeFileSync(path.join(outputDir, "players-peaks.json"), JSON.stringify(playersNew));

  const promises = new Array(playersNew.length);
  for (const i in playersNew) {
    promises[i] = new Promise((resolve) =>
      dbPlayers
        .updateOne({ _id: playersNew[i]._id }, { $set: playersNew[i] })
        .then(() => resolve(1))
    );
  }

  await Promise.all(promises);
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  client.close();
}
