/* eslint-disable no-async-promise-executor */
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import {
	formatDate,
	getRankingCollections,
	getClosestPrevArchiveEntry,
	createNGram
} from './shared.js';
import * as dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const MIN_TOP100 = 1500;
export const MIN_TOP50 = 1000;
export const MIN_TOP25 = 500;
export const MIN_TOP15 = 300;
export const MIN_TOP8 = 150;
export const MIN_TOP1 = 15;
const MAX_PAGE = 100;

const api = 'https://osustats.respektive.pw/rankings/';
const categories = ['top100s', 'top50s', 'top25s', 'top15s', 'top8s', 'top1s'];
const categoriesMin = [MIN_TOP100, MIN_TOP50, MIN_TOP25, MIN_TOP15, MIN_TOP8, MIN_TOP1]; //lol whatever;
const categoriesSkip = ['top100', 'top15']; //categories not to upload to the db

//returns an array of formatted players from the API + country ranks
async function fetchCategory(category, minScores, maxPage = MAX_PAGE) {
	const url = api + category + '?page=';
	let page = 1;
	let lastMinScores = -1;
	const fullRes = [];
	const countries = new Map(); //for country ranks

	while (page <= maxPage) {
		try {
			const res = await fetch(url + page);
			const resJson = await res.json();
			const lb = resJson.leaderboard;
			if (!lb?.length) throw new Error('No results');

			for (const i in lb) {
				if (lb[i][category] < minScores) return fullRes;

				const player = formatAPIPlayer(lb[i], category);
				const country = player.country;
				if (countries.has(country)) countries.set(country, countries.get(country) + 1);
				else countries.set(country, 1);

				fullRes.push({ ...player, countryRank: countries.get(country) });
			}

			lastMinScores = lb[lb.length - 1][category];
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

//adds gained, gainedRank, and gainedDays (optionally) to the given fetched category array
async function setCategoryGains(categoryObject, category, gainsDate, gainsDaysLate = 0) {
	const client = await MongoClient.connect(process.env.DB_URI);
	const coll = client.db(process.env.DB_NAME).collection(gainsDate);
	const categoryData = (await coll.findOne({ _id: category })).ranking;
	client.close();

	const categoryDataMap = new Map();
	for (const i of categoryData) categoryDataMap.set(i._id, i);

	for (const i in categoryObject) {
		const curPlayer = categoryObject[i];
		const id = curPlayer._id;
		if (categoryDataMap.has(id)) {
			curPlayer.gained = curPlayer.value - categoryDataMap.get(id).value;
			curPlayer.gainedRank = categoryDataMap.get(id).rank - curPlayer.rank;
			if (gainsDaysLate) curPlayer.gainedDays = gainsDaysLate + 1;
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
console.log(
	`Fetching rankings for ${date} with gains from ${lastArchive?.date} (${lastArchive?.daysLate} day(s) late)...`
);

const client = await MongoClient.connect(process.env.DB_URI);
const coll = client.db(process.env.DB_NAME).collection(date);
const dbOther = client.db(process.env.DB_NAME);
const collPlayers = dbOther.collection('players');

const players = new Map(); //for players collection - _id: <player info>, <category stats (without mostGained, peak, and lowest)>
const mostGained = {}; //{[category]: Array<MostGainedRanking>}

//request api
for (const i in categories) {
	const cat = categories[i].slice(0, categories[i].length - 1); //top50s -> top50 etc.

	//populate mostGained
	if (!categoriesSkip.includes(cat))
		mostGained[cat] = await dbOther
			.collection('most-gained-' + cat)
			.find()
			.toArray();

	console.log('\n');
	console.time(cat);
	const categoryFetched = await fetchCategory(categories[i], categoriesMin[i]);
	console.timeEnd(cat);
	console.log(categoryFetched?.length + ' entries');

	try {
		const categoryWithGains =
			lastArchive && !categoriesSkip.includes(cat)
				? await setCategoryGains(categoryFetched, cat, lastArchive.date, lastArchive.daysLate)
				: categoryFetched;

		fs.writeFileSync(
			path.join(__dirname, 'archive', date, cat + '.json'),
			JSON.stringify(categoryWithGains)
		);
		if (categoriesSkip.includes(cat)) continue; //don't save top15s and top100s to database - no ranking

		let mostGainedCategory; //{name, _id, gained}, used to see if neccessary to update gains ranking
		//add to players database
		for (const plrFetched of categoryWithGains) {
			const plrData = players.get(plrFetched._id);
			const plrRankingData = {
				date,
				value: plrFetched.value,
				rank: plrFetched.rank,
				countryRank: plrFetched.countryRank,
				gained: plrFetched.gained,
				gainedRank: plrFetched.gainedRank
			};
			if (plrFetched.gainedDays) plrRankingData.gainedDays = plrFetched.gainedDays;

			if (!mostGainedCategory || plrFetched.gained > mostGainedCategory.gained)
				mostGainedCategory = {
					name: plrFetched.name,
					_id: plrFetched._id,
					gained: plrFetched.gained
				};

			//add category ranking data
			if (plrData) players.set(plrFetched._id, { ...plrData, [cat]: plrRankingData });
			else
				players.set(plrFetched._id, {
					_id: plrFetched._id,
					name: plrFetched.name,
					country: plrFetched.country,
					[cat]: plrRankingData
				});
		}

		console.log(
			`Most gained ${cat} was ${mostGainedCategory.gained} by ${mostGainedCategory.name}`
		);
		if (!mostGainedCategory.gained) {
			console.log("Assuming the API didn't update, stopping.");
			client.close();
			process.exit();
		}

		//update most gained ranking
		if (lastArchive.daysLate) {
			console.log(
				'Gains are ' + lastArchive.daysLate + ' day(s) late, skipping mostGained ranking'
			);
		} else {
			const mostGainedLen = mostGained[cat].length;
			const mostGainedLowest = mostGained[cat][mostGainedLen - 1].gained;
			if (mostGainedCategory.gained > mostGainedLowest) {
				for (const plr of categoryWithGains)
					if (plr.gained >= 4) mostGained[cat].push({ ...plr, date });

				mostGained[cat].sort((a, b) => (a.gained < b.gained ? 1 : -1));
				mostGained[cat] = mostGained[cat].slice(0, process.env.MAX_MOST_GAINED);
				//set data
				for (const i in mostGained[cat]) {
					const plr = mostGained[cat][i];

					plr.id = plr._id;
					plr._id = Number(i) + 1;
					delete plr.countryRank;
					delete plr.rank;
					delete plr.gainedRank;
				}

				console.log(`Inserting ${mostGained[cat].length} entries into mostGained ranking`);
				await dbOther.collection('most-gained-' + cat).deleteMany();
				await dbOther.collection('most-gained-' + cat).insertMany(mostGained[cat]);
			} else {
				console.log(
					`Lower than lowest ranked player in mostGained ranking (${mostGainedLowest}), skipping`
				);
			}
		}

		const insertRes = await coll.insertOne({ _id: cat, ranking: categoryWithGains });
		console.log('insert:', insertRes);
	} catch (e) {
		console.error('Failed to write:', e);
	}
}

try {
	console.log('\nUpdating players database...');
	const promises = [];

	let collections; //for changing usernames in past rankings

	let oldPlayers = 0;
	let newPlayers = 0;
	//playerCurrent is fetched from today, playerFromDatabase is the player from `players` collection
	for (const playerCurrent of Array.from(players.values())) {
		promises.push(
			new Promise(async (resolve) => {
				const _id = playerCurrent._id;
				delete playerCurrent._id; //don't insert a duplicate

				const playerFromDatabase = await collPlayers.findOne({ _id });
				let nameKey = playerFromDatabase?.nameKey;

				//check for name change
				if (playerFromDatabase && playerFromDatabase.name !== playerCurrent.name) {
					console.log(`Name change: ${playerFromDatabase.name} -> ${playerCurrent.name}`);
					nameKey = createNGram(playerCurrent.name);

					if (playerFromDatabase.oldName)
						playerCurrent.oldName = [
							...new Set([...playerFromDatabase.oldName, playerFromDatabase.name])
						];
					else playerCurrent.oldName = [playerFromDatabase.name];

					//replace names in older archive entries
					let entriesUpdated = 0;
					if (!collections) collections = await getRankingCollections();
					for (const i of collections) {
						//genuinely no clue how to do this properly, but this is fine since it only runs once a day
						const coll = client.db(process.env.DB_NAME).collection(i.name);
						//get all categories with the player from given date
						const findRes = await coll.find({ ranking: { $elemMatch: { _id } } }).toArray();

						if (findRes?.length) {
							for (const i in findRes) {
								//iterate over all players in all found categories
								for (const j in findRes[i].ranking) {
									const playerArchive = findRes[i].ranking[j];
									if (playerArchive._id === _id) {
										++entriesUpdated;
										playerArchive.name = playerCurrent.name;
										break;
									}
								}

								await coll.updateOne(
									{ _id: findRes[i]._id },
									{ $set: { ranking: findRes[i].ranking } }
								);
							}
						}
					}
					console.log(`Updated ${entriesUpdated} entries for ${playerCurrent.name}`);
				}
				if (!nameKey) nameKey = createNGram(playerCurrent.name);
				playerCurrent.nameKey = nameKey;

				//check mostGained, peak, and lowest
				for (const i of categories) {
					const cat = i.slice(0, i.length - 1); //top15s -> top15 etc.
					if (!playerCurrent[cat]) continue;

					//check mostGained			
					if (lastArchive?.daysLate === 0 && playerCurrent[cat].gained != null) {
						if (
							playerFromDatabase?.[cat]?.mostGained?.value == null ||
							playerFromDatabase[cat]?.mostGained?.value < playerCurrent[cat].gained
						)
							playerCurrent[cat].mostGained = { date, value: playerCurrent[cat].gained };
					}
					//set from database if no change
					if (playerCurrent[cat].mostGained?.value == null)
						playerCurrent[cat].mostGained = playerFromDatabase?.[cat]?.mostGained;

					//check for peak and lowest
					const o = { date, value: playerCurrent[cat].value };
					if (
						playerFromDatabase?.[cat]?.peak?.value == null ||
						playerFromDatabase[cat].peak.value < playerCurrent[cat].value
					)
						playerCurrent[cat].peak = o;
					if (
						playerFromDatabase?.[cat]?.lowest?.value == null ||
						playerFromDatabase[cat].lowest.value > playerCurrent[cat].value
					)
						playerCurrent[cat].lowest = o;

					//set from database if no change
					if (playerCurrent[cat].peak?.value == null)
						playerCurrent[cat].peak = playerFromDatabase?.[cat]?.peak;
					if (playerCurrent[cat].lowest?.value == null)
						playerCurrent[cat].lowest = playerFromDatabase?.[cat]?.lowest;
				}

				const updateRes = await collPlayers.updateOne(
					{ _id },
					{ $set: playerCurrent },
					{ upsert: true }
				);

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
