
// returns an object of arrays sorted descending by gains: {[category]: Array<{id, name, country, value, gained, avg}>}
// gained and avg will be null if player doesn't exist at startData
// used for osu! wrapped stats

import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { getDaysBetweenDates } from './shared.js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const startDate = '2022-01-01';
const endDate = '2023-01-01';
const daysBetween = getDaysBetweenDates(new Date(endDate), new Date(startDate));
const categories = {top50: 1}; // ranking categories to count (mongo projection)
const outputDir = 'stats/most-gained-year.json';

// initialize arrays with necessary categories
const arr = {};
const arrFinal = {};
for (const cat of categories) {
	arr[cat] = {};
	arrFinal[cat] = [];
}

const client = await MongoClient.connect(process.env.DB_URI);
const coll = client.db(process.env.DB_NAME).collection("rankings");

const startData = await coll
	.find({ _id: startDate }, {projection: categories})
	.toArray();
const endData = await coll
	.find({ _id: endDate }, {projection: categories})
	.toArray();

for(const cat of categories) {
	if(!startData?.[cat]) {
		console.warn(`No data on start date (${startDate})!`);
		process.exit(1);
	}
	if(!endData?.[cat]) {
		console.warn(`No data on end date (${endDate})!`);
		process.exit(1);
	}
}

for (const cat of endData) {
	if(cat == "_id") continue;
	for (const p in cat) {
		const plr = cat[p];
		arr[cat][plr._id] = { name: plr.name, country: plr.country, scores: plr.scores, gainedScores: null };
	}
}

for (const cat of startData) {
	if(cat == "_id") continue;
	for (const p in cat) {
		const plr = cat[p];
		if(!arr[cat][plr._id]) continue; // player not in ranking on endDate

		arr[cat][plr._id].gainedScores = arr[cat][plr._id].scores - plr.scores;
		arr[cat][plr._id].avg = Math.round((arr[cat][plr._id].gainedScores / daysBetween) * 100) / 100;
	}
}

for (const cat in arr)
	for (const plrId in arr[cat]) arrFinal[cat].push({ ...arr[cat][plrId], id: plrId });
for (const cat in arrFinal)
	arrFinal[cat].sort((a, b) => (a.gainedScores < b.gainedScores ? 1 : -1));

if (outputDir) writeFileSync(outputDir, JSON.stringify(arrFinal));
else console.log(arrFinal);

client.close();
