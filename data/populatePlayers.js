// recreates and upserts the `players` collection from scratch
// based on all existing ranking entries from the database

import { CATEGORY_NAMES, createNGram, getRankingEntries } from "./shared.js";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

/**
 * Make `RankingEntry` into `Player` and put it into the big mappy, calculating peak and lowest values
 */
function putPlayerIntoMap(players, player, category, date) {
  if (players.has(player._id)) {
    const playerObject = players.get(player._id);

    playerObject.country = player.country;
    if (playerObject.name != player.name) {
      playerObject.oldNames = playerObject.oldNames
        ? new Set(playerObject.oldNames).add(playerObject.name)
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
    const playerObject /* satisfies Player */ = {
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

/**
 * Set name keys (`nameKey`), convert `oldNames` set into array, and delete blank `gainedDays`
 */
function finalizePlayer(player) {
  const playerObject = { ...player };

  let nameKey = createNGram(player.name);
  if (playerObject.oldNames) {
    playerObject.oldNames = [...playerObject.oldNames];
    for (const name of playerObject.oldNames) nameKey += " " + createNGram(name);
    nameKey = [...new Set(nameKey.split(" "))].join(" ");
  }
  playerObject.nameKey = nameKey;

  for (const category of CATEGORY_NAMES) {
    if (!playerObject[category]) continue;
    if (!playerObject[category].gainedDays || playerObject[category].gainedDays == 1)
      delete playerObject[category].gainedDays;
  }

  return playerObject;
}

async function buildExistingPlayersMap(dbPlayers) {
  const players = new Map();
  const existingPlayers = await dbPlayers.find().toArray();
  for (const player of existingPlayers) players.set(player._id, player);

  return players;
}

export async function populatePlayers(mongoClient = null, rankingEntries = null) {
  // whether ran manually from console as opposed to another script that passes in a shared client
  const useOwnClient = mongoClient == null;
  if (useOwnClient) mongoClient = await MongoClient.connect(process.env.DB_URI);
  const dbPlayers = mongoClient.db(process.env.DB_NAME).collection("players");

  // player map: id => playerObject, either load from db or create from scratch if script ran manually
  const players = rankingEntries ? await buildExistingPlayersMap(dbPlayers) : new Map();
  rankingEntries = rankingEntries ?? (await getRankingEntries());

  for (const entry of rankingEntries) {
    const date = entry._id;
    for (const category in entry) {
      if (category == "_id") continue;
      for (const player of entry[category]) putPlayerIntoMap(players, player, category, date);
    }

    console.log(`${date} - ${players.size} players`);
  }

  console.log("Finalizing and inserting players...");
  for (const id of players.keys()) {
    const player = finalizePlayer(players.get(id));
    await dbPlayers.updateOne({ _id: id }, { $set: player }, { upsert: true });
  }

  console.log("Creating indexes...");
  await dbPlayers.createIndexes([
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

  if (useOwnClient) mongoClient.close();
  console.log("Player data updated ✅");
}

if (process.argv[1] === import.meta.filename) populatePlayers();
