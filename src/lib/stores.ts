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
  countryFilter: [],
  rankFilter: { min: 0, max: 0 },
  ...storedRankingSettings
};
export const rankingSettings = writable<App.RankingSettings>(defaultRankingSettings);

rankingSettings.subscribe((newValue) => {
  if (!browser || !newValue) return;
  // TODO don't save these
  // delete newValue.countryFilter;
  // delete newValue.rankFilter;
  localStorage.setItem("rankingSettings", JSON.stringify(newValue));
});
