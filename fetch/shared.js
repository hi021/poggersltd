import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const categoriesDb = ['top50', 'top25', 'top8', 'top1']; //only the ones stored in db

export function formatDate(date) {
	if (!date) date = new Date();
	return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date
		.getUTCDate()
		.toString()
		.padStart(2, '0')}`;
}

export const getDaysBetweenDates = (d1, d2) => Math.floor((d1.getTime() - d2.getTime()) / 86400000);

//for nameKey field (username search index)
export function createNGram(str) {
	if (!str || str.length <= 3) return str;

	const minGram = 3;
	const maxGram = str.length;

	return str
		.split(' ')
		.reduce((ngrams, token) => {
			if (token.length > minGram) {
				for (let i = minGram; i <= maxGram && i <= token.length; ++i) {
					ngrams = [...ngrams, token.substr(0, i)];
				}
			} else {
				ngrams = [...ngrams, token];
			}
			return ngrams;
		}, [])
		.join(' ');
}

export async function getRankingEntries(start = '', end = 'Z') {
	const client = await MongoClient.connect(process.env.DB_URI);
	const allRankingEntries = await client
		.db(process.env.DB_NAME)
		.collection("rankings")
		.find()
		.toArray();

	if ((start && start > '2020-05-10') || end !== 'Z') {
		for (const n in allRankingEntries) {
			if (allRankingEntries[n]._id < start || allRankingEntries[n]._id > end) delete allRankingEntries[n];
		}
	}

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
			const result = await db.findOne({_id: curDate});

			if (result) break;
			const curDateCopy = new Date(curDate);
			curDateCopy.setDate(curDateCopy.getDate() - 1);
			curDate = curDateCopy;
			curDateString = formatDate(curDate);
		} catch (err) {
			console.log('Exception in getClosestPrevArchiveEntry:\n', err);
			return null;
		}
	}

	client.close();
	return daysLate > maxDaysLate ? null : { date: curDateString, daysLate };
}
