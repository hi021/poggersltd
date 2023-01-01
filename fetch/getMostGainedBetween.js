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
const categories = ['top50']; //score categories to count
const outputDir = 'stats/most-gained-year.json';

//returns an object of arrays sorted descending by gains: {[category]: Array<{id, name, country, value, gained, avg}>}
//gained and avg will be null if player doesn't exist at startData
//used for osu! wrapped stats

const arr = {};
const arrFinal = {};
for (const i of categories) {
	arr[i] = {};
	arrFinal[i] = [];
}

const client = await MongoClient.connect(process.env.DB_URI);

const startData = await client
	.db(process.env.DB_NAME_RANKING)
	.collection(startDate)
	.find({ _id: { $in: categories } })
	.toArray();
if (!startData?.[0]?.ranking?.length) {
	console.warn('No data at start date');
	process.exit(1);
}

const endData = await client
	.db(process.env.DB_NAME_RANKING)
	.collection(endDate)
	.find({ _id: { $in: categories } })
	.toArray();
if (!endData?.[0]?.ranking?.length) {
	console.warn('No data at end date');
	process.exit(1);
}

for (const i of endData) {
	for (const j in i.ranking) {
		const plr = i.ranking[j];
		arr[i._id][plr._id] = { name: plr.name, country: plr.country, value: plr.value, gained: null };
	}
}
for (const i of startData) {
	for (const j in i.ranking) {
		const plr = i.ranking[j];
		if (!arr[i._id][plr._id]) continue; //player not in ranking on endDate

		arr[i._id][plr._id].gained = arr[i._id][plr._id].value - plr.value;
		arr[i._id][plr._id].avg = Math.round((arr[i._id][plr._id].gained / daysBetween) * 100) / 100;
	}
}

for (const cat in arr) {
	for (const id in arr[cat]) arrFinal[cat].push({ ...arr[cat][id], id });
}
for (const i in arrFinal) arrFinal[i].sort((a, b) => (a.gained < b.gained ? 1 : -1));

if (outputDir) writeFileSync(outputDir, JSON.stringify(arrFinal));
else console.log(arrFinal);

client.close();
