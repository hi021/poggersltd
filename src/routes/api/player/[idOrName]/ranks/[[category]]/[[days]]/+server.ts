// get scores from `category` from the last `days` days (defaults to 90)
// returns {ranks: Array<{rank: number, scores: number, day ([0 - (days - 1)] where 0 is most days ago): number} | null>, stats: {min & max ranks & scores}}
import { DEFAULT_API_HEADERS, getDaysBeforeDate, SCORE_CATEGORIES } from "$lib/util";
import { dbRankings, prepareAggregationProjectionForIdOrName } from "$lib/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, setHeaders }) => {
  const route = `player/${params.idOrName}/ranks/${params.category}/${params.days}`;
  console.time(route);
  setHeaders(DEFAULT_API_HEADERS);

  const scoreCategory = (params.category as App.RankingCategory) || "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  let days = Number(params.days);
  if (isNaN(days) || days < 1) days = 90;

  const datesToFetch = getDaysBeforeDate(days);
  const scoresArray = new Array<App.PlayerChartEntry>(days);
  const promises = new Array<Promise<any>>(days);
  const project = prepareAggregationProjectionForIdOrName(params.idOrName, scoreCategory);

  // this is kind of poop, honestly just iterate over the array after all promises resolve
  let hasNonNull = false; // set on first iteration that finds any stats
  let currentLastDay = days; // lowest iteration index so far (used for setting end scores & ranks)
  let currentEarliestDay = 0; // highest iteration index so far (used for setting start scores & ranks)
  let minRank = 0;
  let maxRank = 0;
  let minScores = 0;
  let maxScores = 0;
  let startRank = 0;
  let endRank = 0;
  let startScores = 0;
  let endScores = 0;
  for (let i = 0; i < days; i++) {
    const aggregate = [{ $match: { _id: datesToFetch[i] } }, project];

    promises[i] = new Promise(async (resolve) => {
      const resArray = await dbRankings.aggregate(aggregate).toArray();
      const player = resArray?.[0]?.[scoreCategory]?.[0];
      if (!player) {
        resolve(null);
        return;
      }

      scoresArray[i] = {
        rank: player.rank,
        scores: player.scores,
        day: days - i - 1
      };

      if (!hasNonNull) {
        minRank = maxRank = player.rank;
        minScores = maxScores = player.scores;
        hasNonNull = true;
      } else {
        if (minRank > player.rank) minRank = player.rank;
        else if (maxRank < player.rank) maxRank = player.rank;
        if (minScores > player.scores) minScores = player.scores;
        else if (maxScores < player.scores) maxScores = player.scores;
      }
      if (i < currentLastDay) {
        endRank = player.rank;
        endScores = player.scores;
        currentLastDay = i;
      } else if (i > currentEarliestDay) {
        startRank = player.rank;
        startScores = player.scores;
        currentEarliestDay = i;
      }

      resolve(player.scores);
    });
  }

  await Promise.all(promises);
  console.timeEnd(route);
  return hasNonNull
    ? json({
        ranks: scoresArray,
        stats: {
          minRank,
          maxRank,
          minScores,
          maxScores,
          startRank,
          endRank,
          startScores,
          endScores
        }
      })
    : json(null);
};
