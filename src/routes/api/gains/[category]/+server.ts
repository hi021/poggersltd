import { error } from "@sveltejs/kit";
import { DB_URI, DB_NAME } from "$env/static/private";
import { MongoClient } from "mongodb";
import type { RequestHandler } from "./$types";
import { SCORE_CATEGORIES } from "$lib/util";

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = params.category;
  if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
    throw error(400, "Invalid ranking score category");

  // TODO
  console.time("gains/" + scoreCategory);
  try {
    const client = await MongoClient.connect(DB_URI);
    const res = JSON.stringify(
      await client
        .db(DB_NAME)
        .collection("most-gained-" + scoreCategory)
        .find()
        .toArray()
    );

    return new Response(res);
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd("gains/" + scoreCategory);
  }
};
