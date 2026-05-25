import { getRankingUrl } from "$lib/util";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, url, fetch }): Promise<{ rankingData: App.RankingEntry[] }> => {
	const res = await fetch(getRankingUrl(params, url), { headers: { accept: "application/json" } });
	if (res.status == 400) return { rankingData: [] };

	const resJson = await res.json();
	return { rankingData: resJson };
};
