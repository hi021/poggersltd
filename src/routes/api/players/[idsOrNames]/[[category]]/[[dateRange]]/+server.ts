import {
  getDaysBeforeDate,
  getDaysBetweenDates,
  getServerDate,
  MAX_CHART_PLAYERS,
  MIN_DATE,
  SCORE_CATEGORIES
} from "$lib/util";
import { error, json } from "@sveltejs/kit";
import { dbRankings } from "$lib/db";
import type { RequestHandler } from "./$types";

function prepareFetchPlayer(
  scoreCategory: App.RankingCategory,
  idOrName: string,
  days: number,
  datesToFetch: string[],
  resultObj: Omit<App.ComparisonChartAPI, "stats">
) {
  const promises = new Array<Promise<number | null>>(days);
  const playerId = parseInt(idOrName);
  const project = {
    $project: {
      [scoreCategory]: {
        $filter: {
          input: "$" + scoreCategory,
          as: "cat",
          cond: {
            $eq: isNaN(playerId) ? ["$$cat.name", idOrName] : ["$$cat._id", playerId]
          }
        }
      }
    }
  };

  for (let i = 0; i < days; i++) {
    const date = datesToFetch[i];
    const aggregate = [{ $match: { _id: date } }, project];

    promises[i] = new Promise(async (resolve) => {
      const resArray = await dbRankings.aggregate(aggregate).toArray();
      const player: App.RankingEntry = resArray?.[0]?.[scoreCategory]?.[0];
      if (!player) {
        resolve(null);
        return;
      }

      if (!resultObj[player._id])
        resultObj[player._id] = {
          name: player.name,
          country: player.country,
          ranks: new Array<App.ComparisonChartEntryWithDate>(days)
        };
      resultObj[player._id].ranks[i] = {
        rank: player.rank,
        scores: player.scores,
        date
      };

      resolve(player.scores);
    });
  }

  return promises;
}

function calculatePlayerStats(
  ranks: Array<App.ComparisonChartEntryWithDate | null>
): App.PlayerProfileStatsWithDates {
  const firstEntry = ranks[0] as App.ComparisonChartEntryWithDate;
  const lastEntry = ranks[ranks.length - 1] as App.ComparisonChartEntryWithDate;
  let maxScores = firstEntry.scores,
    minScores = firstEntry.scores,
    maxRank = firstEntry.rank,
    minRank = firstEntry.rank;

  for (const i in ranks) {
    if (!i || !ranks[i]) continue;

    if (ranks[i].scores > maxScores) maxScores = ranks[i].scores;
    else if (ranks[i].scores < minScores) minScores = ranks[i].scores;
    if (ranks[i].rank > maxRank) maxRank = ranks[i].rank;
    else if (ranks[i].rank < minRank) minRank = ranks[i].rank;
  }

  return {
    maxRank,
    minRank,
    maxScores,
    minScores,
    startRank: lastEntry.rank,
    endRank: firstEntry.rank,
    startScores: lastEntry.scores,
    endScores: firstEntry.scores,
    startDate: lastEntry.date,
    endDate: firstEntry.date
  };
}

export const GET: RequestHandler = async ({ params }) => {
  const route = `players/${params.idsOrNames}/${params.category ?? ""}/${params.dateRange ?? ""}`;
  console.time(route);
  const scoreCategory = (params.category as App.RankingCategory) || "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) {
    console.timeEnd(route);
    throw error(400, "Invalid ranking score category");
  }

  const idsOrNames = params.idsOrNames?.split(",");
  if (!idsOrNames?.length) {
    console.timeEnd(route);
    return json({});
  }
  if (idsOrNames.length > MAX_CHART_PLAYERS) {
    console.timeEnd(route);
    throw error(400, `The maximum amount of players is ${MAX_CHART_PLAYERS}`);
  }

  const dateRange = params.dateRange?.split(" ");
  const dateStartTimestamp = dateRange && Date.parse(dateRange[0]); // assume beginning of ranking data if invalid
  const dateEndTimestamp = dateRange && Date.parse(dateRange[1]); // assume today if invalid
  const dateStart = isNaN(dateStartTimestamp as number)
    ? Date.parse(MIN_DATE)
    : (dateStartTimestamp as number);
  const dateEnd = isNaN(dateEndTimestamp as number)
    ? getServerDate().valueOf()
    : (dateEndTimestamp as number);
  const days = getDaysBetweenDates(dateStart, dateEnd);
  const datesToFetch = getDaysBeforeDate(days, new Date(dateEnd));

  const allPlayerPromises = new Array<Promise<number | null>>();
  const players: App.ComparisonChartAPI = {};

  for (const tmpId of idsOrNames) {
    allPlayerPromises.push(
      ...prepareFetchPlayer(scoreCategory, tmpId, days, datesToFetch, players)
    );
  }
  try {
    await Promise.all(allPlayerPromises);
    for (const i in players) {
      players[i].ranks = players[i].ranks
        .filter((a) => a)
        .sort((a, b) => ((a?.date ?? "0") < (b?.date ?? "0") ? 1 : -1));
      players[i].stats = calculatePlayerStats(players[i].ranks);
    }

    return json(players);
  } catch (e) {
    console.error(e);
    throw error(500, "Internal server error");
  } finally {
    console.timeEnd(route);
  }
};
