import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{ rankingData: App.RankingEntry[] }> => {
  const url = `/api/ranking/gains/${params.date}/${params.category ?? "top50"}/${params.country ?? "all"}/${params.ranks}/${params.extra}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status == 400) return { rankingData: [] };

  const resJson = await res.json();
  return { rankingData: resJson };
};
