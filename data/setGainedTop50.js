// works on converted files (v3)
// gets all json files in order and sets `gainedScores`, `gainedRanks`, and `gainedDays` fields but ONLY ON TOP50! :(
// saves all json files and attempts to add them to the db
// used to fix gains not being set properly on days between v2 and v3
// INPUT ./archive-new/ -> OUTPUT ./archive-aftergains/

import { getDaysBetweenDates } from "./shared.js";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

////////////////////////////
const inputDir = path.resolve(__dirname, "archive-new");
const outputDir = path.resolve(__dirname, "archive-aftergains");
////////////////////////////

try {
  const client = await MongoClient.connect(process.env.DB_URI);

  const globDirectories = fs.globSync(inputDir + "/*.json");
  const inputDirLen = inputDir.length + 1; // count the slash

  let prevDate = "";
  let prevPlayers;

  for (const i of globDirectories) {
    const date = i.slice(inputDirLen, inputDirLen + "2022-01-01".length);
    console.log(`Converting ${date}...`);
    const fileJson = JSON.parse(fs.readFileSync(i));
    const fileConverted = new Array(fileJson.length);

    const dateDiff = prevDate ? getDaysBetweenDates(new Date(date), new Date(prevDate)) : 0;
    if (dateDiff > 1) console.log(`${dateDiff} day difference between entries, setting gainedDays`);
    const players = new Map();

    for (const j in fileJson) {
      const plr = fileJson[j];
      const _id = plr._id;

      // set gains
      const prevPlr = prevPlayers?.get(_id);
      if (prevPlr) {
        const prevScores = prevPlr.scores;
        const prevRank = prevPlr.rank;

        plr.gainedScores = prevScores ? plr.scores - prevScores : undefined;
        plr.gainedRank = prevRank ? prevRank - plr.rank : undefined; // reversed because (+1 is 100 -> 99 etc.)
        if (dateDiff > 1) plr.gainedDays = dateDiff;
      }

      players.set(plr._id, plr);
      fileConverted[j] = plr;
    }

    const outputPath = path.join(outputDir, date);
    if (fs.existsSync(outputPath)) console.log("Directory exists, skipping writing");
    else {
      fs.mkdirSync(outputPath);
      fs.writeFileSync(
        path.join(outputPath, date + ".json"),
        JSON.stringify({ top50: fileConverted })
      );
    }

    const coll = client.db(process.env.DB_NAME).collection("rankings");
    const insertRes = await coll.updateOne(
      { _id: date },
      { $set: { top50: fileConverted } },
      { $upsert: true }
    );
    console.log(insertRes);
    await coll.createIndexes([
      { key: { "top50._id": -1 } },
      { key: { "top50.rank": 1 } },
      { key: { "top50.country": -1 } },
      { key: { "top50.countryRank": -1 } },
      { key: { "top50.gainedScores": -1 } }
    ]);

    prevDate = date;
    prevPlayers = players;
  }

  client.close();
} catch (e) {
  console.error(e);
  process.exit(1);
}
