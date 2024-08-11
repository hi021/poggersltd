import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getDaysBeforeDate, SCORE_CATEGORIES } from "$lib/util";
import { dbRankings } from "$lib/db";

// TODO

// get scores from `category` from the last `days` days
// returns {ranks: Array<{rank: number, scores: number, day: number} | null>, rankStats: {...}}
export const GET: RequestHandler = async ({ params }) => {
  const category = params.category;
  if (!SCORE_CATEGORIES.includes(category)) throw error(400, "Invalid ranking score category");

  const playerId = parseInt(params.idOrName);
  let days = Number(params.days);
  if (isNaN(days) || days < 1) days = 90;

  const daysArray = getDaysBeforeDate(days);
  const scoresArray = new Array(days);
  const promises = new Array(days);
  const project = {
    $project: {
      [category]: {
        $filter: {
          input: "$" + category,
          as: "cat",
          cond: { $eq: isNaN(playerId) ? ["$$cat.name", params.idOrName] : ["$$cat._id", playerId] }
        }
      }
    }
  };

  console.log(project.$project[category].$filter);

  let hasNonNull = false;
  let minRank = 0;
  let maxRank = 0;
  let minValue = 0;
  let maxValue = 0;
  for (let i = 0; i < days; i++) {
    const aggregate = [
      {
        $match: { _id: daysArray[i] }
      },
      project
    ];

    promises[i] = new Promise(async (resolve, reject) => {
      try {
        const res = await dbRankings.aggregate(aggregate).toArray();

        const resPlayer = res?.[0]?.[params.category]?.[0];
        console.log(res, resPlayer);

        if (!resPlayer) {
          resolve(null);
          return;
        }

        scoresArray[i] = {
          rank: resPlayer.rank,
          value: resPlayer.scores,
          day: days - i - 1
        };

        if (!hasNonNull) {
          minRank = maxRank = resPlayer.rank;
          minValue = maxValue = resPlayer.scores;
        } else {
          if (minRank > resPlayer.rank) minRank = resPlayer.rank;
          else if (maxRank < resPlayer.rank) maxRank = resPlayer.rank;
          if (minValue > resPlayer.scores) minValue = resPlayer.scores;
          else if (maxValue < resPlayer.scores) maxValue = resPlayer.scores;
        }
        hasNonNull = true;

        resolve(1);
      } catch (e) {
        console.error("Failed to fetch archive:", e);
        reject(e);
      }
    });
  }

  try {
    await Promise.all(promises);
    return json({
      ranks: scoresArray,
      rankStats: { minRank, maxRank, minValue, maxValue }
    });
  } catch (e) {
    throw error(500, "Internal server error");
  }
};
