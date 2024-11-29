import type { PageLoad } from "./$types";

export const load: PageLoad = async ({
  params,
  fetch
}): Promise<App.Player & Partial<App.PlayerProfileRanks>> => {
    const category = (params.category ?? "top50") as App.RankingCategory | "all";

    const resPlayer = await fetch(`/api/player/${params.idOrName}/${category}`);
    const resPlayerJson: App.PlayerAPI = await resPlayer.json();
    if (category === "all") return resPlayerJson;

    const resRanks = await fetch(`/api/player/${resPlayerJson._id}/ranks/${category}`);
    const resRanksJson: App.PlayerProfileRanks = await resRanks.json();

    return { ...resPlayerJson, ...resRanksJson };
};
