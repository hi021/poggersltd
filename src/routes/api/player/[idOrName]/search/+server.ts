// get players ({_id, name} OR type Player with 'full=true' parameter), limit by limit parameter (8 by default)
// by non-exact name, unless 'exact=true' parameter is present
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dbPlayers } from "$lib/db";

export const GET: RequestHandler = async ({ params, url }) => {
  const nameQuery = params.idOrName;
  if (nameQuery?.length < 3) throw error(400, "Name query must be at least 3 characters long");

  const queryParams = url.searchParams;
  const limit = Number(queryParams.get("limit")) || 8;
  const projection = queryParams.get("full") == "true" ? { nameKey: 0 } : { _id: 1, name: 1 };
  const query =
    queryParams.get("exact") == "true"
      ? { name: { $eq: nameQuery } }
      : { $text: { $search: nameQuery } };

  try {
    const players = await dbPlayers.find(query, { projection }).limit(limit).toArray();

    return players?.length ? json(players) : json([]);
  } catch (e) {
    console.error("Failed player search:", e);
    throw error(500, "Internal server error");
  }
};
