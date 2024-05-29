
// CONVERT ALL JSONS IN V2 FORMAT (old poggers.ltd - the react one) INTO CURRENT V3.1 FORMAT
// INPUT ./archive-old/ -> OUTPUT ./archive-new/

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import { getDaysBetweenDates } from './shared.js';
import * as dotenv from 'dotenv';
import * as glob from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

//change to POSIX paths to use with glob
const inputDir = path.resolve(__dirname, 'archive-old').replace(/\\/g, "/");
const outputDir = path.resolve(__dirname, 'archive-new').replace(/\\/g, "/");

try {
	const client = await MongoClient.connect(process.env.DB_URI);
	const playersDatabase = await client
		.db(process.env.DB_NAME)
		.collection('players')
		.find()
		.toArray();
	
	// load all players from the db into Map<osu! id, player object> to get current names from later
	const playersMap = new Map();
	for (const i of playersDatabase) playersMap.set(i._id, i);

	const globRes = glob.globSync(inputDir + '/*.json');
	const inputDirLen = inputDir.length;
	const inputFileLen = '/2022-01-01'.length;
	console.log("Found " + globRes.length + " file(s)")
	
	let prevDate = ''; // last read date - used to set gains
	let prevPlayers; // ?? - used to set gains
	// read all jsons from archive-old
	for (const i of globRes) {
		const date = i.slice(inputDirLen + 1, inputDirLen + inputFileLen);
		console.log('Converting ' + date);
		const fileJson = JSON.parse(fs.readFileSync(i));
		const convertedPlayersArr = new Array(fileJson.length);

		const dateDiff = prevDate ? getDaysBetweenDates(new Date(date), new Date(prevDate)) : 0;
		if (dateDiff > 1) console.log('Date difference for gains is ' + dateDiff);
		const convertedPlayersMap = new Map();

		for (const j in fileJson) {
			const plr = fileJson[j];
			const _id = plr._id;

			// get current name from playersDatabase, otherwise set from read file
			const curName = playersMap.get(_id)?.name;
			const plrConverted = {
				_id,
				name: curName || plr.nam,
				rank: plr.pos,
				country: plr.cntr,
				countryRank: plr.cntrPos,
				scores: plr.t50
			};

			// set gains because older jsons don't have them (can also do with a different script afterwards)
			const prevPlr = prevPlayers?.get(_id);
			if (prevPlr) {
				const prevValue = prevPlr.scores;
				const prevRank = prevPlr.rank;
				plrConverted.gainedScores = prevValue ? plr.t50 - prevValue : undefined;
				plrConverted.gainedRanks = prevRank ? prevRank - plr.pos : undefined; //reversed because (+1 is like 100 -> 99 for ranks)
				if (dateDiff > 1) plrConverted.gainedDays = dateDiff;
			}

			convertedPlayersMap.set(plr._id, plrConverted);
			convertedPlayersArr[j] = plrConverted;
		}

		const convertedFile = {top50: convertedPlayersArr};
		const outPath = path.join(outputDir, date + ".json");
		if (fs.existsSync(outPath)) console.log('File already exists, skipping writing');
		else fs.writeFileSync(outPath, JSON.stringify(convertedFile));

		const coll = client.db(process.env.DB_NAME).collection("rankings");
		const insertRes = await coll.insertOne({ _id: date, ...convertedFile });
		console.log(insertRes);
		await coll.createIndexes([
			{ key: { 'top50._id': -1 } },
			{ key: { 'top50.rank': 1 } },
			{ key: { 'top50.country': -1 } },
			{ key: { 'top50.countryRank': -1 } },
			{ key: { 'top50.gainedScores': -1 } }
		]);

		prevDate = date;
		prevPlayers = convertedPlayersMap;
	}

	client.close();
} catch (e) {
	console.error(e);
	process.exit(1);
}
