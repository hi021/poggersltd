import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const resPlayer = await fetch(`/api/player/${params.idOrName}`);
		if (!resPlayer.ok) {
			if (resPlayer.status == 400) return null;
			throw error(resPlayer.status, resPlayer.statusText || 'Oopsie');
		}
		const resPlayerJson = await resPlayer.json();

		const rankDays = 90;
		const resRanks = await fetch(
			`/api/player/${resPlayerJson._id}/ranks/${params.category}/${rankDays}`
		);
		const resRanksJson = await resRanks.json();

		return { ...resPlayerJson, ranks: resRanksJson.ranks, rankStats: resRanksJson.rankStats };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (e: any) {
		console.error(e);
		throw error(e?.status ?? 500, e?.body?.message ?? 'An unknown error occurred');
	}
};
