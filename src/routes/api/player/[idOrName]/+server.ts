import { error } from "@sveltejs/kit";
import { DB_URI, DB_NAME } from "$env/static/private";
import { MongoClient } from "mongodb";
import type { RequestHandler } from "./$types";

//get player (type Player) by id or (exact) name
export const GET: RequestHandler = async ({ params }) => {
  const idOrNameNumber = parseInt(params.idOrName);

  console.time("player/" + params.idOrName);

  const client = await MongoClient.connect(DB_URI);
  const coll = client.db(DB_NAME).collection("players");

  try {
    if (!isNaN(idOrNameNumber)) {
      //look by id
      const res = await coll.findOne({ _id: idOrNameNumber }, { projection: { nameKey: 0 } });
      if (res) return new Response(JSON.stringify(res));
    }
    //look by name
    const res = await coll.findOne({ name: params.idOrName }, { projection: { nameKey: 0 } });
    if (res) return new Response(JSON.stringify(res));
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd("player/" + params.idOrName);
  }

  throw error(400, "User does not exist");
};
