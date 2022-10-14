// https://kit.svelte.dev/docs/types#app
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}

	type RankingCategory = 'top50' | 'top25' | 'top8' | 'top1'; //also have top15s saved in files
	//playersdb - simply hold every player (as Player type) with current PlayerRankings for every Ranking category
	//index by _id, name, country, oldName for searching, rank and countryRank for every category for fetching
	interface PlayerInfoCommon {
		_id: number; //osu! id
		name: string; //current osu! username
		country: string; //uppercase 2-letter country code
	}
	type PlayerInfoFull = PlayerInfoCommon & {
		nameKey: string /*n-gram index for searching by partial usernames (e.g. wim wimp wimpn)*/;
		oldName?: string[] /*all previous osu! usernames*/;
	};
	interface PlayerRanking {
		date: string; //YYYY-MM-DD day from which the data was taken
		value: number; //amount of scores
		rank: number; //global rank in given scores ranking
		countryRank: number;
		gained?: number; //amount of scores gained in the last `gainedDays` days, undefined if not in previous ranking archive
		gainedRank?: number; //amount of ranks gained in the last `gainedDays` days, undefined if not in previous ranking archive
		gainedDays?: number; //defaults to 1, only set in case of a gap in archive entries
	}
	type Player = PlayerInfoFull & { [ranking in RankingCategory]?: PlayerRanking };

	//rankingdb - for every date have 4 RankingCategory objects with a Ranking type for every player {_id: "top50", ranking: Ranking[]}
	//index by id, country, rank, countryRank, gained
	type Ranking = PlayerInfoCommon & Omit<PlayerRanking, 'date'>;
}
