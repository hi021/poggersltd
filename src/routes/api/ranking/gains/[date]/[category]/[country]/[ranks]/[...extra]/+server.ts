import { error } from '@sveltejs/kit';
import { DB_URI, DB_NAME_RANKING } from '$env/static/private';
import { MongoClient, type Document } from 'mongodb';
import type { RequestHandler } from './$types';
import { addDate, formatDate, MIN_DATE, SCORE_CATEGORIES } from '$lib/util';

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

		const gainsDays = Number(params.extra) || 1;

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

		// console.log('query gains:', query);

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

		const sorting = (a: App.Ranking, b: App.Ranking) =>
			(a.gained as number) < (b.gained as number) ? 1 : -1;

		const rankingDataEnd = (await coll.aggregate(pipeline).toArray())?.[0]
			?.ranking as App.Ranking[];
		if (!rankingDataEnd?.length) return new Response('[]');

		//use gained field without having to send another request
		if (gainsDays === 1) {
			//remove players without gains
			let removed = 0;
			for (const i in rankingDataEnd)
				if (rankingDataEnd[i].gained == null) {
					delete rankingDataEnd[i];
					++removed;
				}
			rankingDataEnd.sort(sorting);
			rankingDataEnd.length -= removed;

			return new Response(JSON.stringify(rankingDataEnd));
		}

		const dateStart = addDate(new Date(date), -gainsDays);
		const collStart = client.db(DB_NAME_RANKING).collection(formatDate(dateStart));
		const rankingDataStart = (await collStart.aggregate(pipeline).toArray())?.[0]
			?.ranking as App.Ranking[];
		if (!rankingDataStart?.length) return new Response('[]');

		const players = new Map();
		for (const i of rankingDataStart) {
			players.set(i._id, { value: i.value, rank: i.rank });
		}
		for (const i of rankingDataEnd) {
			const player = players.get(i._id);
			if (!player) continue;

			players.set(i._id, {
				...i,
				gained: i.value - player.value,
				gainedDays: gainsDays,
				gainedRank: player.rank - i.rank
			});
		}

		const playersArray = Array.from(players.values());
		//remove players in start but not end ranking
		let removed = 0;
		for (const i in playersArray)
			if (playersArray[i].gained == null) {
				delete playersArray[i];
				++removed;
			}

		playersArray.sort(sorting);
		playersArray.length -= removed;

		return new Response(JSON.stringify(playersArray));
	} catch (e) {
		console.error(e);
		throw e;
	}
};
