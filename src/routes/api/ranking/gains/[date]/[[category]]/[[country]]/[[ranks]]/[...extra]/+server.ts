import { addDays, formatDate } from "$lib/util";
import {
  DEFAULT_API_HEADERS,
  LONG_CACHE_CONTROL,
  MIN_DATE,
  SCORE_CATEGORIES,
  SHORT_CACHE_CONTROL
} from "$lib/constants";
import {
  dbRankings,
  prepareAggregationProjection,
  prepareQueryObjectForCountryCodes,
  prepareQueryObjectForRankRange
} from "$lib/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const sorting = (a: App.RankingEntry, b: App.RankingEntry) =>
  (a.gainedScores as number) < (b.gainedScores as number) ? 1 : -1;

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const scoreCategory = (params.category as App.RankingCategory) ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, `Invalid date - earliest possible is ${MIN_DATE}`);
  if (date > MAX_DATE) throw error(400, `Invalid date - latest possible is ${MAX_DATE}`);
  const gainedDays = Math.max(Number(params.extra) || 1, 1);

  const route = `gains/${date}/${params.category ?? ""}/${params.country ?? ""}/${params.ranks ?? ""}/${params.extra ?? ""}`;
  console.time(route);

  const maxAge = MAX_DATE == formatDate(new Date()) ? SHORT_CACHE_CONTROL : LONG_CACHE_CONTROL;
  setHeaders({ ...DEFAULT_API_HEADERS, "cache-control": maxAge });

  const projectParameters = [
    ...prepareQueryObjectForRankRange(params.ranks),
    prepareQueryObjectForCountryCodes(params.country)
  ];
  const project = prepareAggregationProjection(projectParameters, scoreCategory);
  const aggregate = [{ $match: { _id: params.date } }, project];

  let aggregatedResult = await dbRankings.aggregate(aggregate).toArray();
  const rankingDataEnd = aggregatedResult?.[0]?.[scoreCategory] as unknown as App.RankingEntry[];

  if (!rankingDataEnd?.length) {
    console.timeEnd(route);
    return json([]);
  }

  // use gained field without having to send a request to another date
  if (gainedDays === 1) {
    const rankingDataSorted = rankingDataEnd
      .filter((plr) => plr.gainedScores != null)
      .sort(sorting);

    console.timeEnd(route);
    return json(rankingDataSorted);
  }

  const dateStart = formatDate(addDays(new Date(date), -gainedDays));
  aggregate[0] = { $match: { _id: dateStart } };
  aggregatedResult = await dbRankings.aggregate(aggregate).toArray();
  const rankingDataStart = aggregatedResult?.[0]?.[scoreCategory] as unknown as App.RankingEntry[];

  if (!rankingDataStart?.length) {
    console.timeEnd(route);
    return json([]);
  }

  const players = new Map<number, any>();
  for (const entry of rankingDataStart)
    players.set(entry._id, { scores: entry.scores, rank: entry.rank });

  for (const entry of rankingDataEnd) {
    const player = players.get(entry._id);
    if (!player) continue;

    players.set(entry._id, {
      ...entry,
      gainedScores: entry.scores - player.scores,
      gainedRanks: player.rank - entry.rank,
      gainedDays
    });
  }

  const playersArray = Array.from(players.values());
  const rankingDataSorted = playersArray.filter((plr) => plr.gainedScores != null).sort(sorting);

  console.timeEnd(route);
  return json(rankingDataSorted);
};
