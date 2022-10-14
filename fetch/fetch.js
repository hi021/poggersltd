/* eslint-disable no-async-promise-executor */
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

//util
function formatDate(date) {
	if (!date) date = new Date();
	return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date
		.getUTCDate()
		.toString()
		.padStart(2, '0')}`;
}

//for nameKey field (username search index)
function createNGram(str) {
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
//util

export const MIN_TOP50 = 1000;
export const MIN_TOP25 = 500;
export const MIN_TOP15 = 300;
export const MIN_TOP8 = 150;
export const MIN_TOP1 = 15;
const MAX_PAGE = 100;

const api = 'https://osustats.respektive.pw/rankings/';
const categories = ['top50s', 'top25s', 'top15s', 'top8s', 'top1s'];
const categoriesMin = [MIN_TOP50, MIN_TOP25, MIN_TOP15, MIN_TOP8, MIN_TOP1]; //lol whatever;

async function getClosestPrevArchiveEntry(initialDate, daysBack = 1, maxDaysLate = 32) {
	const today = initialDate ? new Date(initialDate) : new Date();
	const todayCopy = new Date(today);
	todayCopy.setDate(todayCopy.getDate() - daysBack);
	let curDate = todayCopy;
	let curDateString = formatDate(curDate);
	let daysLate = 0;

	const client = await MongoClient.connect(process.env.DB_URI);
	const db = client.db(process.env.DB_NAME_RANKING);

	for (; daysLate <= maxDaysLate; daysLate++) {
		try {
			const curCollection = db.collection(curDateString);
			const result = await curCollection.findOne();

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

async function fetchCategory(category, minScores, maxPage = MAX_PAGE) {
	const url = api + category + '?page=';
	let page = 1;
	let lastMinScores = -1;
	const fullRes = [];
	const countries = new Map();

	while (page <= maxPage) {
		try {
			const res = await fetch(url + page);
			const resJson = await res.json();
			if (!resJson?.length) throw new Error('No results');

			for (const i in resJson) {
				if (resJson[i][category] < minScores) return fullRes;

				const player = formatAPIPlayer(resJson[i], category);
				const country = player.country;
				if (countries.has(country)) countries.set(country, countries.get(country) + 1);
				else countries.set(country, 1);

				fullRes.push({ ...player, countryRank: countries.get(country) });
			}

			lastMinScores = resJson[resJson.length - 1][category];
			++page;
		} catch (e) {
			console.error(
				`Failed to fetch ${category} (page ${page}, lastMinScores ${lastMinScores}):`,
				e
			);
			return null;
		}
	}

	return fullRes;
}

function formatAPIPlayer(player, category) {
	return {
		_id: player.user_id,
		name: player.username,
		country: player.country,
		value: player[category],
		rank: player.rank
	};
}

async function setCategoryGains(categoryObject, category, gainsDate, gainsDaysLate = 0) {
	const client = await MongoClient.connect(process.env.DB_URI);
	const coll = client.db(process.env.DB_NAME_RANKING).collection(gainsDate);
	const categoryData = (await coll.findOne({ _id: category })).ranking;
	client.close();

	const categoryDataMap = new Map();
	for (const i of categoryData) categoryDataMap.set(i._id, i);

	for (const i in categoryObject) {
		const id = categoryObject[i]._id;
		if (categoryDataMap.has(id)) {
			categoryObject[i].gained = categoryObject[i].value - categoryDataMap.get(id).value;
			categoryObject[i].gainedRank = categoryDataMap.get(id).rank - categoryObject[i].rank;
			if (gainsDaysLate) categoryObject[i].gainedDays = gainsDaysLate + 1;
		}
	}

	return categoryObject;
}

//MAIN
//TODO: app parameters, handle forceful overwrite
const date = formatDate();
try {
	fs.mkdirSync(path.resolve(__dirname, 'archive', date));
} catch (e) {
	console.error('Failed to create date directory:', e);
	process.exit(1);
}

const lastArchive = await getClosestPrevArchiveEntry();
console.log(`Fetching rankings for ${date} with gains from ${lastArchive?.date}`);

const client = await MongoClient.connect(process.env.DB_URI);
const coll = client.db(process.env.DB_NAME_RANKING).collection(date);
const collPlayers = client.db(process.env.DB_NAME_OTHER).collection('players');

const players = new Map(); //for players database

//request api
for (const i in categories) {
	const cat = categories[i].slice(0, categories[i].length - 1);

	console.time(cat);
	const res = await fetchCategory(cat + 's', categoriesMin[i]);
	console.timeEnd(cat);
	console.log(res?.length + ' entries');

	try {
		const resGain =
			lastArchive && cat !== 'top15'
				? await setCategoryGains(res, cat, lastArchive.date, lastArchive.daysLate)
				: res;

		fs.writeFileSync(path.join(__dirname, 'archive', date, cat + '.json'), JSON.stringify(resGain));
		if (cat === 'top15') continue; //don't save top15s to database - no ranking

		for (const i of resGain) {
			const data = players.get(i._id);
			const playerRanking = {
				date,
				value: i.value,
				rank: i.rank,
				countryRank: i.countryRank,
				gained: i.gained,
				gainedRank: i.gainedRank
			};
			if (i.gainedDays) playerRanking.gainedDays = i.gainedDays;

			if (data) players.set(i._id, { ...data, [cat]: playerRanking });
			else
				players.set(i._id, { _id: i._id, name: i.name, country: i.country, [cat]: playerRanking });
		}

		const insertRes = await coll.insertOne({ _id: cat, ranking: resGain });
		console.log(insertRes);
	} catch (e) {
		console.error('Failed to write:', e);
	}
}

try {
	console.log('Updating players database');
	const promises = [];

	let oldPlayers = 0;
	let newPlayers = 0;
	for (const player of Array.from(players.values())) {
		promises.push(
			new Promise(async (resolve) => {
				const _id = player._id;
				delete player._id; //don't insert a duplicate

				//check for name change
				const playerOld = await collPlayers.findOne(
					{ _id },
					{ projection: { name: 1, oldName: 1 } }
				);
				let nameKey = playerOld?.nameKey;
				if (playerOld && playerOld.name !== player.name) {
					console.log(`Name change: ${playerOld.name} -> ${player.name}`);
					nameKey = createNGram(player.name);

					if (playerOld.oldName)
						player.oldName = [...new Set([...playerOld.oldName, playerOld.name])];
					else player.oldName = [playerOld.name];
				}
				if (!nameKey) nameKey = createNGram(player.name);
				player.nameKey = nameKey;

				const updateRes = await collPlayers.updateOne({ _id }, { $set: player }, { upsert: true });

				if (updateRes.matchedCount === 0) ++newPlayers;
				else ++oldPlayers;
				resolve(1);
			})
		);
	}

	await Promise.all(promises);
	console.log('Existing: ' + oldPlayers, 'new: ' + newPlayers);
} catch (e) {
	console.error('Failed to update players database:', e);
}

try {
	console.log('Creating database indexes');
	await coll.createIndexes([
		{ key: { 'ranking._id': -1 } },
		{ key: { 'ranking.country': -1 } },
		{
			key: { 'ranking.rank': 1 }
		},
		{ key: { 'ranking.gained': -1 } },
		{ key: { 'ranking.countryRank': -1 } }
	]);

	await collPlayers.createIndexes([
		{
			key: { nameKey: 'text' },
			defaultLanguage: 'english'
		},
		{ key: { country: -1 } },
		{ key: { 'top50.rank': 1 } },
		{ key: { 'top50.countryRank': 1 } },
		{ key: { 'top25.rank': 1 } },
		{ key: { 'top25.countryRank': 1 } },
		{ key: { 'top8.rank': 1 } },
		{ key: { 'top8.countryRank': 1 } },
		{ key: { 'top1.rank': 1 } },
		{ key: { 'top1.countryRank': 1 } }
	]);
} catch (e) {
	console.error('Failed to set database indexes:', e);
}

client.close();
