import { CHART_COLORS, mergeObjectArraysOnField } from "$lib/util";
import type { PageLoad } from "./$types";

type ComparisonChartEntriesObject = { [date: number]: App.ComparisonChartPlayerProcessed };

export function _processResult(
  resPlayersJson: App.ComparisonChartAPI,
  setColorsAndVisibility = false
) {
  const players: App.ComparisonChartPlayerCustomizable[] = [];
  const ranksObj: ComparisonChartEntriesObject = {};

  let colorIndex = 0;
  const rankVisible = Object.keys(resPlayersJson).length <= 3;
  for (const id in resPlayersJson) {
    const plr = resPlayersJson[id];

    const chartPlayer: App.ComparisonChartPlayerCustomizable = {
      id,
      country: plr.country,
      name: plr.name,
      stats: plr.stats as App.PlayerProfileStatsWithDates
    };
    if (setColorsAndVisibility) {
      const color = CHART_COLORS[colorIndex];
      chartPlayer.color = color;
      chartPlayer.rankVisible = rankVisible;

      colorIndex = (colorIndex + 1) % CHART_COLORS.length;
    }

    players.push(chartPlayer);
    _mergePlayerRanksIntoObject(plr.ranks, id, ranksObj);
  }

  return { players, ranks: _processPlayerRanksObject(ranksObj) };
}

export function _mergePlayerRanksIntoObject(
  ranks: App.ComparisonChartEntries,
  plrId: string,
  ranksObj: ComparisonChartEntriesObject
) {
  for (const chartEntry of ranks) {
    if (!chartEntry) continue;

    const date = new Date(chartEntry.date).valueOf();
    ranksObj[date] = { ...ranksObj[date], [plrId]: chartEntry };
    delete (ranksObj[date][plrId] as App.ComparisonChartEntry & { date?: string }).date;
  }

  return ranksObj;
}

export function _processPlayerRanksObject(ranksObj: ComparisonChartEntriesObject) {
  let i = 0;
  const ranksArray = new Array<App.ComparisonChartEntryProcessed>(Object.keys(ranksObj).length);
  for (const timestamp in ranksObj)
    ranksArray[i++] = { date: timestamp, players: ranksObj[timestamp] };

  return ranksArray.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function _mergePlayerRanksIntoExistingArray(
  ranksSrc: App.ComparisonChartEntryProcessed[],
  ranksDest: App.ComparisonChartEntryProcessed[]
) {
  return _processPlayerRanksObject(
    mergeObjectArraysOnField(ranksSrc, ranksDest, "date", "players")
  );
}

export function _setExistingPlayerColors(players: App.ComparisonChartPlayerCustomizable[]) {
  for (const i in players) {
    const player = players[i];
    if (!player.color) player.color = CHART_COLORS[Number(i) % CHART_COLORS.length];
    if (player.rankVisible == null && players.length >= 3) player.rankVisible = false;
  }
}

export function _pruneExistingDataOutsideDateRange(
  players: App.ComparisonChartPlayerCustomizable[],
  ranks: App.ComparisonChartEntryProcessed[],
  range: App.DateRange
) {}

export const load: PageLoad = async ({
  params,
  url,
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
  return _processResult(resPlayersJson, url.searchParams.get("setColors") != "false");
};
