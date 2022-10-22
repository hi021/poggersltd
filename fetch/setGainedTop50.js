import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import glob from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const getDaysBetweenDates = (d1, d2) => Math.floor((d1.getTime() - d2.getTime()) / 86400000);

const inputDir = path.resolve(__dirname, 'archive-pregains');
const outputDir = path.resolve(__dirname, 'archive-aftergains');

//works on converted files (v3)
//gets all jsons in order and sets gained, gainedRank, and gainedDays fields
//saves all jsons and attempts to add them to the db
//was used to fix gains not being set properly on days between v2 and v3
try {
	const client = await MongoClient.connect(process.env.DB_URI);

	const globDirectories = glob.sync(inputDir + '\\20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]\\top50.json');
	const inputDirLen = inputDir.length;

	let prevDate = '';
	let prevPlayers;

	for (const i of globDirectories) {
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

			//set gains
			const prevPlr = prevPlayers?.get(_id);
			if (prevPlr) {
				const prevValue = prevPlr.value;
				const prevRank = prevPlr.rank;
				plr.gained = prevValue ? plr.value - prevValue : undefined;
				plr.gainedRank = prevRank ? prevRank - plr.rank : undefined; //reversed because (+1 is 100 -> 99 etc.)
				if (dateDiff > 1) plr.gainedDays = dateDiff;
			}

			players.set(plr._id, plr);
			fileConverted[j] = plr;
		}

		const outputPath = path.join(outputDir, date);
		if (fs.existsSync(outputPath)) console.log('Directory exists, skipping writing');
		else {
			fs.mkdirSync(outputPath);
			fs.writeFileSync(path.join(outputPath, 'top50.json'), JSON.stringify(fileConverted));
		}

		const coll = client.db(process.env.DB_NAME_RANKING).collection(date);
		const insertRes = await coll.updateOne(
			{ _id: 'top50' },
			{ $set: { ranking: fileConverted } },
			{ $upsert: true }
		);
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