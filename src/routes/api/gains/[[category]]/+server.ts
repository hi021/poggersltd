import type { RequestHandler } from "./$types";
import { DEFAULT_API_HEADERS, SCORE_CATEGORIES } from "$lib/util";
import { dbMostGained } from "$lib/db";
import { error, json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const scoreCategory = (params.category || "top50") as App.RankingCategory;
  if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
    throw error(400, "Invalid ranking score category");

  const route = "gains/" + scoreCategory;
  console.time(route);
  setHeaders(DEFAULT_API_HEADERS);

  const mostGained = await dbMostGained.findOne({ _id: scoreCategory as any });
  console.timeEnd(route);
  return json(mostGained?.ranking);
};
