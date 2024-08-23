// get player (type Player) by id or exact (case sensitive) name
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { dbPlayers } from "$lib/db";

export const GET: RequestHandler = async ({ params }) => {
  const idOrNameNumber = parseInt(params.idOrName);

  console.time("player/" + params.idOrName);
  try {
    if (!isNaN(idOrNameNumber)) {
      // look by id
      const player = await dbPlayers.findOne(
        { _id: idOrNameNumber as any },
        { projection: { nameKey: 0 } }
      );
      if (player) return json(player);
    }
    // look by name
    const player = await dbPlayers.findOne(
      { name: params.idOrName },
      { projection: { nameKey: 0 } }
    );
    if (player) return json(player);
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd("player/" + params.idOrName);
  }

  throw error(400, "User does not exist");
};
