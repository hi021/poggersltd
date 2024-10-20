// Removes rankings with dates between `minDate` and `maxDate` (inclusive) excluding dates in the `exclude` array

import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

////////////////////////////
const exclude = ["2022-10-09", "2022-10-10", "2022-10-11", "2022-10-12"];
const minDate = "2022-10-01";
const maxDate = "Z";
////////////////////////////

const client = await MongoClient.connect(process.env.DB_URI);
const coll = client.db(process.env.DB_NAME).collection("rankings");
const result = await coll.deleteMany({
  _id: { $gte: minDate, $lte: maxDate, $nin: exclude }
});

console.log(result);
client.close();
