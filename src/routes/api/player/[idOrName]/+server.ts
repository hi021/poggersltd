// get player (type Player) by id or exact (case sensitive) name
import { getDaysBetweenDates, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dbPlayers } from "$lib/db";

export const GET: RequestHandler = async ({ params }) => {
  console.time("player/" + params.idOrName);
  const idOrNameNumber = parseInt(params.idOrName);

  try {
    const query = isNaN(idOrNameNumber)
      ? { name: params.idOrName }
      : { _id: idOrNameNumber as any };
    const player = await dbPlayers.findOne(query, { projection: { nameKey: 0 } });
    if (!player) {
      console.timeEnd("player/" + params.idOrName);
      throw error(404, "User does not exist");
    }

    for (const category in player) {
      if (!SCORE_CATEGORIES.includes(category as App.RankingCategory)) continue;
      const playerLastUpdateTimestamp = new Date(player[category].date).valueOf();
      const daysOutdated = getDaysBetweenDates(playerLastUpdateTimestamp);
      if (daysOutdated) player[category].daysOutdated = daysOutdated;
    }
    return json(player);
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd("player/" + params.idOrName);
  }
};
