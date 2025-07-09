import { MongoClient } from "mongodb";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import * as path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

export const CATEGORY_NAMES = ["top50", "top25", "top8", "top1"]; // only the ones stored in db
export const RANKING_INDEXES = { _id: -1, rank: 1, country: -1, gainedScores: -1 }; // ranking collection indexes
export const PLAYER_INDEXES = { rank: 1, countryRank: 1 }; // players collection indexes
export const COUNTRY_CODES = [
  "US",
  "RU",
  "ID",
  "TW",
  "JP",
  "KR",
  "CN",
  "DE",
  "FR",
  "PL",
  "BR",
  "CL",
  "PH",
  "CA",
  "TH",
  "MX",
  "GB",
  "HK",
  "AR",
  "MY",
  "AU",
  "IT",
  "UA",
  "ES",
  "VN",
  "SG",
  "NL",
  "FI",
  "SE",
  "PE",
  "CO",
  "VE",
  "TR",
  "CZ",
  "BY",
  "BE",
  "NO",
  "PT",
  "AT",
  "HU",
  "RO",
  "DK",
  "KZ",
  "NZ",
  "LT",
  "CH",
  "IL",
  "UY",
  "EE",
  "GR",
  "BG",
  "EC",
  "SK",
  "LV",
  "MO",
  "SA",
  "RS",
  "CR",
  "IE"
];

/**
 * E.g. 'top50' -> '50'
 */
export function parseCategoryNumber(category) {
  return category.slice(3);
}

export function formatDate(date) {
  if (!date) date = new Date();
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date
    .getUTCDate()
    .toString()
    .padStart(2, "0")}`;
}

export const getDaysBetweenDates = (d1, d2) =>
  Math.floor((d1.getTime() - d2.getTime()) / 86400000 /* ms in day */);

export function compareByGivenFieldDescendingOrId(a, b, field) {
  return a[field] == b[field] ? a.id - b.id : b[field] - a[field];
}

/**
 * For `nameKey` field (username search index)
 */
export function createNGram(str) {
  if (!str || str.length <= 3) return str;

  const trimStr = str.replaceAll(/[^\d\w:]/g, "").trim();
  const theLessStr = trimStr.replaceAll(/^The/gi, "").trim();
  const minGram = 3;
  const maxGram = trimStr.length;

  return trimStr
    .split(" ")
    .reduce((ngrams, token) => {
      if (token.length > minGram) {
        for (let i = minGram; i <= maxGram && i <= token.length; ++i)
          ngrams = [...ngrams, token.substr(0, i)];
      } else {
        ngrams = [...ngrams, token];
      }

      return ngrams;
    }, [])
    .join(" ")
    .concat(theLessStr == trimStr ? "" : " " + createNGram(theLessStr));
}

/**
 * All ranking entries between start and end dates sorted oldest -> newest
 */
export async function getRankingEntries(start = "", end = "Z") {
  const client = await MongoClient.connect(process.env.DB_URI);
  const allRankingEntries = await client
    .db(process.env.DB_NAME)
    .collection("rankings")
    .find({ _id: { $gte: start, $lte: end } })
    .sort({ _id: 1 })
    .toArray();

  client.close();
  return allRankingEntries;
}

export async function getClosestPrevArchiveEntry(initialDate, daysBack = 1, maxDaysLate = 32) {
  const today = initialDate ? new Date(initialDate) : new Date();
  const todayCopy = new Date(today);
  todayCopy.setDate(todayCopy.getDate() - daysBack);
  let curDate = todayCopy;
  let curDateString = formatDate(curDate);
  let daysLate = 0;

  const client = await MongoClient.connect(process.env.DB_URI);
  const db = client.db(process.env.DB_NAME).collection("rankings");

  for (; daysLate <= maxDaysLate; daysLate++) {
    try {
      const result = await db.findOne({ _id: curDate });

      if (result) break;
      const curDateCopy = new Date(curDate);
      curDateCopy.setDate(curDateCopy.getDate() - 1);
      curDate = curDateCopy;
      curDateString = formatDate(curDate);
    } catch (err) {
      console.log("Exception in getClosestPrevArchiveEntry:\n", err);
      return null;
    }
  }

  client.close();
  return daysLate > maxDaysLate ? null : { date: curDateString, daysLate };
}
