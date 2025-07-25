declare namespace App {
  // Database structure:
  // DATABASE poggersltd
  //    COLLECTION rankings    | index by: _id, country, rank, countryRank, gainedScores
  //      DOCUMENT every ranking date:     {_id: date, top50: RankingEntry[], ..., top1: RankingEntry[]}
  //    COLLECTION players     | index by: _id, country, oldName for searching, rank and countryRank per category for fetching
  //      DOCUMENT every player:           {...PlayerInfoFull, top50: PlayerRankingFull, ..., top1: PlayerRankingFull}
  //    COLLECTION most-gained | index by: _id
  //      DOCUMENT every ranking category: {_id: category, ranking: MostGainedRanking[]}

  type RankingCategory = "top50" | "top25" | "top8" | "top1";
  type AllRankingCategory = RankingCategory | "top100" | "top15"; // only locally saved to .jsons, not in database
  type DateRange = Partial<{ start: string; end: string }>;

  interface PlayerInfoCommon {
    _id: number; //                                          osu! id
    name: string; //                                         current osu! username
    country: string; //                                      uppercase 2-letter country code (e.g. US)
  }
  type PlayerInfoFull = PlayerInfoCommon & {
    nameKey: string; //                                      n-gram index for searching by partial usernames (e.g. "wim wimp wimpn")
    oldNames?: string[]; //                                  set of all previous osu! usernames (stored as array)
  };
  interface PlayerRankingCommon {
    rank: number; //                                         global rank in given ranking category
    scores: number; //                                       amount of scores in given ranking category
    countryRank: number;
    gainedScores?: number; //                                amount of scores gained in the last `gainedDays` days, undefined if not in previous ranking archive
    gainedRanks?: number; //                                 amount of ranks gained in the last `gainedDays` days, undefined if not in previous ranking archive
    gainedDays?: number; //                                  days since previous ranking entry, defaults to 1, only set otherwise in case of a gap in archive entries
  }
  type PlayerRankingFull = PlayerRankingCommon & {
    date: string; //                                         as YYYY-MM-DD, day from which the data was taken
    mostGained?: { date: string; scores: number }; //        most gained in one day (when and how much) - ignores entries where gainedDays > 1
    peak?: { date: string; scores: number };
    lowest?: { date: string; scores: number };
  };
  type Player = PlayerInfoFull & {
    [ranking in RankingCategory]?: PlayerRankingFull;
  };

  type PlayerRankingFullAPI = PlayerRankingFull & { daysOutdated?: number };
  type PlayerAPI = PlayerInfoFull & {
    [ranking in RankingCategory]?: PlayerRankingFullAPI;
  };

  type RankingEntry = PlayerInfoCommon & PlayerRankingCommon;
  type PlayerChartEntry = { day: number; scores?: number; rank?: number };
  type PlayerProfileStats = {
    minRank: number;
    maxRank: number;
    minScores: number;
    maxScores: number;
    startRank: number;
    endRank: number;
    startScores: number;
    endScores: number;
  };
  type PlayerProfileStatsWithDates = PlayerProfileStats & { startDate: string; endDate: string };

  interface PlayerProfileRanks {
    ranks: Array<PlayerChartEntry | null>;
    stats: PlayerProfileStats;
  }

  type ComparisonChartEntry = { scores: number; rank: number };
  type ComparisonChartEntryWithDate = ComparisonChartEntry & { date: string };
  interface ComparisonChartPlayer {
    id: string;
    name: string;
    country: string;
    ranks: ComparisonChartEntries;
    stats?: App.PlayerProfileStatsWithDates;
  }
  interface ComparisonChartAPI {
    [id: string]: Omit<ComparisonChartPlayer, "id">;
  }
  type ComparisonChartEntries = Array<ComparisonChartEntryWithDate | null>;
  type ComparisonChartPlayerCustomizable = Omit<ComparisonChartPlayer, "ranks"> & {
    color?: string;
    rankVisible?: boolean;
    scoresVisible?: boolean;
    stats: App.PlayerProfileStatsWithDates;
  };
  type ComparisonChartPlayerProcessed = { [id: string]: ComparisonChartEntry };
  type ComparisonChartEntryProcessed = { date: string; players: ComparisonChartPlayerProcessed };

  interface CountryRanking {
    country: string;
    total: number;
    players: number;
    average: number;
    weighted: number;
  }
  // for the first loop in the API endpoint, average and country name are set afterward
  interface CountryRankingAPI {
    country?: string;
    total: number;
    players: number;
    average?: number;
    weighted: number;
  }

  interface MostGainedRankingEntry {
    _id: number; //                                          osu! id
    rank: number; //                                         most gained rank (1-99)
    name: string;
    country: string;
    scores: number; //                                       number of scores total on the day after said gains
    gained: number; //                                       number of scores gained in 1 day
    date: string; //                                         as YYYY-MM-DD
  }

  interface RankingSettings {
    avatars: boolean; //                                     whether to display osu! avatars (default true)
    scoreDifferences: boolean; //                            (default false)
    perPage: number; //                                      number of players shown on one page (default 50)
    dateSticky: boolean; //                                  whether top date bar is sticky
    gainedDays: number; //                                   number of days to look back for gains ranking (default 1)
    countryFilter: Set<string>; //                           selected country codes, empty for all (not saved to local storage)
    rankFilter: { min: number; max: number }; //             rank range, 0 for any (not saved to local storage)
  }

  interface ApiParams {
    [name: string]: { type: string; optional?: boolean; description?: string };
  }

  interface RankingQuery {
    _id; //                                                  ranking entry date as YYYY-MM-DD string
    country?: { $in: string[] }; //                          2-uppercase-letter country code or "all"
    rank?: { $lte: number; $gte: number }; //                rankMin - rankMax
  }
}
