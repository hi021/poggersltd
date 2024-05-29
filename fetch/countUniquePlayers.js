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
const categories = ['top50']; //score categories to count from
const outputDir = 'stats/unique-players.json';

//returns an object: {id: [username, country]}
//used for osu! wrapped stats

const collections = await getRankingCollections(startDate, endDate);

//sort ascending by date (to set nicks properly)
collections.sort((a, b) => (a.name < b.name ? -1 : 1));

const arr = {};
const client = await MongoClient.connect(process.env.DB_URI);

for (const n in collections) {
	console.log('Getting data for ' + collections[n].name);

	const dayData = await client
		.db(process.env.DB_NAME)
		.collection(collections[n].name)
		.find()
		.toArray();
	if (!dayData) continue;

	for (const cat of dayData) {
		if (!categories.includes(cat._id)) continue;

		for (const j in cat.ranking)
			arr[cat.ranking[j]._id] = [cat.ranking[j].name, cat.ranking[j].country];
	}
}

if (outputDir) writeFileSync(outputDir, JSON.stringify(arr));
else console.log(arr);

client.close();
