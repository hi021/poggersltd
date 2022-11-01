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
	let user: { id: number; name: string; country: string };
	let maxValue: number;

	for (let curRank = minRank; curRank <= maxRank; curRank++) {
		const i = curRank - minRank;
		promises[i] = new Promise(async (resolve, reject) => {
			try {
				const res = await fetch(api + curRank);
				const resJson = await res.json();
				console.log(api + curRank, resJson);
				const value = resJson['rank_' + curRank];
				if (value == null) {
					reject(new Error('Null rank value'));
					return;
				}

				if (!i) {
					user = { id: resJson.user_id, name: resJson.username, country: resJson.country };
					maxValue = value;
				} else if (value > maxValue) maxValue = value;
				breakdown[i] = { rank: curRank, value };
				resolve(value);
			} catch (e) {
				reject(e);
			}
		});
	}

	try {
		await Promise.all(promises);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		return { user, breakdown, max: maxValue };
	} catch (e: any) {
		console.error(e);
		throw error(e?.status ?? 500, e?.body?.message ?? 'An unknown error occurred');
	}
};
