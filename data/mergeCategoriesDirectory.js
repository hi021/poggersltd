// Merges a directory of separate json files for every ranking category into one
// e.g. 2024-01-01/top50.json, top25.json, top8.json, top1.json into 2024-01-01.json
// INPUT ./archive-premerge/ -> OUTPUT ./archive-merged/

import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

////////////////////////////
const INPUT_DIR = path.resolve(__dirname, "archive-premerge");
const OUTPUT_DIR = path.resolve(__dirname, "archive-merged");
////////////////////////////

const directories = fs.readdirSync(INPUT_DIR);
for (const date of directories) {
  const rankingEntryFull = {};
  const directory = path.resolve(INPUT_DIR, date);
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const category = path.basename(file, ".json");
    rankingEntryFull[category] = JSON.parse(fs.readFileSync(path.resolve(directory, file)));
  }

  const outputFile = path.resolve(OUTPUT_DIR, date + ".json");
  fs.writeFileSync(outputFile, JSON.stringify(rankingEntryFull));
  console.log(`Merged ${date} with categories: ${Object.keys(rankingEntryFull).join(", ")}`);
}
