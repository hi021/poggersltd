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
  type AllRankingCategory = RankingCategory | "top100" | "top15"; // only saved in .jsons, not in database

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

  interface PlayerProfileRanks {
    ranks: Array<PlayerChartEntry | null>;
    stats: PlayerProfileStats;
  }

  type PlayersChartEntry = { scores: number; rank: number; date: string };
  interface PlayerChartRanks {
    [id: string]: {
      name: string;
      country: string;
      ranks: Array<PlayersChartEntry | null>;
      stats?: App.PlayerProfileStats;
    };
  }
  interface PlayerChartRanksWeb {
    id: string;
    name: string;
    country: string;
    ranks: Array<PlayersChartEntry | null>;
    stats?: App.PlayerProfileStats;
  }

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
  }

  interface RankingQuery {
    _id; //                                                  ranking entry date as YYYY-MM-DD string
    country?: { $eq: string }; //                            2-uppercase-letter country code or "all"
    rank?: { $lte: number; $gte: number }; //                rankMin - rankMax
  }
}
