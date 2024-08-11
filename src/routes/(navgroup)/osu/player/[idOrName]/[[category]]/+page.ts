import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    const resPlayer = await fetch(`/api/player/${params.idOrName}`);
    if (!resPlayer.ok) {
      if (resPlayer.status == 400) return null;
      throw error(resPlayer.status, resPlayer.statusText || "Oopsie");
    }
    const category = params.category ?? "all";
    const resPlayerJson = await resPlayer.json();

    if (category === "all") return resPlayerJson;

    const rankDays = 90;
    const resRanks = await fetch(`/api/player/${resPlayerJson._id}/ranks/${category}/${rankDays}`);
    const resRanksJson = await resRanks.json();

    return {
      ...resPlayerJson,
      ranks: resRanksJson.ranks,
      rankStats: resRanksJson.rankStats
    };
  } catch (e: any) {
    console.error(e);
    throw error(e?.status ?? 500, e?.body?.message ?? "An unknown error has occurred");
  }
};
