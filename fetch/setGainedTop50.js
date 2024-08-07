// works on converted files (v3)
// gets all jsons in order and sets gainedScores, gainedRanks, and gainedDays fields but ONLY ON TOP50
// saves all jsons and attempts to add them to the db
// was used to fix gains not being set properly on days between v2 and v3

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { getDaysBetweenDates } from "./shared.js";
import * as dotenv from "dotenv";
import glob from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const inputDir = path.resolve(__dirname, "archive").replace(/\\/g, "/");
const outputDir = path.resolve(__dirname, "archive-aftergains");

try {
  const client = await MongoClient.connect(process.env.DB_URI);

  const globDirectories = glob.sync(inputDir + "\\*.json");
  const inputDirLen = inputDir.length;

  let prevDate = "";
  let prevPlayers;

  for (const i of globDirectories) {
    const date = i.slice(inputDirLen + 1, inputDirLen + "2022-01-01".length + 1); //inputDirLen + 1 because of the slash
    console.log("Converting " + date);
    const fileJson = JSON.parse(fs.readFileSync(i));
    const fileConverted = new Array(fileJson.length);

    const dateDiff = prevDate ? getDaysBetweenDates(new Date(date), new Date(prevDate)) : 0;
    if (dateDiff > 1) console.log("Date difference for gains is " + dateDiff);
    const players = new Map();

    for (const j in fileJson) {
      const plr = fileJson[j];
      const _id = plr._id;

      //set gains
      const prevPlr = prevPlayers?.get(_id);
      if (prevPlr) {
        const prevScores = prevPlr.scores;
        const prevRank = prevPlr.rank;

        plr.gainedScores = prevScores ? plr.scores - prevScores : undefined;
        plr.gainedRank = prevRank ? prevRank - plr.rank : undefined; //reversed because (+1 is 100 -> 99 etc.)
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
