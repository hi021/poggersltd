// import * as path from 'path';
// import { fileURLToPath } from 'url';
// import { MongoClient } from 'mongodb';
// import { getRankingCollections } from './shared.js';
// import * as dotenv from 'dotenv';
// import { writeFileSync } from 'fs';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// const bottomRank = 15;
// const topRank = 1;
// const startDate = '';
// const endDate = 'Z';
// const categories = ['top50']; //score categories to count from
// const outputDir = 'stats/scores-for-rank.json';

// const client = await MongoClient.connect(process.env.DB_URI);

// const query = [{ $lte: ['$$ranking.rank', bottomRank] }, { $gte: ['$$ranking.rank', topRank] }];
// const pipeline = [
// 	{ $match: { _id: { $in: categories } } },
// 	{
// 		$project: {
// 			ranking: {
// 				$filter: {
// 					input: '$ranking',
// 					as: 'ranking',
// 					cond: { $and: query }
// 				}
// 			}
// 		}
// 	}
// ];

// const collections = await getRankingCollections(startDate, endDate);
// //sort ascending by date
// collections.sort((a, b) => (a.name < b.name ? -1 : 1));

// const arr = {};
// for (let i = topRank; i <= bottomRank; i++) arr[i] = [];

// for (const n in collections) {
// 	console.log('Getting data for ' + collections[n].name);
// 	const dayData = await client
// 		.db(process.env.DB_NAME)
// 		.collection(collections[n].name)
// 		.aggregate(pipeline)
// 		.toArray();
// 	//TODO: allow for multiple categories
// 	const rankingData = dayData?.[0]?.ranking;

// 	//fill with nulls if no data from that day
// 	if (!rankingData?.length) {
// 		console.log('No data!');
// 		for (let i = topRank; i <= bottomRank; i++) arr[i].push(null);
// 		continue;
// 	}

// 	for (const i in rankingData) arr[topRank + Number(i)].push(rankingData[i].value);
// }

// if (outputDir) writeFileSync(outputDir, JSON.stringify(arr));
// else console.log(arr);

// client.close();
