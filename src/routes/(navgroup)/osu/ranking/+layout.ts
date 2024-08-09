import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async (): Promise<{
  rankingSettings: App.RankingSettings;
}> => {
  return { rankingSettings: { avatars: true, scoreDifferences: false, perPage: 50 } };
};
