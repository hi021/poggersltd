/* eslint-disable no-async-promise-executor */
import { error } from '@sveltejs/kit';
import { DB_URI, DB_NAME_RANKING } from '$env/static/private';
import { MongoClient } from 'mongodb';
import type { RequestHandler } from './$types';
import { getDaysBeforeDate, SCORE_CATEGORIES } from '$lib/util';

//get `category` count from last `days`
//returns Array<{rank, value}> with length of `days`
export const GET: RequestHandler = async ({ params }) => {
	const scoreCategory = params.category;
	if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
		throw error(400, 'Invalid ranking score category');

	const days = Number(params.days);
	if (isNaN(days) || days < 1) throw error(400, 'Invalid amount of days');
	const daysArray = getDaysBeforeDate(days);

	const playerId = Number(params.idOrName); //must be id!

	const client = await MongoClient.connect(DB_URI);
	const db = client.db(DB_NAME_RANKING);
	const scoresArray = new Array(days);
	const promises = new Array(days);
	const aggregate = [
		{
			$match: {
				_id: params.category
			}
		},
		{
			$project: {
				ranking: {
					$filter: {
						input: '$ranking',
						as: 'ranking',
						cond: {
							$eq: ['$$ranking._id', playerId]
						}
					}
				}
			}
		}
	];

	for (let i = 0; i < days; i++) {
		promises[i] = new Promise(async (resolve, reject) => {
			try {
				const res = (await db.collection(daysArray[i]).aggregate(aggregate).toArray())?.[0]
					?.ranking?.[0];
				if (!res) {
					resolve(null);
					return;
				}

				scoresArray[i] = { rank: res.rank, value: res.value };
				resolve(1);
			} catch (e) {
				console.error('Failed to fetch archive:', e);
				reject(e);
			}
		});
	}

	try {
		await Promise.all(promises);
		return new Response(JSON.stringify(scoresArray));
	} catch (e) {
		throw error(500, 'Internal server error');
	}
};
