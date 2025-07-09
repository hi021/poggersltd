import { formatDate } from "$lib/util";
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

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const scoreCategory = (params.category as App.RankingCategory) ?? "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const MAX_DATE = formatDate();
  const date = params.date === "latest" || params.date === "last" ? MAX_DATE : params.date;
  if (date < MIN_DATE) throw error(400, `Invalid date - earliest possible is ${MIN_DATE}`);
  if (date > MAX_DATE) throw error(400, `Invalid date - latest possible is ${MAX_DATE}`);

  const route = `players/${date}/${params.category ?? ""}/${params.country ?? ""}/${params.ranks ?? ""}/${params.extra ?? ""}`;
  console.time(route);

  const maxAge = MAX_DATE == formatDate(new Date()) ? SHORT_CACHE_CONTROL : LONG_CACHE_CONTROL;
  setHeaders({ ...DEFAULT_API_HEADERS, "cache-control": maxAge });

  const projectParameters = [
    ...prepareQueryObjectForRankRange(params.ranks),
    prepareQueryObjectForCountryCodes(params.country)
  ];
  const project = prepareAggregationProjection(projectParameters, scoreCategory);
  const aggregate = [{ $match: { _id: params.date } }, project];

  const rankingData = await dbRankings.aggregate(aggregate).toArray();

  console.timeEnd(route);
  return json(rankingData?.[0]?.[scoreCategory] ?? []);
};
