import { dbRankings } from "$lib/db";
import { addDate, formatDate, MIN_DATE, SCORE_CATEGORIES } from "$lib/util";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

const sorting = (a: App.RankingEntry, b: App.RankingEntry) =>
  (a.gainedScores as number) < (b.gainedScores as number) ? 1 : -1;

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = params.category;
  if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
    throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, "Invalid date: earliest is " + MIN_DATE);
  if (date > MAX_DATE) throw error(400, "Invalid date: latest is " + MAX_DATE);

  try {
    console.time("gains/" + date);

    const ranks = params.ranks.split("-");
    const rankMin = Number(ranks[0]) ?? 0;
    const rankMax = Number(ranks[1]) || Infinity;
    const gainsDays = Number(params.extra) || 1;

    const query: App.RankingQuery = { _id: params.date };

    if (rankMin > 1 || rankMax < Infinity) query.rank = { $lte: rankMax, $gte: rankMin };
    // all country codes should always be two uppercase letters
    if (params.country?.length == 2) query.country = { $eq: params.country };

    const rankingDataEnd = (
      await dbRankings.findOne(query, { projection: { [params.category]: 1 } })
    )?.[params.category] as unknown as App.RankingEntry[];
    if (!rankingDataEnd?.length) return new Response("[]");

    // use gained field without having to send a request to another date
    if (gainsDays === 1) {
      // remove players without gained scores field
      let removed = 0;
      for (const i in rankingDataEnd)
        if (rankingDataEnd[i].gainedScores == null) {
          delete rankingDataEnd[i];
          ++removed;
        }

      rankingDataEnd.sort(sorting);
      rankingDataEnd.length -= removed;

      return new Response(JSON.stringify(rankingDataEnd));
    }

    const dateStart = addDate(new Date(date), -gainsDays);
    const rankingDataStart = (
      await dbRankings.findOne(
        { ...query, _id: formatDate(dateStart) as any },
        { projection: { [params.category]: 1 } }
      )
    )?.[params.category] as unknown as App.RankingEntry[];
    if (!rankingDataStart?.length) return new Response("[]");

    const players = new Map();
    for (const i of rankingDataStart) players.set(i._id, { scores: i.scores, rank: i.rank });

    for (const i of rankingDataEnd) {
      const player = players.get(i._id);
      if (!player) continue;

      players.set(i._id, {
        ...i,
        gainedScores: i.scores - player.scores,
        gainedRanks: player.rank - i.rank,
        gainedDays: gainsDays
      });
    }

    const playersArray = Array.from(players.values());
    // remove players that are in start but not end ranking
    let removed = 0;
    for (const i in playersArray)
      if (playersArray[i].gainedScores == null) {
        delete playersArray[i];
        ++removed;
      }

    playersArray.sort(sorting);
    playersArray.length -= removed;

    return new Response(JSON.stringify(playersArray));
  } catch (e: any) {
    console.error(e);
    throw error(500, e?.message || "Internal server error");
  } finally {
    console.timeEnd("gains/" + date);
  }
};
