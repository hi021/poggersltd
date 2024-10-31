import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { formatDate, MIN_DATE, SCORE_CATEGORIES } from "$lib/util";
import { dbRankings } from "$lib/db";

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = (params.category as App.RankingCategory) ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, `Invalid date - earliest possible is ${MIN_DATE}`);
  if (date > MAX_DATE) throw error(400, `Invalid date - latest possible is ${MAX_DATE}`);

  try {
    console.time("countries/" + date);
    const query: App.RankingQuery = { _id: params.date };

    const ranks = params.ranks ? params.ranks.split("-") : [0, 0];
    const rankMin = Number(ranks[0]) ?? 0;
    const rankMax = Number(ranks[1]) || Infinity;
    if (rankMin > 1 || rankMax < Infinity) query.rank = { $lte: rankMax, $gte: rankMin };

    if (params.country && params.country.toLowerCase() != "all")
      query.country = { $in: params.country.toUpperCase().split(",") };

    const rankingData = await dbRankings.findOne(query, {
      projection: { [scoreCategory]: 1 }
    });
    if (!rankingData?.[scoreCategory]) return json([]);

    // set total amount of scores and players
    const countries: Map<string, App.CountryRankingAPI> = new Map();
    for (const i of rankingData[scoreCategory] as App.RankingEntry[]) {
      const curCountry = countries.get(i.country);
      const players = (curCountry?.players || 0) + 1;

      // weighted count: 100% for 1st, 91% for 2nd, 82% for 3rd, ..., 9% for 11th, 5% for 12th-20th, 2% for >20th player
      let weight: number;
      if (players <= 20) {
        if (players <= 11) weight = 1 - (players - 1) * 0.09;
        else weight = 0.05;
      } else weight = 0.02;
      const weighted = i.scores * weight;

      if (!curCountry) countries.set(i.country, { total: i.scores, players, weighted });
      else
        countries.set(i.country, {
          total: curCountry.total + i.scores,
          players,
          weighted: curCountry.weighted + weighted
        });
    }

    // type changes from CountryRankingAPI to CountryRanking
    for (const [k, v] of countries)
      countries.set(k, { ...v, country: k, average: v.total / v.players });

    return json(Array.from(countries.values()));
  } catch (e: any) {
    console.error(e);
    throw error(500, e?.message || "Internal server error");
  } finally {
    console.timeEnd("countries/" + date);
  }
};
