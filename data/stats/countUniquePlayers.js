// returns an object: {id: {name, country}}
// used for osu! wrapped stats

import { getRankingEntries } from "../shared.js";
import fs from "fs";

const startDate = "2024-01-01";
const endDate = "2024-12-31";
const categories = ["top50"];
const outputDir = "./results/unique-players.json";

const players = new Map();
const rankingEntries = await getRankingEntries(startDate, endDate);

for (const entry of rankingEntries) {
  const date = entry._id;
  console.log("Getting players for " + date);

  for (const cat of categories) {
    if (!entry[cat]?.length) continue;

    for (const i in entry[cat]) {
      const plr = entry[cat][i];
      players.set(plr._id, { name: plr.name, country: plr.country });
    }
  }
}

console.log(`Counted ${players.size} unique players`);
if (outputDir) {
  fs.writeFileSync(outputDir, JSON.stringify(Object.fromEntries(players)));
  console.log("Saved output to " + outputDir);
} else console.log(players);
