declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Error {}
  // interface Platform {}

  type RankingCategory = "top50" | "top25" | "top8" | "top1";
  type RankingCategoryAll = RankingCategory | "top100" | "top15"; //only saved in .jsons, not in database
  //playersdb - simply hold every player (as Player type) with current PlayerRankings for every Ranking category
  //index by _id, name, country, oldName for searching, rank and countryRank for every category for fetching
  interface PlayerInfoCommon {
    _id: number; //osu! id
    name: string; //current osu! username
    country: string; //uppercase 2-letter country code
  }
  type PlayerInfoFull = PlayerInfoCommon & {
    nameKey: string; //n-gram index for searching by partial usernames (e.g. wim wimp wimpn)
    oldName?: string[]; //all previous osu! usernames
  };
  interface PlayerRankingCommon {
    value: number; //amount of scores
    rank: number; //global rank in given scores ranking
    countryRank: number;
    gained?: number; //amount of scores gained in the last `gainedDays` days, undefined if not in previous ranking archive
    gainedRank?: number; //amount of ranks gained in the last `gainedDays` days, undefined if not in previous ranking archive
    gainedDays?: number; //defaults to 1, only set in case of a gap in archive entries
  }
  type PlayerRankingFull = PlayerRankingCommon & {
    date: string; //YYYY-MM-DD day from which the data was taken
    mostGained?: { date: string; value: number }; //most gained in one day (when and how much) - ignores days when gainedDays > 1
    peak?: { date: string; value: number };
    lowest?: { date: string; value: number };
  };
  type Player = PlayerInfoFull & { [ranking in RankingCategory]?: PlayerRankingFull };

  //rankingdb - for every date have 4 RankingCategory objects with a Ranking type for every player {_id: "top50", ranking: Ranking[]}
  //index by id, country, rank, countryRank, gained
  type Ranking = PlayerInfoCommon & PlayerRankingCommon;

  interface CountryRanking {
    country: string;
    total: number;
    players: number;
    average: number;
    weighted: number;
  }
  //for the first loop in the API endpoint
  interface CountryRankingAPI {
    country?: string;
    total: number;
    players: number;
    average?: number;
    weighted?: number;
  }

  interface MostGainedRanking {
    _id: number; //rank (1-99)
    id: number; //osu! id
    name: string;
    country: string;
    scores: number; //number of scores total from the day after the gains
    gained: number; //number of scores gained in 1 day
    date: string; //YYYY-MM-DD
  }

  interface RankingSettings {
    avatars: boolean; // true by default
    scoreDifferences: boolean; // false by default
  }

  interface RankingQuery {
    _id: any; // YYYY-MM-DD string entry date
    country?: { $eq: string }; // 2 uppercase letter country code or "all"
    rank?: { $lte: number; $gte: number }; // rankMin-rankMax
  }
}
