import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<App.Player & Partial<App.PlayerProfileRanks>> => {
  try {
    const resPlayer = await fetch(`/api/player/${params.idOrName}`);
    if (!resPlayer.ok) throw error(resPlayer.status, resPlayer.statusText || "Oopsie");

    const category = params.category ?? "all";
    const resPlayerJson: App.PlayerAPI = await resPlayer.json();
    if (category === "all") return resPlayerJson;

    const resRanks = await fetch(`/api/player/${resPlayerJson._id}/ranks/${category}`);
    const resRanksJson: App.PlayerProfileRanks = await resRanks.json();

    return { ...resPlayerJson, ...resRanksJson };
  } catch (e: any) {
    console.error(e);
    throw error(e?.status ?? 500, e?.body?.message ?? "An unknown error has occurred");
  }
};
