// MERGE OLD AND NEW PLAYERS INTO V3 FORMAT TO USE IN PLAYERS COLLECTION
// INPUT ./archive-other/players-old.json & ./archive-other/players-new.json ->
// OUTPUT ./archive-other/players-merged.json

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createNGram } from "./shared.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, "archive-other");

const oldPlayers = JSON.parse(fs.readFileSync(path.join(dir, "players-old.json")));
const newPlayers = JSON.parse(fs.readFileSync(path.join(dir, "players-new.json")));
// resulting Map<id, player>
const mergedPlayers = new Map();

for (const i of newPlayers) mergedPlayers.set(i._id, i);

for (const i of oldPlayers) {
  if (mergedPlayers.has(i._id)) {
    // if already has v3 data - only merge old names
    if (i.oldNam?.length) {
      const plr = mergedPlayers.get(i._id);
      mergedPlayers.set(i._id, {
        ...plr,
        oldName: [...new Set([...(plr.oldName ?? []), ...i.oldNam])]
      });
    }
  } else {
    // convert old player (into App.Player type)
    const plr = {
      _id: i._id,
      name: i.nam,
      country: i.cntr,
      nameKey: createNGram(i.nam),
      top50: {
        date: i.date,
        rank: i.pos,
        countryRank: i.cntrPos,
        scores: i.t50,
        gained: i.g50
        // missing gainedRanks and mostGained - set those with a separate script
      }
    };
    if (i.oldNam?.length) plr.oldName = i.oldNam;

    mergedPlayers.set(i._id, plr);
  }
}

fs.writeFileSync(
  path.join(dir, "players-merged.json"),
  JSON.stringify(Array.from(mergedPlayers.values()))
);
