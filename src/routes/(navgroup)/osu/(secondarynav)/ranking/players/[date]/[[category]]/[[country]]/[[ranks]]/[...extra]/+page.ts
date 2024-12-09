import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{ rankingData: App.RankingEntry[] }> => {
  const extraString = params.extra ? `/${params.extra}` : "";
  const ranksString = params.ranks || params.extra ? `/${params.ranks ?? ""}` : "";
  const url = `/api/ranking/players/${params.date}/${params.category ?? "top50"}/${params.country ?? "all"}${ranksString}${extraString}`;

  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (res.status == 400) return { rankingData: [] };

  const resJson = await res.json();
  return { rankingData: resJson };
};
