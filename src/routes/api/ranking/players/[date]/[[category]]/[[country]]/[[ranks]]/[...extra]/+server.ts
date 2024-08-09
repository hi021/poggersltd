import { dbRankings } from "$lib/db";
import { formatDate, MIN_DATE, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = params.category ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, "Invalid date: earliest is " + MIN_DATE);
  if (date > MAX_DATE) throw error(400, "Invalid date: latest is " + MAX_DATE);

  try {
    console.time("players/" + date);

    const ranks = params.ranks ? params.ranks.split("-") : [0, 0];
    const rankMin = Number(ranks[0]) ?? 0;
    const rankMax = Number(ranks[1]) || Infinity;

    const query: App.RankingQuery = { _id: params.date };

    if (rankMin > 1 || rankMax < Infinity) query.rank = { $lte: rankMax, $gte: rankMin };
    // all country codes should always be two uppercase letters
    if (params.country?.length == 2) query.country = { $eq: params.country };

    const rankingData = await dbRankings.findOne(query, {
      projection: { [scoreCategory]: 1 }
    });
    return json(rankingData?.[scoreCategory] ?? []);
  } catch (e: any) {
    console.error(e);
    throw error(500, e?.message || "Internal server error");
  } finally {
    console.timeEnd("players/" + date);
  }
};
