import { addDate, formatDate, MIN_DATE, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { dbRankings } from "$lib/db";

const sorting = (a: App.RankingEntry, b: App.RankingEntry) =>
  (a.gainedScores as number) < (b.gainedScores as number) ? 1 : -1;

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = (params.category as App.RankingCategory) ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, "Invalid date: earliest is " + MIN_DATE);
  if (date > MAX_DATE) throw error(400, "Invalid date: latest is " + MAX_DATE);

  try {
    console.time("gains/" + date);

    const ranks = params.ranks ? params.ranks.split("-") : [0, 0];
    const rankMin = Number(ranks[0]) ?? 0;
    const rankMax = Number(ranks[1]) || Infinity;
    const gainedDays = Number(params.extra) || 1;

    const query: App.RankingQuery = { _id: params.date };

    if (rankMin > 1 || rankMax < Infinity) query.rank = { $lte: rankMax, $gte: rankMin };
    // all country codes should always be two uppercase letters
    if (params.country?.length == 2) query.country = { $eq: params.country };

    const rankingDataEnd = (
      await dbRankings.findOne(query, { projection: { [scoreCategory]: 1 } })
    )?.[scoreCategory] as unknown as App.RankingEntry[];
    if (!rankingDataEnd?.length) return json([]);

    // use gained field without having to send a request to another date
    if (gainedDays === 1) {
      rankingDataEnd.filter((plr) => plr.gainedScores != null).sort(sorting);
      return json(rankingDataEnd);
    }

    const dateStart = addDate(new Date(date), -gainedDays);
    const rankingDataStart = (
      await dbRankings.findOne(
        { ...query, _id: formatDate(dateStart) as any },
        { projection: { [scoreCategory]: 1 } }
      )
    )?.[scoreCategory] as unknown as App.RankingEntry[];
    if (!rankingDataStart?.length) return json([]);

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

    return json(playersArray);
  } catch (e: any) {
    console.error(e);
    throw error(500, e?.message || "Internal server error");
  } finally {
    console.timeEnd("gains/" + date);
  }
};
