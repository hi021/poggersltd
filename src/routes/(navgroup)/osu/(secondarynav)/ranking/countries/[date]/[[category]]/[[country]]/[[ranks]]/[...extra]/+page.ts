import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{ rankingData: App.CountryRanking[] }> => {
    const url = `/api/ranking/countries/${params.date}/${params.category ?? "top50"}/${params.country}/${params.ranks}/${params.extra}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
      if (res.status == 400) return { rankingData: [] };

    const resJson = await res.json();
    return { rankingData: resJson };
};
