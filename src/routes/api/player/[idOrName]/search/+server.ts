import { error } from '@sveltejs/kit';
import { DB_URI, DB_NAME_OTHER } from '$env/static/private';
import { MongoClient } from 'mongodb';
import type { RequestHandler } from './$types';

//get player (type Player OR just osu! id and exact name - depending on parameter) by non-exact name
export const GET: RequestHandler = async ({ params, url }) => {
	const nameQuery = params.idOrName;
	if (!nameQuery || nameQuery.length < 3)
		throw error(400, 'Name query must be at least 3 characters long');

	const queryParams = url.searchParams;
	const limit = Number(queryParams.get('limit')) || 8;
	const projection = queryParams.get('full') ? { nameKey: 0 } : { _id: 1, name: 1 };

	const client = await MongoClient.connect(DB_URI);
	const coll = client.db(DB_NAME_OTHER).collection('players');

	try {
		const res = await coll
			.find({ $text: { $search: nameQuery } }, { projection })
			.limit(limit)
			.toArray();

		if (!res?.length) return new Response('[]');
		return new Response(JSON.stringify(res));
	} catch (e) {
		console.error('Failed to search for player:', e);
		throw error(500, 'Internal server error');
	}
};
