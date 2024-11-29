import { error, json, type RequestHandler } from "@sveltejs/kit";
import { dbMisc } from "$lib/db";

export const GET: RequestHandler = async () => {
    const route = "socket/"
    console.time(route);

  try {
    const senkos = (await dbMisc.findOne({ _id: "senkos" as any })) as Record<string, number>;
    delete senkos?._id;
    return json(senkos);
  } catch (e: any) {
    console.error(e);
    throw error(500, e?.message || "Internal server error");
  } finally {
    console.timeEnd(route);
  }
};
