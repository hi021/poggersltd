import { browser } from "$app/environment";
import { writable } from "svelte/store";

const storedRankingSettings = browser
  ? JSON.parse(localStorage.getItem("rankingSettings") ?? "{}")
  : {};
const defaultRankingSettings: App.RankingSettings = {
  avatars: true,
  dateSticky: true,
  perPage: 50,
  scoreDifferences: false,
  gainedDays: 1,
  ...storedRankingSettings
};
export const rankingSettings = writable<App.RankingSettings>(defaultRankingSettings);

rankingSettings.subscribe(
  (newValue) => browser && localStorage.setItem("rankingSettings", JSON.stringify(newValue))
);
