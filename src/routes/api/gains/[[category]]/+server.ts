import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { DEFAULT_API_HEADERS, SCORE_CATEGORIES } from "$lib/util";
import { dbMostGained } from "$lib/db";

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const scoreCategory = (params.category || "top50") as App.RankingCategory;
  if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
    throw error(400, "Invalid ranking score category");

  const route = "gains/" + scoreCategory
  console.time(route);
setHeaders(DEFAULT_API_HEADERS)

  try {
    const mostGained = await dbMostGained.findOne({ _id: scoreCategory as any });
    return json(mostGained?.ranking);
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd(route);
  }
};
