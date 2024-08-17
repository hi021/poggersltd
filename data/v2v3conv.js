// CONVERT ALL JSONS IN V2 FORMAT (old poggers.ltd in react, top 50s only) INTO CURRENT V3.1 FORMAT
// INPUT ./archive-old/ -> OUTPUT ./archive-new/ - overwrites all files and database entries

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import { getDaysBetweenDates } from "./shared.js";
import * as dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// change to POSIX paths to use with glob
const inputDir = path.resolve(__dirname, "archive-old");
const outputDir = path.resolve(__dirname, "archive-new");

try {
  const client = await MongoClient.connect(process.env.DB_URI);
  const playersDatabase = await client
    .db(process.env.DB_NAME)
    .collection("players")
    .find()
    .toArray();

  // load all players from the db into Map<osu! id, player object> to get current names from
  const playersMap = new Map();
  for (const i of playersDatabase) playersMap.set(i._id, i);

  const globFiles = fs.globSync(inputDir + "/*.json").sort();
  const inputDirLen = inputDir.length;
  const inputFileLen = "/2022-01-01".length;
  console.log("Found " + globFiles.length + " file(s)");

  let prevDate = ""; // last read date - used to set gains
  let prevPlayers; // last set convertedPlayersMap - used to set gains
  // read all jsons from archive-old
  for (const i of globFiles) {
    const date = i.slice(inputDirLen + 1, inputDirLen + inputFileLen);
    console.log("Converting " + date);
    const fileJson = JSON.parse(fs.readFileSync(i));
    const convertedPlayersArr = new Array(fileJson.length);

    const dateDiff = prevDate ? getDaysBetweenDates(new Date(date), new Date(prevDate)) : 0;
    if (dateDiff > 1) console.log("Date difference for gains is " + dateDiff);
    const convertedPlayersMap = new Map();

    for (const j in fileJson) {
      const plr = fileJson[j];
      const _id = plr._id;

      // get current name from playersDatabase, otherwise set from read file
      const curName = playersMap.get(_id)?.name;
      const plrConverted = {
        _id,
        name: curName || plr.nam,
        rank: plr.pos,
        country: plr.cntr,
        countryRank: plr.cntrPos,
        scores: plr.t50
      };

      // set gains because older jsons don't have them (can also do with a different script afterwards)
      const prevPlr = prevPlayers?.get(_id);
      if (prevPlr) {
        const prevRank = prevPlr.rank;
        const prevScores = prevPlr.scores;
        plrConverted.gainedRanks = prevRank ? prevRank - plr.pos : undefined; // reversed because (+1 is like 100 -> 99 for ranks)
        plrConverted.gainedScores = prevScores ? plr.t50 - prevScores : undefined;
        if (dateDiff > 1) plrConverted.gainedDays = dateDiff;
      }

      convertedPlayersMap.set(plr._id, plrConverted);
      convertedPlayersArr[j] = plrConverted;
    }

    const convertedFile = { top50: convertedPlayersArr };
    const outPath = path.join(outputDir, date + ".json");
    fs.writeFileSync(outPath, JSON.stringify(convertedFile));

    const coll = client.db(process.env.DB_NAME).collection("rankings");
    const insertRes = await coll.updateOne(
      { _id: date },
      { $set: convertedFile },
      { upsert: true }
    );
    console.log(insertRes);
    console.log("Creating indexes...");
    await coll.createIndexes([
      { key: { "top50._id": -1 } },
      { key: { "top50.rank": 1 } },
      { key: { "top50.country": -1 } },
      { key: { "top50.countryRank": -1 } },
      { key: { "top50.gainedScores": -1 } }
    ]);

    prevDate = date;
    prevPlayers = convertedPlayersMap;
  }

  client.close();
} catch (e) {
  console.error(e);
  process.exit(1);
}
