import type { PageLoad, RouteParams } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{ rankingData: App.RankingEntry[] }> => {
  const res = await fetch(_getGainsRankingUrl(params), { headers: { accept: "application/json" } });
  if (res.status == 400) return { rankingData: [] };

  const resJson = await res.json();
  return { rankingData: resJson };
};

export const _getGainsRankingUrl = (params: RouteParams, gainedDays = 1, baseUrl = "api") => {
  const extraString = gainedDays > 1 || params.extra ? `/${gainedDays > 1 ? gainedDays : params.extra}` : "";
  const ranksString = params.ranks || extraString ? `/${params.ranks ?? "-"}` : "";
//   console.log(`ranks ${ranksString}`, `extra ${extraString}`)
//   console.log(params, `/${baseUrl}/ranking/gains/${params.date}/${params.category ?? "top50"}/${params.country ?? "all"}${ranksString}${extraString}`  )
return `/${baseUrl}/ranking/gains/${params.date}/${params.category ?? "top50"}/${params.country ?? "all"}${ranksString}${extraString}`;
}
