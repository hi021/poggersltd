import { error } from '@sveltejs/kit';
import { DB_URI, DB_NAME_OTHER } from '$env/static/private';
import { MongoClient } from 'mongodb';
import type { RequestHandler } from './$types';
import { SCORE_CATEGORIES } from '$lib/util';

export const GET: RequestHandler = async ({ params }) => {
	const scoreCategory = params.category;
	if (!scoreCategory || !SCORE_CATEGORIES.includes(scoreCategory))
		throw error(400, 'Invalid ranking score category');

	try {
		const client = await MongoClient.connect(DB_URI);
		return new Response(
			JSON.stringify(
				await client
					.db(DB_NAME_OTHER)
					.collection('most-gained-' + scoreCategory)
					.find()
					.toArray()
			)
		);
	} catch (e) {
		console.error(e);
		throw e;
	}
};
