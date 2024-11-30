import { CHART_COLORS } from "$lib/util";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{
  players: App.ComparisonChartPlayerCustomizable[];
  ranks: App.ComparisonChartEntryProcessed[];
}> => {
  const dateRangeString = params.dateRange ? `/${params.dateRange}` : "";
  const categoryString = params.category || dateRangeString ? `/${params.category}` : "";
  const resPlayers = await fetch(
    `/api/players/${params.idsOrNames}${categoryString}${dateRangeString}`
  );

  const resPlayersJson: App.ComparisonChartAPI = await resPlayers.json();
  const players: App.ComparisonChartPlayerCustomizable[] = [];
  const ranksObj: { [date: number]: App.ComparisonChartPlayerProcessed } = {};

  let colorIndex = 0;
  const rankVisible = Object.keys(resPlayersJson).length <= 3;
  for (const id in resPlayersJson) {
    const plr = resPlayersJson[id];
    const color = CHART_COLORS[colorIndex]; // score line color

    players.push({
      id,
      country: plr.country,
      name: plr.name,
      stats: plr.stats as App.PlayerProfileStatsWithDates,
      color,
      rankVisible
    });
    for (const chartEntry of plr.ranks) {
      if (!chartEntry) continue;
      const date = new Date(chartEntry.date).valueOf();
      ranksObj[date] = { ...ranksObj[date], [id]: chartEntry };
      delete (ranksObj[date][id] as App.ComparisonChartEntry & { date?: string }).date;
    }

    colorIndex = (colorIndex + 1) % CHART_COLORS.length;
  }

  const ranksArray = new Array<App.ComparisonChartEntryProcessed>(Object.keys(ranksObj).length);
  let i = 0;
  for (const timestamp in ranksObj) {
    ranksArray[i] = { date: timestamp, players: ranksObj[timestamp] };
    ++i;
  }

  return { players, ranks: ranksArray.sort((a, b) => (a.date < b.date ? -1 : 1)) };
};
