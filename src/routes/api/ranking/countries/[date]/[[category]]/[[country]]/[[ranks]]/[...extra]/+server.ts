import {
	DEFAULT_API_HEADERS,
	LONG_CACHE_CONTROL,
	MIN_DATE,
	SCORE_CATEGORIES,
	SHORT_CACHE_CONTROL
} from "$lib/constants";
import { dbRankings } from "$lib/db";
import { formatDate } from "$lib/util";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

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

	const ranks = params.ranks ? params.ranks.split("-") : [0, 0];
	const rankMin = Number(ranks[0]) ?? 0;
	const rankMax = Number(ranks[1]) || Infinity;
	const rankConditions = rankMin > 1 || rankMax < Infinity ? [{ $lte: ["$$entry.rank", rankMax] }, { $gte: ["$$entry.rank", rankMin] }] : [];

	const countriesParam = params.country;
	const countryCondition = countriesParam && countriesParam.toLowerCase() != "all" ? { $in: ["$$entry.country", countriesParam.toUpperCase().split(",")] } : {};

	const filterConditions = [...rankConditions, countryCondition].filter(cond => Object.keys(cond).length > 0);
	const filterCond = filterConditions.length === 0 ? true : filterConditions.length === 1 ? filterConditions[0] : { $and: filterConditions };

	const aggregate = [
		{ $match: { _id: date } },
		{
			$project: {
				entries: {
					$filter: {
						input: `$${scoreCategory}`,
						as: "entry",
						cond: filterCond
					}
				}
			}
		},
		{ $unwind: "$entries" },
		// calculate weighted score for single entry
		{
			$project: {
				country: "$entries.country",
				scores: "$entries.scores",
				weighted: {
					$let: {
						vars: { rank: "$entries.countryRank" },
						in: {
							$cond: [
								{ $lte: ["$$rank", 20] },
								{
									$cond: [
										{ $lte: ["$$rank", 11] },
										{ $multiply: ["$entries.scores", { $subtract: [1, { $multiply: [{ $subtract: ["$$rank", 1] }, 0.09] }] }] },
										{ $multiply: ["$entries.scores", 0.05] }
									]
								},
								{ $multiply: ["$entries.scores", 0.02] }
							]
						}
					}
				}
			}
		},
		{
			$group: {
				_id: "$country",
				total: { $sum: "$scores" },
				players: { $sum: 1 },
				weighted: { $sum: "$weighted" },
				scores: { $push: "$scores" }
			}
		},
		// calculate avg and median
		{
			$project: {
				country: "$_id",
				total: 1,
				players: 1,
				average: { $divide: ["$total", "$players"] },
				weighted: 1,
				median: {
					$let: {
						vars: {
							sorted: { $sortArray: { input: "$scores", sortBy: 1 } },
							count: { $size: "$scores" }
						},
						in: {
							$cond: [
								{ $eq: [{ $mod: ["$$count", 2] }, 0] },
								{
									$divide: [
										{
											$add: [
												{ $arrayElemAt: ["$$sorted", { $subtract: [{ $divide: ["$$count", 2] }, 1] }] },
												{ $arrayElemAt: ["$$sorted", { $divide: ["$$count", 2] }] }
											]
										},
										2
									]
								},
								{ $arrayElemAt: ["$$sorted", { $floor: [{ $divide: ["$$count", 2] }] }] }
							]
						}
					}
				},
				_id: 0
			}
		}
	];

	const result = await dbRankings.aggregate(aggregate).toArray();

	console.timeEnd(route);
	return json(result as App.CountryRanking[]);
};
