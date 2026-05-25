import { DB_URI, DB_NAME } from "$env/static/private";
import { MongoClient } from "mongodb";

const dbClient = await MongoClient.connect(DB_URI);
export const db = dbClient.db(DB_NAME);
export const dbRankings = db.collection("rankings");
export const dbPlayers = db.collection("players");
export const dbMostGained = db.collection("most-gained");
export const dbMisc = db.collection("misc");

export function prepareQueryObjectForIdOrName(idOrName: string | number) {
	const idOrNameNumber = parseInt(idOrName as string);
	return isNaN(idOrNameNumber) ? { name: idOrName as string } : { _id: idOrNameNumber as any };
}

export function prepareQueryObjectForRankRange(ranksParam?: string) {
	const ranks = ranksParam ? ranksParam.split("-") : [0, 0];
	const rankMin = Number(ranks[0]) ?? 0;
	const rankMax = Number(ranks[1]) || Infinity;

	return rankMin > 1 || rankMax < Infinity
		? [{ $lte: ["$$cat.rank", rankMax] }, { $gte: ["$$cat.rank", rankMin] }]
		: [];
}

export function prepareQueryObjectForCountryCodes(countriesParam?: string) {
	return countriesParam && countriesParam.toLowerCase() != "all"
		? { $in: ["$$cat.country", countriesParam.toUpperCase().split(",")] }
		: {};
}

export function prepareAggregationProjectionForIdOrName(idOrName: string, scoreCategory: App.RankingCategory) {
	const playerId = parseInt(idOrName);
	const cond = {
		$eq: isNaN(playerId) ? ["$$cat.name", idOrName] : ["$$cat._id", playerId]
	};

	return prepareAggregationProjection([cond], scoreCategory);
}

export function prepareAggregationProjection(
	condition: Array<Record<string, unknown> | undefined>,
	scoreCategory?: App.RankingCategory
) {
	if (!scoreCategory) scoreCategory = "top50";
	const cond = condition.length == 1 ? condition[0] : { $and: condition };

	const project = {
		$project: {
			[scoreCategory]: {
				$filter: {
					input: "$" + scoreCategory,
					as: "cat",
					cond
				}
			}
		}
	};

	return project;
}

// TODO: document (e.g. /api/ranking/countries/2025-11-29/top50?sortBy=players:-1,average:1)
export function prepareSortObject(searchParams: URLSearchParams, defaultSortColumn: string): Record<string, 1 | -1> {
	const rawSortBy = searchParams.get("sortBy")?.trim() || defaultSortColumn;
	const rawSortDirection = searchParams.get("sortDirection")?.toLowerCase();
	const defaultDirection = rawSortDirection === "asc" ? 1 : -1;

	return Object.fromEntries(
		rawSortBy
			.split(",")
			.map(field => field.trim())
			.filter(Boolean)
			.map(field => {
				const [name, directionPart] = field.split(":").map(part => part.trim());
				const direction = Number(directionPart);
				return [name.toLowerCase(), direction === 1 ? 1 : direction === -1 ? -1 : defaultDirection] as const;
			})
	);
}
