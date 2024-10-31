// get player (type Player) by id or exact (case sensitive) name
import { getDaysBetweenDates, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dbPlayers } from "$lib/db";

const prepareProjection = (category: string) => {
  const projection: { [field: string]: 0 | 1 } = { nameKey: 0 };
  for (const cat of SCORE_CATEGORIES) if (cat != category) projection[cat] = 0;

  return { projection };
};

export const GET: RequestHandler = async ({ params }) => {
  console.time("player/" + params.idOrName);
  const idOrNameNumber = parseInt(params.idOrName);
  const category = params.category ?? "top50";

  try {
    const query = isNaN(idOrNameNumber)
      ? { name: params.idOrName }
      : { _id: idOrNameNumber as any };
    const player = await dbPlayers.findOne(query, prepareProjection(category));

    if (!player) {
      console.timeEnd("player/" + params.idOrName);
      throw error(404, "User does not exist");
    }
    if (!player[category]) {
      console.timeEnd("player/" + params.idOrName);
      return json(player);
    }

    const playerLastUpdateTimestamp = new Date(player[category].date).valueOf();
    const daysOutdated = getDaysBetweenDates(playerLastUpdateTimestamp);
    if (daysOutdated) player[category].daysOutdated = daysOutdated;

    return json(player);
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd("player/" + params.idOrName);
  }
};
