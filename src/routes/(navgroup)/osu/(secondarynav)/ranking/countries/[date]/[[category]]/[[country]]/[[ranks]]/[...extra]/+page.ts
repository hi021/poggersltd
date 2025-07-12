import { getRankingUrl } from "$lib/util";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{ rankingData: App.CountryRanking[] }> => {
  const res = await fetch(getRankingUrl(params, "countries"), {
    headers: { accept: "application/json" }
  });
  if (res.status == 400) return { rankingData: [] };

  const resJson = await res.json();
  return { rankingData: resJson };
};
