// get scores from `category` from the last `days` days (defaults to 90)
// returns {ranks: Array<{rank: number, scores: number, day (0 - `days` where 0 is earliest): number} | null>, stats: {min & max ranks & scores}}
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDaysBeforeDate, SCORE_CATEGORIES } from "$lib/util";
import { dbRankings } from "$lib/db";

export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = params.category || "top50";
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  const playerId = parseInt(params.idOrName);
  let days = Number(params.days);
  if (isNaN(days) || days < 1) days = 90;

  const datesToFetch = getDaysBeforeDate(days);
  const scoresArray = new Array(days);
  const promises = new Array(days);
  const project = {
    $project: {
      [scoreCategory]: {
        $filter: {
          input: "$" + scoreCategory,
          as: "cat",
          cond: {
            $eq: isNaN(playerId) ? ["$$cat.name", params.idOrName] : ["$$cat._id", playerId]
          }
        }
      }
    }
  };

  let hasNonNull = false; // set on first iteration that finds any stats
  let minRank = 0;
  let maxRank = 0;
  let minScores = 0;
  let maxScores = 0;
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
      } else {
        if (minRank > player.rank) minRank = player.rank;
        else if (maxRank < player.rank) maxRank = player.rank;
        if (minScores > player.scores) minScores = player.scores;
        else if (maxScores < player.scores) maxScores = player.scores;
      }
      hasNonNull = true;

      resolve(1);
    });
  }

  try {
    await Promise.all(promises);
    return hasNonNull
      ? json({
          ranks: scoresArray,
          stats: { minRank, maxRank, minScores, maxScores }
        })
      : json(null);
  } catch (e) {
    throw error(500, "Failed to fetch player ranks");
  }
};
