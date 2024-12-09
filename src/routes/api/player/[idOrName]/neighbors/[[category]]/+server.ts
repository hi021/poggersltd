import { dbPlayers, prepareQueryObjectForIdOrName } from "$lib/db";
import { DEFAULT_API_HEADERS, SCORE_CATEGORIES } from "$lib/util";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const route = `player/${params.idOrName}/neighbors/${params.category ?? ""}`;
  console.time(route);
  setHeaders(DEFAULT_API_HEADERS);

  const scoreCategory = (params.category as App.RankingCategory) || "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) {
    console.timeEnd(route);
    throw error(400, "Invalid ranking score category");
  }

  const query = prepareQueryObjectForIdOrName(params.idOrName);
  const categoryRankField = `${scoreCategory}.rank`;
  const player = (await dbPlayers.findOne(query, {
    projection: { [categoryRankField]: 1 }
  })) as unknown as App.PlayerAPI;
  const playerRank = player?.[scoreCategory]?.rank;
  if (!playerRank) {
    console.timeEnd(route);
    throw error(404, "User does not exist or has no data for given category");
  }

  const neighborRanks = playerRank == 1 ? [2, 3] : [playerRank - 1, playerRank + 1];
  const neighborIdObjects = await dbPlayers
    .find({ [categoryRankField]: { $in: neighborRanks } }, { projection: { _id: 1 } })
    .toArray();
  const neighborIds = [neighborIdObjects[0]?._id, neighborIdObjects[1]?._id];

  console.timeEnd(route);
  return json(neighborIds);
};
