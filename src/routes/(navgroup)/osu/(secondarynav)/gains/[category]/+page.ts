import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/gains/${params.category}`, {
    headers: {
      accept: "application/json"
    }
  });
  if (res.status == 400) return { rankingData: [] };

  const resJson: App.MostGainedRankingEntry[] = await res.json();
  return { rankingData: resJson };
};
