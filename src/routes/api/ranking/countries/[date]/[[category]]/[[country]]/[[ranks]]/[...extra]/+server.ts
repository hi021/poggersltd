import {
  DEFAULT_API_HEADERS,
  formatDate,
  LONG_CACHE_CONTROL,
  MIN_DATE,
  SCORE_CATEGORIES,
  SHORT_CACHE_CONTROL
} from "$lib/util";
import {
  dbRankings,
  prepareAggregationProjection,
  prepareQueryObjectForCountryCodes,
  prepareQueryObjectForRankRange
} from "$lib/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

function calculatePlayerWeightedScores(countryRank: number, scores: number) {
  // weighted count: 100% for 1st, 91% for 2nd, 82% for 3rd, ..., 9% for 11th, 5% for 12th-20th, 2% for >20th player
  let weight = 0.02;
  if (countryRank <= 20) {
    if (countryRank <= 11) weight = 1 - (countryRank - 1) * 0.09;
    else weight = 0.05;
  }

  return scores * weight;
}

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const scoreCategory = (params.category as App.RankingCategory) ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, `Invalid date - earliest possible is ${MIN_DATE}`);
  if (date > MAX_DATE) throw error(400, `Invalid date - latest possible is ${MAX_DATE}`);

  const route = `countries/${date}/${params.category ?? ""}/${params.country ?? ""}/${params.ranks ?? ""}/${params.extra ?? ""}`;
  console.time(route);

  const maxAge = MAX_DATE == formatDate(new Date()) ? SHORT_CACHE_CONTROL : LONG_CACHE_CONTROL;
  setHeaders({ ...DEFAULT_API_HEADERS, "cache-control": maxAge });

  const projectParameters = [
    ...prepareQueryObjectForRankRange(params.ranks),
    prepareQueryObjectForCountryCodes(params.country)
  ];
  const project = prepareAggregationProjection(projectParameters, scoreCategory);
  const aggregate = [{ $match: { _id: params.date } }, project];

  const aggregatedResult = await dbRankings.aggregate(aggregate).toArray();
  const rankingData = aggregatedResult?.[0]?.[scoreCategory];

  if (!rankingData) {
    console.timeEnd(route);
    return json([]);
  }

  // set total amount of scores and players
  const countries: Map<string, App.CountryRankingAPI> = new Map();
  for (const i of rankingData as App.RankingEntry[]) {
    const curCountry = countries.get(i.country);
    const players = (curCountry?.players || 0) + 1;
    const weighted = calculatePlayerWeightedScores(players, i.scores);

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

  console.timeEnd(route);
  return json(Array.from(countries.values()));
};
