import { DB_URI, DB_NAME } from "$env/static/private";
import { MongoClient } from "mongodb";

const dbClient = await MongoClient.connect(DB_URI);
export const db = dbClient.db(DB_NAME);
export const dbRankings = db.collection("rankings");
export const dbPlayers = db.collection("players");
export const dbMostGained = db.collection("most-gained");
export const dbMisc = db.collection("misc");

export function prepareQueryObjectForIdOrName(idOrName: string | number) {
  const idOrNameNumber = parseInt(idOrName as string);
  return isNaN(idOrNameNumber) ? { name: idOrName as string } : { _id: idOrNameNumber as any };
}

export function prepareAggregationProjectionForIdOrName(
  idOrName: string,
  scoreCategory: App.RankingCategory
) {
  const playerId = parseInt(idOrName);
  const project = {
    $project: {
      [scoreCategory]: {
        $filter: {
          input: "$" + scoreCategory,
          as: "cat",
          cond: {
            $eq: isNaN(playerId) ? ["$$cat.name", idOrName] : ["$$cat._id", playerId]
          }
        }
      }
    }
  };

  return project;
}

export function prepareQueryObjectForRankRange(ranksParam?: string) {
  const ranks = ranksParam ? ranksParam.split("-") : [0, 0];
  const rankMin = Number(ranks[0]) ?? 0;
  const rankMax = Number(ranks[1]) || Infinity;

  if (rankMin > 1 || rankMax < Infinity) return { $lte: rankMax, $gte: rankMin };
}

export function prepareQueryObjectForCountryCodes(countriesParam?: string) {
  if (countriesParam && countriesParam.toLowerCase() != "all")
    return { $in: countriesParam.toUpperCase().split(",") };
}
