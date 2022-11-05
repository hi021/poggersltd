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
		console.time('players/' + date);
		const client = await MongoClient.connect(DB_URI);
		const coll = client.db(DB_NAME_RANKING).collection(date);

		const ranks = params.ranks.split('-');
		const rankMin = Number(ranks[0]) ?? 0;
		const rankMax = Number(ranks[1]) || Infinity;

		const query = [];

		if (rankMin > 1 || rankMax < Infinity) {
			query.push({ $lte: ['$$ranking.rank', rankMax] }, { $gte: ['$$ranking.rank', rankMin] });
		}
		if (params.country && params.country.toLowerCase() !== 'all') {
			query.push({
				$eq: ['$$ranking.country', params.country]
			});
		}

		const pipeline: Document[] = [{ $match: { _id: params.category } }];
		query.length &&
			pipeline.push({
				$project: {
					ranking: {
						$filter: {
							input: '$ranking',
							as: 'ranking',
							cond: { $and: query }
						}
					}
				}
			});

		const rankingData = (await coll.aggregate(pipeline).toArray())?.[0]?.ranking as App.Ranking[];
		if (!rankingData?.length) return new Response('[]');
		return new Response(JSON.stringify(rankingData));
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (e: any) {
		console.error(e);
		throw error(500, e?.message || 'Internal server error');
	} finally {
		console.timeEnd('players/' + date);
	}
};
