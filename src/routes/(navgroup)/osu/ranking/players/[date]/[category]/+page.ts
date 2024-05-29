import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch,
}): Promise<{ rankingData: App.RankingEntry[] }> => {
  try {
    const res = await fetch(
      `http://localhost:8080/api/ranking/${params.date}/${params.category}`,
      { headers: { accept: "application/json" } },
    );
    if (!res.ok) {
      if (res.status == 400) return { rankingData: [] };
      throw error(res.status, res.statusText || "Oopsie");
    }

    const resJson = await res.json();
    return { rankingData: resJson };
  } catch (e: any) {
    console.error(e);
    throw error(
      e?.status ?? 500,
      e?.body?.message ?? "An unknown error has occurred",
    );
  }
};
