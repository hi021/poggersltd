declare namespace App {
  // Database structure:
  // DATABASE poggersltd
  //    COLLECTION rankings | index by: _id, country, rank, countryRank, gainedScores
  //      DOCUMENT every ranking date:  {_id: date, top50: RankingEntry[], ..., top1: RankingEntry[]}
  //    COLLECTION players  | index by: _id, name, country, oldName for searching, rank and countryRank per category for fetching
  //      DOCUMENT every player         {...PlayerInfo, top50: PlayerRanking, ..., top1: PlayerRanking}
  //    COLLECTION other    |

  type RankingCategory = "top50" | "top25" | "top8" | "top1";
  type AllRankingCategory = RankingCategory | "top100" | "top15"; //only saved in .jsons, not in database

  interface PlayerInfoCommon {
    _id: number; //osu! id
    name: string; //current osu! username
    country: string; //uppercase 2-letter country code
  }
  type PlayerInfoFull = PlayerInfoCommon & {
    nameKey: string; //n-gram index for searching by partial usernames (e.g. wim wimp wimpn)
    oldName?: string[]; //set of all previous osu! usernames (saved as array)
  };
  interface PlayerRankingCommon {
    rank: number; //global rank in given ranking category
    scores: number; //amount of scores in given ranking category
    countryRank: number;
    gainedScores?: number; //amount of scores gained in the last `gainedDays` days, undefined if not in previous ranking archive
    gainedRanks?: number; //amount of ranks gained in the last `gainedDays` days, undefined if not in previous ranking archive
    gainedDays?: number; //days since previous ranking entry, defaults to 1, only set otherwise in case of a gap in archive entries
  }
  type PlayerRankingFull = PlayerRankingCommon & {
    date: string; //YYYY-MM-DD day from which the data was taken
    mostGained?: { date: string; value: number }; //most gained in one day (when and how much) - ignores days when gainedDays > 1
    peak?: { date: string; value: number };
    lowest?: { date: string; value: number };
  };
  type Player = PlayerInfoFull & {
    [ranking in RankingCategory]?: PlayerRankingFull;
  };

  type RankingEntry = PlayerInfoCommon & PlayerRankingCommon;

  interface CountryRanking {
    country: string;
    total: number;
    players: number;
    average: number;
    weighted: number;
  }
  // for the first loop in the API endpoint, average and country name get set afterward
  interface CountryRankingAPI {
    country?: string;
    total: number;
    players: number;
    average?: number;
    weighted: number;
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
    avatars: boolean; //true by default
    scoreDifferences: boolean; //false by default
    perPage: number; //players per page
  }

  interface RankingQuery {
    _id: any; //YYYY-MM-DD string entry date
    country?: { $eq: string }; //2 uppercase letter country code or "all"
    rank?: { $lte: number; $gte: number }; //rankMin - rankMax
  }
}
