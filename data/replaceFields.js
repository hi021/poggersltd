// Swaps `fieldOld` field in all ranking entries with `fieldNew`

import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

////////////////////////////
const fieldNew = "_id"; // to replace fieldOld with
const fieldOld = "id";
////////////////////////////

const client = await MongoClient.connect(process.env.DB_URI);
const dbRankings = client.db(process.env.DB_NAME).collection("rankings");
const rankingEntries = await dbRankings.find().toArray();
const promises = [];

for (const day in rankingEntries) {
  promises.push(
    new Promise((resolve) => {
      const date = rankingEntries[day]._id;
      console.log(`Replacing field '${fieldOld}' on ${date}`);

      for (const cat in rankingEntries[day]) {
        if (cat == "_id") continue;

        const categoryEntries = rankingEntries[day][cat];
        // swap field names for every player in the category for that day
        for (const i in categoryEntries) {
          const value = categoryEntries[i][fieldOld];
          delete categoryEntries[i][fieldOld];

          categoryEntries[i][fieldNew] = value;
        }
      }

      dbRankings
        .deleteOne({ _id: date })
        .then(() => dbRankings.insertOne({ _id: date, ...rankingEntries[day] }))
        .then((res) => resolve(res));
    })
  );
}

try {
  await Promise.all(promises);
} catch (e) {
  console.error(e);
} finally {
  client.close();
}
