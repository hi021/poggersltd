// get player (type Player) by id or exact (case sensitive) name
import { getDaysBetweenDates } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dbPlayers, prepareQueryObjectForIdOrName } from "$lib/db";
import { DEFAULT_API_HEADERS, SCORE_CATEGORIES } from "$lib/constants";

const prepareProjection = (category: string) => {
  const projection: { [field: string]: 0 | 1 } = { nameKey: 0 };
  if (category != "all")
    for (const cat of SCORE_CATEGORIES) if (cat != category) projection[cat] = 0;

  return { projection };
};

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const route = `player/${params.idOrName}/${params.category}`;
  console.time(route);
  setHeaders(DEFAULT_API_HEADERS);

  const category = params.category ?? "top50";
  const query = prepareQueryObjectForIdOrName(params.idOrName);

  const player = await dbPlayers.findOne(query, prepareProjection(category));
  if (!player) {
    console.timeEnd(route);
    throw error(404, "User does not exist");
  }
  if (!player[category]) {
    console.timeEnd(route);
    return json(player);
  }

  const playerLastUpdateTimestamp = new Date(player[category].date).valueOf();
  const daysOutdated = getDaysBetweenDates(playerLastUpdateTimestamp);
  if (daysOutdated) player[category].daysOutdated = daysOutdated;

  console.timeEnd(route);
  return json(player);
};
