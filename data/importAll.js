// Imports all ranking entry json files from the input directory into the database, upserting existing entries depending on the parameter
// INPUT ./archive-new/

import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

////////////////////////////
const inputDir = path.resolve(__dirname, "archive-new");
const categoriesSkip = ["top100", "top15"]; // categories not in the db
const upsert = true;
////////////////////////////

const client = await MongoClient.connect(process.env.DB_URI);
const dbRankings = client.db(process.env.DB_NAME).collection("rankings");

const globFiles = fs.globSync(inputDir + "/*.json");
for (const file of globFiles) {
  const date = path.basename(file, ".json");
  console.log(`Importing ${date}...`);
  let categoryCount = 0;
  let playerCount = 0;

  const fileJson = JSON.parse(fs.readFileSync(file));
  for (const category in fileJson) {
    if (categoriesSkip.includes(category)) continue;
    await dbRankings.updateOne(
      { _id: date },
      { $set: { [category]: fileJson[category] } },
      { upsert }
    );
    playerCount += fileJson[category].length;
    ++categoryCount;
  }
  console.log(`Categories: ${categoryCount}, players: ${playerCount}`);
}

client.close();
