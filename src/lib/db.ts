import { DB_URI, DB_NAME } from "$env/static/private";
import { MongoClient } from "mongodb";

export const dbClient = await MongoClient.connect(DB_URI);
export const db = dbClient.db(DB_NAME);
export const dbRankings = db.collection("rankings");
export const dbPlayers = db.collection("players");