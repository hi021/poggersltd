import { addDate, DEFAULT_API_HEADERS, formatDate, MIN_DATE, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dbRankings } from "$lib/db";

const sorting = (a: App.RankingEntry, b: App.RankingEntry) =>
  (a.gainedScores as number) < (b.gainedScores as number) ? 1 : -1;

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const scoreCategory = (params.category as App.RankingCategory) ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, `Invalid date - earliest possible is ${MIN_DATE}`);
  if (date > MAX_DATE) throw error(400, `Invalid date - latest possible is ${MAX_DATE}`);

  const route = `gains/${date}`
  console.time(route);
  setHeaders(DEFAULT_API_HEADERS);

    const query: App.RankingQuery = { _id: params.date };

    const ranks = params.ranks ? params.ranks.split("-") : [0, 0];
    const rankMin = Number(ranks[0]) ?? 0;
    const rankMax = Number(ranks[1]) || Infinity;
    if (rankMin > 1 || rankMax < Infinity) query.rank = { $lte: rankMax, $gte: rankMin };

    if (params.country && params.country.toLowerCase() != "all")
      query.country = { $in: params.country.toUpperCase().split(",") };
    const gainedDays = Number(params.extra) || 1;

    const rankingDataEnd = (
      await dbRankings.findOne(query, { projection: { [scoreCategory]: 1 } })
    )?.[scoreCategory] as unknown as App.RankingEntry[];
    if (!rankingDataEnd?.length) {
        console.timeEnd(route);
        return json([]);
    }

    // use gained field without having to send a request to another date
    if (gainedDays === 1) {
      rankingDataEnd.filter((plr) => plr.gainedScores != null).sort(sorting);
      console.timeEnd(route);
      return json(rankingDataEnd);
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
    playersArray.filter((plr) => plr.gainedScores != null).sort(sorting);

    console.timeEnd(route);
    return json(playersArray);
};
