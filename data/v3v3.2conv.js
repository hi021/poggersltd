// example of a v3 player: {"_id":7162035,"name":"[-Griffin-]","rank":1,"country":"US","countryRank":1,"value":6364,"gained":2,"gainedRank":0,"gainedDays":2}
// example of a v3.2 player: {"_id":9217626,"name":"Maklovitz","rank":1,"country":"PL","countryRank":1,"scores":51943,"gainedScores":16,"gainedRanks":0,"gainedDays":2}
// This script converts old 2022/23 json files (merged with mergeCategoriesDirectory.js) to v3.2 and saves them to the output directory
// INPUT ./archive-merged/ -> OUTPUT ./archive-new/

import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

////////////////////////////
const inputDir = path.resolve(__dirname, "archive-merged");
const outputDir = path.resolve(__dirname, "archive-new");
////////////////////////////

const globFiles = fs.globSync(inputDir + "/*.json").sort();
console.log(`Found ${globFiles.length} file(s)`);

for (const file of globFiles) {
  const date = path.basename(file, ".json");
  console.log(`Converting ${date}...`);

  const convertedFile = {};
  const fileJson = JSON.parse(fs.readFileSync(file));

  for (const category in fileJson) {
    const convertedPlayersArr = new Array(fileJson[category].length);

    for (const i in fileJson[category]) {
      const plr = fileJson[category][i];
      const plrConverted = {
        _id: plr._id,
        name: plr.name,
        rank: plr.rank,
        country: plr.country,
        countryRank: plr.countryRank,
        scores: plr.value
      };
      if (plr.gained != null) plrConverted.gainedScores = plr.gained;
      if (plr.gainedRank != null) plrConverted.gainedRanks = plr.gainedRank;
      if (plr.gainedDays != null && plr.gainedDays > 1) plrConverted.gainedDays = plr.gainedDays;

      convertedPlayersArr[i] = plrConverted;
    }
    convertedFile[category] = convertedPlayersArr;
  }

  const outPath = path.join(outputDir, date + ".json");
  fs.writeFileSync(outPath, JSON.stringify(convertedFile));
}
