import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dbPlayers } from "$lib/db";

//get player (type Player OR just osu! id and exact name - depending on parameter) by non-exact name
export const GET: RequestHandler = async ({ params, url }) => {
  const nameQuery = params.idOrName;
  if (!nameQuery || nameQuery.length < 3)
    throw error(400, "Name query must be at least 3 characters long");

  const queryParams = url.searchParams;
  const limit = Number(queryParams.get("limit")) || 8;
  const projection = queryParams.get("full") ? { nameKey: 0 } : { _id: 1, name: 1 };

  try {
    const res = await dbPlayers
      .find({ $text: { $search: nameQuery } }, { projection })
      .limit(limit)
      .toArray();

    if (!res?.length) return json([]);
    return json(res);
  } catch (e) {
    console.error("Failed to search for player:", e);
    throw error(500, "Internal server error");
  }
};
