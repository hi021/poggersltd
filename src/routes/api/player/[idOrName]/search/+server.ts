// get players ({_id, name} OR of type Player using the 'full=true' parameter),
// limit using the 'limit' parameter (8 by default),
// search by non-exact name, unless the 'exact=true' parameter is present
import { DEFAULT_API_HEADERS } from "$lib/constants";
import { error, json } from "@sveltejs/kit";
import { dbPlayers } from "$lib/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, url, setHeaders }) => {
  setHeaders(DEFAULT_API_HEADERS);
  const nameQuery = params.idOrName;
  if (nameQuery?.length < 3) throw error(400, "Name query must be at least 3 characters long");

  const queryParams = url.searchParams;
  const limit = Number(queryParams.get("limit")) || 8;
  const projection = queryParams.get("full") == "true" ? { nameKey: 0 } : { _id: 1, name: 1 };
  const query =
    queryParams.get("exact") == "true"
      ? { name: { $eq: nameQuery } }
      : { $text: { $search: nameQuery } };

  const players = await dbPlayers.find(query, { projection }).limit(limit).toArray();
  return players?.length ? json(players) : json([]);
};
