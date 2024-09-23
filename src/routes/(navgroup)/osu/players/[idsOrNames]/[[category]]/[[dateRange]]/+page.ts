import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{ players: App.PlayerChartRanksWeb[] }> => {
  try {
    const resPlayers = await fetch(
      `/api/players/${params.idsOrNames}/${params.category}/${params.dateRange}`
    );
    if (!resPlayers.ok) throw error(resPlayers.status, resPlayers.statusText || "Oopsie");

    const resPlayersJson: App.PlayerChartRanks = await resPlayers.json();
    const playersArray: Array<App.PlayerChartRanksWeb> = [];

    for (const i in resPlayersJson) playersArray.push({ id: i, ...resPlayersJson[i] });

    return { players: playersArray };
  } catch (e: any) {
    console.error(e);
    throw error(e?.status ?? 500, e?.body?.message ?? "An unknown error has occurred");
  }
};
