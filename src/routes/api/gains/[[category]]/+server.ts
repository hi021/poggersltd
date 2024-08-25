import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { SCORE_CATEGORIES } from "$lib/util";
import { dbMostGained } from "$lib/db";

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = params.category || "top50";
  if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
    throw error(400, "Invalid ranking score category");

  console.time("gains/" + scoreCategory);
  try {
    const mostGained = await dbMostGained.findOne({ _id: scoreCategory as any });
    return json(mostGained?.ranking);
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd("gains/" + scoreCategory);
  }
};
