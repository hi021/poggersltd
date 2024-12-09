import {
  addDate,
  DEFAULT_API_HEADERS,
  formatDate,
  LONG_CACHE_CONTROL,
  MIN_DATE,
  SCORE_CATEGORIES,
  SHORT_CACHE_CONTROL
} from "$lib/util";
import {
  dbRankings,
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
  const gainedDays = Number(params.extra) || 1;

  const route = `gains/${date}/${params.category ?? ""}/${params.country ?? ""}/${params.ranks ?? ""}/${params.extra ?? ""}`;
  console.time(route);

  const maxAge = MAX_DATE == formatDate(new Date()) ? SHORT_CACHE_CONTROL : LONG_CACHE_CONTROL;
  setHeaders({ ...DEFAULT_API_HEADERS, "cache-control": maxAge });

  const query: App.RankingQuery = { _id: params.date };
  query.rank = prepareQueryObjectForRankRange(params.ranks);
  query.country = prepareQueryObjectForCountryCodes(params.country);

  const rankingDataEnd = (
    await dbRankings.findOne(query, { projection: { [scoreCategory]: 1 } })
  )?.[scoreCategory] as unknown as App.RankingEntry[];
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

  const dateStart = addDate(new Date(date), -gainedDays);
  const rankingDataStart = (
    await dbRankings.findOne(
      { ...query, _id: formatDate(dateStart) as any },
      { projection: { [scoreCategory]: 1 } }
    )
  )?.[scoreCategory] as unknown as App.RankingEntry[];
  if (!rankingDataStart?.length) {
    console.timeEnd(route);
    return json([]);
  }

  const players = new Map();
  for (const i of rankingDataStart) players.set(i._id, { scores: i.scores, rank: i.rank });

  for (const i of rankingDataEnd) {
    const player = players.get(i._id);
    if (!player) continue;

    players.set(i._id, {
      ...i,
      gainedScores: i.scores - player.scores,
      gainedRanks: player.rank - i.rank,
      gainedDays
    });
  }

  const playersArray = Array.from(players.values());
  const rankingDataSorted = playersArray.filter((plr) => plr.gainedScores != null).sort(sorting);

  console.timeEnd(route);
  return json(rankingDataSorted);
};
