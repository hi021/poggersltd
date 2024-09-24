import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{
  players: App.ComparisonChartPlayer[];
  ranks: { [date: number]: { [ids: string]: any } };
}> => {
  try {
    const resPlayers = await fetch(
      `/api/players/${params.idsOrNames}/${params.category}/${params.dateRange}`
    );
    if (!resPlayers.ok) throw error(resPlayers.status, resPlayers.statusText || "Oopsie");

    const resPlayersJson: App.ComparisonChartAPI = await resPlayers.json();
    const players: App.ComparisonChartPlayer[] = [];
    const ranksObj: { [date: number]: { [plrId: string]: any } } = {};

    for (const i in resPlayersJson) {
      const plr = resPlayersJson[i];
      players.push({ id: i, country: plr.country, name: plr.name, stats: plr.stats });
      for (const chartEntry of plr.ranks) {
        if (!chartEntry) continue;
        const date = new Date(chartEntry.date).valueOf();
        delete chartEntry.date;
        ranksObj[date] = { ...ranksObj[date], [i]: chartEntry };
      }
    }

    const ranksArray = new Array<any>(Object.keys(ranksObj).length);
    let i = 0;
    for (const timestamp in ranksObj) {
      ranksArray[i] = { date: timestamp, ...ranksObj[timestamp] };
      ++i;
    }

    // console.log(players, ranks, ranksArray)
    return { players, ranks: ranksArray.reverse() };
  } catch (e: any) {
    console.error(e);
    throw error(e?.status ?? 500, e?.body?.message ?? "An unknown error has occurred");
  }
};
