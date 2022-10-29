/* eslint-disable no-async-promise-executor */
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const api = `https://osustats.respektive.pw/counts/${params.nameOrId}?rank=`;
	const split = params.ranks.split('-'); //can be `rank` or `minRank-maxRank`

	let minRank = parseInt(split[0]);
	if (isNaN(minRank) || minRank < 1) minRank = 1;
	let maxRank = parseInt(split[1]);
	if (isNaN(maxRank)) maxRank = minRank;
	if (maxRank > 50) maxRank = 50;

	const arrLength = maxRank ? maxRank - minRank + 1 : 1;
	const promises = new Array(arrLength);
	const breakdown = new Array(arrLength);
	let user;

	for (let curRank = minRank; curRank <= maxRank; curRank++) {
		const i = curRank - minRank;
		promises[i] = new Promise(async (resolve, reject) => {
			try {
				const res = await fetch(api + curRank);
				const resJson = await res.json();
				const value = resJson['rank_' + curRank];
				if (value == null) {
					reject(null);
					return;
				}

				if (!i) user = { id: resJson.user_id, name: resJson.username, country: resJson.country };
				breakdown[i] = { rank: curRank, value };
				resolve(value);
			} catch (e) {
				reject(e);
			}
		});
	}

	try {
		await Promise.all(promises);
		return { user, breakdown };
	} catch (e: any) {
		console.error(e);
		throw error(e?.status ?? 500, e?.body?.message ?? 'An unknown error occurred');
	}
};
