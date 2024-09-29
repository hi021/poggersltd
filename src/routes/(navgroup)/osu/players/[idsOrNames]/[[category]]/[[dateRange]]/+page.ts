import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";
import { CHART_COLORS } from "$lib/util";

type RanksObj = Omit<App.ComparisonChartEntry, "date">;
type Players = Array<
  App.ComparisonChartPlayer & { color?: string; rankVisible?: boolean; scoreVisible?: boolean }
>;

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{
  players: Players;
  ranks: Array<{ date: string; players: { [plrId: string]: RanksObj } }>;
}> => {
  try {
    const resPlayers = await fetch(
      `/api/players/${params.idsOrNames}/${params.category}/${params.dateRange}`
    );
    if (!resPlayers.ok) throw error(resPlayers.status, resPlayers.statusText || "Oopsie");

    const resPlayersJson: App.ComparisonChartAPI = await resPlayers.json();
    const players: Players = [];
    const ranksObj: { [date: number]: { [plrId: string]: RanksObj } } = {};

    let colorIndex = 0;
    const rankVisible = Object.keys(resPlayersJson).length <= 3;
    for (const i in resPlayersJson) {
      const plr = resPlayersJson[i];
      const color = CHART_COLORS[colorIndex]; // score line color

      players.push({
        id: i,
        country: plr.country,
        name: plr.name,
        stats: plr.stats,
        color,
        rankVisible
      });
      for (const chartEntry of plr.ranks) {
        if (!chartEntry) continue;
        const date = new Date(chartEntry.date).valueOf();
        ranksObj[date] = { ...ranksObj[date], [i]: chartEntry };
        delete (ranksObj[date][i] as RanksObj & { date?: string }).date;
      }

      colorIndex = (colorIndex + 1) % CHART_COLORS.length;
    }

    const ranksArray = new Array<{ date: string; players: { [plrId: string]: RanksObj } }>(
      Object.keys(ranksObj).length
    );
    let i = 0;
    for (const timestamp in ranksObj) {
      ranksArray[i] = { date: timestamp, players: ranksObj[timestamp] };
      ++i;
    }

    return { players, ranks: ranksArray.sort((a, b) => a.date < b.date ? -1 : 1) };
  } catch (e: any) {
    console.error(e);
    throw error(e?.status ?? 500, e?.body?.message ?? "An unknown error has occurred");
  }
};
