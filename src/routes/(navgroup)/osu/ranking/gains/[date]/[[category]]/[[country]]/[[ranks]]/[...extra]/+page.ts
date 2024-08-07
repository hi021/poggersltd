import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<{ rankingData: App.RankingEntry[] }> => {
  try {
    const url = `/api/ranking/gains/${params.date}/${params.category ?? "top50"}/${params.country ?? "all"}/${params.ranks}/${params.extra}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });

    if (!res.ok) {
      if (res.status == 400) return { rankingData: [] };
      throw error(res.status, res.statusText || "Oopsie");
    }

    const resJson = await res.json();
    return { rankingData: resJson };
  } catch (e: any) {
    console.error(e);
    throw error(e?.status ?? 500, e?.body?.message ?? "An unknown error has occurred");
  }
};
