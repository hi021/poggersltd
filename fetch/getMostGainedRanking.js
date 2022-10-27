/* eslint-disable no-async-promise-executor */
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import fs from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function getRankingCollections(start = '', end = 'Z') {
	const client = await MongoClient.connect(process.env.DB_URI);
	const collections = await client
		.db(process.env.DB_NAME_RANKING)
		.listCollections(undefined, { nameOnly: true })
		.toArray();

	if ((start && start > '2020-05-10') || end !== 'Z') {
		for (const n in collections) {
			if (collections[n].name < start || collections[n].name > end) delete collections[n];
		}
	}

	client.close();
	return collections;
}

const collections = await getRankingCollections();

const client = await MongoClient.connect(process.env.DB_URI);
const db = client.db(process.env.DB_NAME_RANKING);
const dbOther = client.db(process.env.DB_NAME_OTHER);

//
const outputDir = 'archive-other/';
const arbitraryMin = { top50: 120, top25: 20, top8: 5, top1: 4 };
//
const scoreArr = { top50: [], top25: [], top8: [], top1: [] };

for (const i of collections) {
	const date = i.name;
	const dayData = await db.collection(date).find().toArray(); //Array<{_id: `category`, ranking: Array<...>}>
	for (const cat of dayData) {
		const category = cat._id;
		for (const plr of cat.ranking) {
			if (plr.gained && !plr.gainedDays && plr.gained >= arbitraryMin[category]) {
				delete plr.countryRank;
				delete plr.rank;
				delete plr.gainedRank;
				scoreArr[category].push({ ...plr, date });
			}
		}
	}
}

//sort and leave only up to `maxScores` elements
for (const cat in scoreArr) {
	scoreArr[cat].sort((a, b) => (a.gained < b.gained ? 1 : -1));
	scoreArr[cat] = scoreArr[cat].slice(0, process.env.MAX_MOST_GAINED);
	for (const j in scoreArr[cat]) {
		const plr = scoreArr[cat][j];
		plr.id = plr._id;
		plr._id = Number(j) + 1;
	}

	fs.writeFileSync(
		path.join(__dirname, outputDir, 'mostGained-' + cat + '.json'),
		JSON.stringify(scoreArr[cat])
	);
	await dbOther.collection('most-gained-' + cat).insertMany(scoreArr[cat]);
}

client.close();
