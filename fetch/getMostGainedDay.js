import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { getRankingCollections } from './shared.js';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const startDate = '2022-01-01';
const endDate = '2022-12-31';
const categories = ['top50']; //score categories to count
const maxPlayers = 500;
const minGained = 60;
const outputDir = 'stats/most-gained-1day.json';

//returns an object {category: Array<{id, name, country, value, gained, date}>}
//used for osu! wrapped stats

const arr = {};
for (const i of categories) arr[i] = [];

const collections = await getRankingCollections(startDate, endDate);
const client = await MongoClient.connect(process.env.DB_URI);

for (const n in collections) {
	const date = collections[n].name;
	console.log('Getting data for ' + date);

	const dayData = await client
		.db(process.env.DB_NAME_RANKING)
		.collection(date)
		.find({ _id: { $in: categories } })
		.toArray();
	if (!dayData) continue;

	for (const i of dayData) {
		if (i.ranking[0].gainedDays) break; //only show day to day gains

		for (const j in i.ranking) {
			const plr = i.ranking[j];
			if (plr.gained >= minGained)
				arr[i._id].push({
					id: plr._id,
					name: plr.name,
					country: plr.country,
					value: plr.value,
					gained: plr.gained,
					date
				});
		}
	}
}

const arrFinal = {};
for (const i in arr) {
	arr[i].sort((a, b) => (a.gained < b.gained ? 1 : -1));
	arrFinal[i] = arr[i].slice(0, maxPlayers);
}

if (outputDir) writeFileSync(outputDir, JSON.stringify(arrFinal));
else console.log(arrFinal);

client.close();
