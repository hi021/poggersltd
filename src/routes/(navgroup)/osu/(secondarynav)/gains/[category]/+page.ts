import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  try {
    const res = await fetch(`/api/gains/${params.category}`, {
      headers: {
        accept: "application/json"
      }
    });
    if (!res.ok) {
      if (res.status == 400) return { rankingData: [] };
      throw error(res.status, res.statusText || "Oopsie");
    }
    const resJson: App.MostGainedRankingEntry[] = await res.json();

    return { rankingData: resJson };
  } catch (e: any) {
    console.error(e);
    throw error(e?.status ?? 500, e?.body?.message ?? "An unknown error occurred");
  }
};
