/* eslint-disable no-async-promise-executor */
import { error } from "@sveltejs/kit";
import { DB_URI, DB_NAME } from "$env/static/private";
import { MongoClient } from "mongodb";
import type { RequestHandler } from "./$types";
import { getDaysBeforeDate, SCORE_CATEGORIES } from "$lib/util";

// TODO

//get `category` count from last `days`
//returns Array<{rank, value, day}> with length of `days`
export const GET: RequestHandler = async ({ params }) => {
  const scoreCategory = params.category;
  if (!SCORE_CATEGORIES.includes(scoreCategory)) throw error(400, "Invalid ranking score category");

  let days = Number(params.days);
  if (isNaN(days) || days < 1) days = 90;
  const daysArray = getDaysBeforeDate(days);

  const playerId = Number(params.idOrName); //must be id!

  const client = await MongoClient.connect(DB_URI);
  const db = client.db(DB_NAME);
  const scoresArray = new Array(days);
  const promises = new Array(days);
  const project = {
    $project: {
      ranking: {
        $filter: {
          input: "$ranking",
          as: "ranking",
          cond: {
            $eq: ["$$ranking._id", playerId]
          }
        }
      }
    }
  };
  const aggregate = [
    {
      $match: {
        _id: params.category
      }
    },
    project
  ];

  let hasNonNull = false;
  let minRank = 0;
  let maxRank = 0;
  let minValue = 0;
  let maxValue = 0;
  for (let i = 0; i < days; i++) {
    promises[i] = new Promise(async (resolve, reject) => {
      try {
        const res = (await db.collection(daysArray[i]).aggregate(aggregate).toArray())?.[0]
          ?.ranking?.[0];
        if (!res) {
          resolve(null);
          return;
        }

        scoresArray[i] = {
          rank: res.rank,
          value: res.value,
          day: days - i - 1
        };

        if (!hasNonNull) {
          minRank = maxRank = res.rank;
          minValue = maxValue = res.value;
        } else {
          if (minRank > res.rank) minRank = res.rank;
          else if (maxRank < res.rank) maxRank = res.rank;
          if (minValue > res.value) minValue = res.value;
          else if (maxValue < res.value) maxValue = res.value;
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
    return new Response(
      JSON.stringify({
        ranks: scoresArray,
        rankStats: { minRank, maxRank, minValue, maxValue }
      })
    );
  } catch (e) {
    throw error(500, "Internal server error");
  }
};
