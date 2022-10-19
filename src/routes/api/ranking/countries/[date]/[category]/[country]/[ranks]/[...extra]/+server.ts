import { error } from '@sveltejs/kit';
import { DB_URI, DB_NAME_RANKING } from '$env/static/private';
import { MongoClient, type Document } from 'mongodb';
import type { RequestHandler } from './$types';
import { formatDate, MIN_DATE, SCORE_CATEGORIES } from '$lib/util';

export const GET: RequestHandler = async ({ params }) => {
	const scoreCategory = params.category;
	if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
		throw error(400, 'Invalid ranking score category');

	const MAX_DATE = formatDate();
	const date = params.date === 'latest' ? MAX_DATE : params.date;
	if (date < MIN_DATE) throw error(400, 'Invalid date: earliest is ' + MIN_DATE);
	if (date > MAX_DATE) throw error(400, 'Invalid date: latest is ' + MAX_DATE);
	try {
		const client = await MongoClient.connect(DB_URI);
		const coll = client.db(DB_NAME_RANKING).collection(date);

		const ranks = params.ranks.split('-');
		const rankMin = Number(ranks[0]) ?? 0;
		const rankMax = Number(ranks[1]) || Infinity;

		const query = [];

		if (rankMin > 1 || rankMax < Infinity) {
			query.push(
				{
					$lte: ['$$ranking.rank', rankMax]
				},
				{
					$gte: ['$$ranking.rank', rankMin]
				}
			);
		}
		if (params.country && params.country.toLowerCase() !== 'all') {
			query.push({
				$eq: ['$$ranking.country', params.country]
			});
		}

		// console.log('query country:', query);

		const pipeline: Document[] = [
			{
				$match: {
					_id: params.category
				}
			}
		];
		query.length &&
			pipeline.push({
				$project: {
					ranking: {
						$filter: {
							input: '$ranking',
							as: 'ranking',
							cond: {
								$and: query
							}
						}
					}
				}
			});

		const rankingData = (await coll.aggregate(pipeline).toArray())?.[0]?.ranking as App.Ranking[];
		if (!rankingData?.length) return new Response('[]');

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
			const weighted = i.value * weight;

			if (!curCountry) countries.set(i.country, { total: i.value, players, weighted });
			else
				countries.set(i.country, {
					total: curCountry.total + i.value,
					players,
					weighted: (curCountry.weighted as number) + weighted
				});
		}

		//type changes from CountryRankingAPI to CountryRanking
		for (const [k, v] of countries)
			countries.set(k, { country: k, ...v, average: v.total / v.players });

		return new Response(JSON.stringify(Array.from(countries.values())));
	} catch (e) {
		console.error(e);
		throw e;
	}
};
