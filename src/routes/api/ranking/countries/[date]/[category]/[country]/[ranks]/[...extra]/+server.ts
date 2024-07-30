import { error } from "@sveltejs/kit";
import { DB_URI, DB_NAME } from "$env/static/private";
import { MongoClient, type Document } from "mongodb";
import type { RequestHandler } from "./$types";
import { formatDate, MIN_DATE, SCORE_CATEGORIES } from "$lib/util";

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = params.category;
  if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
    throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, "Invalid date: earliest is " + MIN_DATE);
  if (date > MAX_DATE) throw error(400, "Invalid date: latest is " + MAX_DATE);

  try {
    console.time("countries/" + date);

    const client = await MongoClient.connect(DB_URI);
    const coll = client.db(DB_NAME).collection(date);

    const ranks = params.ranks.split("-");
    const rankMin = Number(ranks[0]) ?? 0;
    const rankMax = Number(ranks[1]) || Infinity;

    const query: App.RankingQuery = { _id: params.date };

    if (rankMin > 1 || rankMax < Infinity) query.rank = { $lte: rankMax, $gte: rankMin };
    // all country codes should always be two uppercase letters
    if (params.country?.length == 2) query.country = { $eq: params.country };

    const rankingData = (await coll.find(query).toArray())?.[0]?.ranking as App.RankingEntry[];
    if (!rankingData?.length) return new Response("[]");

    //set total amount of scores and players
    const countries: Map<string, App.CountryRankingAPI> = new Map();
    for (const i of rankingData) {
      const curCountry = countries.get(i.country);
      const players = (curCountry?.players || 0) + 1;

      //weighted count: 100% for 1st, 91% for 2nd, 82% for 3rd, ..., 9% for 11th, 5% for 12th-20th, 2% for >20th player
      let weight;
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
          weighted: (curCountry.weighted as number) + weighted
        });
    }

    //type changes from CountryRankingAPI to CountryRanking
    for (const [k, v] of countries)
      countries.set(k, { country: k, ...v, average: v.total / v.players });

    return new Response(JSON.stringify(Array.from(countries.values())));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e);
    throw error(500, e?.message || "Internal server error");
  } finally {
    console.timeEnd("countries/" + date);
  }
};
