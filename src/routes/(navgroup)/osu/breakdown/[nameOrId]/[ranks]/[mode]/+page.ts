/* eslint-disable no-async-promise-executor */
import { error } from '@sveltejs/kit';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const api = `https://osustats.respektive.pw/counts/${params.nameOrId}`;
	const split = params.ranks.split('-'); //can be `rank` or `minRank-maxRank`

	let minRank = parseInt(split[0]);
	if (isNaN(minRank) || minRank < 1) minRank = 1;
	if (minRank > 100) minRank = 100;
	let maxRank = parseInt(split[1]);
	if (isNaN(maxRank)) maxRank = minRank;

	const arrLength = maxRank ? maxRank - minRank + 1 : 1;
	if (arrLength <= 0) throw error(400, 'Invalid rank range');

	const promises = new Array(arrLength);
	const breakdown = new Array(arrLength);
	let user: { id: number; name: string; country: string };
	let maxValue: number;
	let beatmaps: number;
	let stats: { [category in App.RankingCategoryAll]: { value: number; rank: number } };

	console.time('breakdown/' + params.nameOrId);
	for (let curRank = minRank; curRank <= maxRank; curRank++) {
		const i = curRank - minRank;
		promises[i] = new Promise(async (resolve, reject) => {
			try {
				const res = await fetch(`${api}?rank=${curRank}&mode=${params.mode}`);
				const resJson = await res.json();
				if (resJson.error) {
					reject(new Error(resJson.error));
					return;
				}

				const value = resJson['rank_' + curRank] ?? 0;
				if (user == null) {
					user = { id: resJson.user_id, name: resJson.username, country: resJson.country };
					maxValue = value;
					beatmaps = resJson.beatmaps_amount;
					stats = {
						top100: { value: resJson.top100s, rank: resJson.top100s_rank },
						top50: { value: resJson.top50s, rank: resJson.top50s_rank },
						top25: { value: resJson.top25s, rank: resJson.top25s_rank },
						top15: { value: resJson.top15s, rank: resJson.top15s_rank },
						top8: { value: resJson.top8s, rank: resJson.top8s_rank },
						top1: { value: resJson.top1s, rank: resJson.top1s_rank }
					};
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
		return { user, breakdown, max: maxValue, beatmaps, stats };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (e: any) {
		console.error(e);
		throw error(e.message ? 400 : 500, e?.message || 'Internal error');
	} finally {
		console.timeEnd('breakdown/' + params.nameOrId);
	}
};
