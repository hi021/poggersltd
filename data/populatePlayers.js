// Recreates and upserts the `players` collection from scratch based on all existing ranking entries from the database

import { categoriesDb, createNGram, getRankingEntries } from "./shared.js";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const client = await MongoClient.connect(process.env.DB_URI);
const collPlayers = client.db(process.env.DB_NAME).collection("players");
const rankingEntries = await getRankingEntries();
const players = new Map(); // id => playerObject

// make RankingEntry into Player and put it into the big mappy
function putPlayerIntoMap(player, category, date) {
  if (players.has(player._id)) {
    const playerObject = players.get(player._id);

    playerObject.country = player.country;
    if (playerObject.name != player.name) {
      playerObject.oldNames = playerObject.oldNames
        ? playerObject.oldNames.add(playerObject.name)
        : new Set([playerObject.name]);
      playerObject.name = player.name;
    }

    playerObject[category] = {
      ...playerObject[category],
      rank: player.rank,
      scores: player.scores,
      countryRank: player.countryRank,
      gainedScores: player.gainedScores,
      gainedRanks: player.gainedRanks,
      gainedDays: player.gainedDays,
      date
    };

    if (!playerObject[category].peak || playerObject[category].peak.scores < player.scores)
      playerObject[category].peak = { date, scores: player.scores };
    if (!playerObject[category].lowest || playerObject[category].lowest.scores > player.scores)
      playerObject[category].lowest = { date, scores: player.scores };
    if (
      (!player.gainedDays || player.gainedDays == 1) &&
      player.gainedScores &&
      (!playerObject[category].mostGained ||
        playerObject[category].mostGained.scores < player.gainedScores)
    ) {
      playerObject[category].mostGained = { date, scores: player.gainedScores };
    }

    players.set(player._id, playerObject);
  } else {
    const peak = { date, scores: player.scores };
    const playerObject /* type Player */ = {
      _id: player._id,
      name: player.name,
      country: player.country,
      [category]: {
        rank: player.rank,
        scores: player.scores,
        countryRank: player.countryRank,
        gainedScores: player.gainedScores,
        gainedRanks: player.gainedRanks,
        peak,
        lowest: peak,
        date
      }
    };
    if (player.gainedDays) playerObject[category].gainedDays = player.gainedDays;
    else if (player.gainedScores)
      playerObject[category].mostGained = { date, scores: player.gainedScores };

    players.set(player._id, playerObject);
  }
}

// set name keys, turn oldNames set into array, and delete blank gainedDays
function finalizePlayer(player) {
  const playerObject = { ...player, nameKey: createNGram(player.name) };

  if (playerObject.oldNames) playerObject.oldNames = [...playerObject.oldNames];
  for (const category of categoriesDb) {
    if (!playerObject[category]) continue;
    if (!playerObject[category].gainedDays || playerObject[category].gainedDays == 1)
      delete playerObject[category].gainedDays;
  }

  return playerObject;
}

for (const entry of rankingEntries) {
  const date = entry._id;
  for (const category in entry) {
    if (category == "_id") continue;
    for (const player of entry[category]) {
      putPlayerIntoMap(player, category, date);
    }
  }

  console.log(`${date} - ${players.size} players`);
}

console.log("Finalizing and inserting players...");
for (const id of players.keys()) {
  const player = finalizePlayer(players.get(id));
  await collPlayers.updateOne({ _id: id }, { $set: player }, { upsert: true });
}

console.log("Creating indexes...");
await collPlayers.createIndexes([
  {
    key: { nameKey: "text" },
    defaultLanguage: "english"
  },
  { key: { country: -1 } },
  { key: { "top50.rank": 1 } },
  { key: { "top50.countryRank": 1 } },
  { key: { "top25.rank": 1 } },
  { key: { "top25.countryRank": 1 } },
  { key: { "top8.rank": 1 } },
  { key: { "top8.countryRank": 1 } },
  { key: { "top1.rank": 1 } },
  { key: { "top1.countryRank": 1 } }
]);

client.close();
