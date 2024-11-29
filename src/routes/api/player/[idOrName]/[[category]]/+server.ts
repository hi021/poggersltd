// get player (type Player) by id or exact (case sensitive) name
import { DEFAULT_API_HEADERS, getDaysBetweenDates, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dbPlayers } from "$lib/db";

const prepareProjection = (category: string) => {
  const projection: { [field: string]: 0 | 1 } = { nameKey: 0 };
  for (const cat of SCORE_CATEGORIES) if (cat != category) projection[cat] = 0;

  return { projection };
};

export const GET: RequestHandler = async ({ params, setHeaders }) => {
    const route = `player/${params.idOrName}`;
    console.time(route);
  setHeaders(DEFAULT_API_HEADERS);

  const idOrNameNumber = parseInt(params.idOrName);
  const category = params.category ?? "top50";
    const query = isNaN(idOrNameNumber)
      ? { name: params.idOrName }
      : { _id: idOrNameNumber as any };

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
