import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { getDaysBetweenDates } from './shared.js';
import * as dotenv from 'dotenv';
import glob from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const inputDir = path.resolve(__dirname, 'archive-old');
const outputDir = path.resolve(__dirname, 'archive-new');

try {
	const client = await MongoClient.connect(process.env.DB_URI);
	const playersDatabase = await client
		.db(process.env.DB_NAME_OTHER)
		.collection('players')
		.find()
		.toArray();
	const playersMap = new Map();
	for (const i of playersDatabase) playersMap.set(i._id, i);

	const globRes = glob.sync(inputDir + '\\*.json');
	const inputDirLen = inputDir.length;

	let prevDate = '';
	let prevPlayers;

	for (const i of globRes) {
		const date = i.slice(inputDirLen + 1, inputDirLen + '2022-01-01'.length + 1); //inputDirLen + 1 because of the slash
		console.log('Converting ' + date);
		const fileJson = JSON.parse(fs.readFileSync(i));
		const fileConverted = new Array(fileJson.length);

		const dateDiff = prevDate ? getDaysBetweenDates(new Date(date), new Date(prevDate)) : 0;
		if (dateDiff > 1) console.log('Date difference for gains is ' + dateDiff);
		const players = new Map();

		for (const j in fileJson) {
			const plr = fileJson[j];
			const _id = plr._id;

			//get current name from playersDatabase
			const curName = playersMap.get(_id)?.name;
			const plrConverted = {
				_id,
				name: curName || plr.nam,
				rank: plr.pos,
				country: plr.cntr,
				countryRank: plr.cntrPos,
				value: plr.t50
			};

			//set gains because older jsons don't have them
			const prevPlr = prevPlayers && prevPlayers.get(_id);
			if (prevPlr) {
				const prevValue = prevPlr.value;
				const prevRank = prevPlr.rank;
				plrConverted.gained = prevValue ? plr.t50 - prevValue : undefined;
				plrConverted.gainedRank = prevRank ? prevRank - plr.pos : undefined; //reversed because (+1 is 100 -> 99 etc.)
				if (dateDiff > 1) plrConverted.gainedDays = dateDiff;
			}

			players.set(plr._id, plrConverted);
			fileConverted[j] = plrConverted;
		}

		const dirPath = path.join(outputDir, date);
		if (fs.existsSync(dirPath)) console.log('Directory exists, skipping writing');
		else {
			fs.mkdirSync(dirPath);
			fs.writeFileSync(path.join(dirPath, 'top50.json'), JSON.stringify(fileConverted));
		}

		const coll = client.db(process.env.DB_NAME_RANKING).collection(date);
		const insertRes = await coll.insertOne({ _id: 'top50', ranking: fileConverted });
		console.log(insertRes);
		await coll.createIndexes([
			{ key: { 'ranking._id': -1 } },
			{ key: { 'ranking.country': -1 } },
			{
				key: { 'ranking.rank': 1 }
			},
			{ key: { 'ranking.gained': -1 } },
			{ key: { 'ranking.countryRank': -1 } }
		]);

		prevDate = date;
		prevPlayers = players;
	}

	client.close();
} catch (e) {
	console.error(e);
	process.exit(1);
}
