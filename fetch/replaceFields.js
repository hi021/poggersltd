/* eslint-disable no-async-promise-executor */
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { getRankingCollections } from './shared.js';
import * as dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const fieldReplaced = 'id';
const fieldReplacing = '_id';
const collections = await getRankingCollections();

const client = await MongoClient.connect(process.env.DB_URI);
const db = client.db(process.env.DB_NAME);
const promises = [];
//swapping field names
for (const i of collections) {
	const coll = db.collection(i.name);
	promises.push(
		new Promise(async (resolve, reject) => {
			try {
				const replaced = await coll.find().toArray();
				console.log('Replacing in ' + i.name);

				for (const j in replaced) {
					const categoryObj = replaced[j]; //{_id:, ranking: []}
					const rankingArr = categoryObj.ranking;
					for (const i in rankingArr) {
						const field = rankingArr[i][fieldReplaced];
						delete rankingArr[i][fieldReplaced];

						rankingArr[i][fieldReplacing] = field;
					}
				}

				await coll.deleteMany({});
				await coll.insertMany(replaced);

				resolve(1);
			} catch (e) {
				reject(e);
			}
		})
	);
}

try {
	await Promise.all(promises);
} catch (e) {
	console.error(e);
}

client.close();
