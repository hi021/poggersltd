import { DEFAULT_API_HEADERS, formatDate, MIN_DATE, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dbRankings } from "$lib/db";

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const scoreCategory = (params.category as App.RankingCategory) ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, `Invalid date - earliest possible is ${MIN_DATE}`);
  if (date > MAX_DATE) throw error(400, `Invalid date - latest possible is ${MAX_DATE}`);

  const route = `players/${date}`;
  console.time(route);
  setHeaders({ ...DEFAULT_API_HEADERS, "cache-control": "max-age=60" });

  const query: App.RankingQuery = { _id: params.date };

  const ranks = params.ranks ? params.ranks.split("-") : [0, 0];
  const rankMin = Number(ranks[0]) ?? 0;
  const rankMax = Number(ranks[1]) || Infinity;
  if (rankMin > 1 || rankMax < Infinity) query.rank = { $lte: rankMax, $gte: rankMin };

  if (params.country && params.country.toLowerCase() != "all")
    query.country = { $in: params.country.toUpperCase().split(",") };

  const rankingData = await dbRankings.findOne(query, {
    projection: { [scoreCategory]: 1 }
  });

  console.timeEnd(route);
  return json(rankingData?.[scoreCategory] ?? []);
};
