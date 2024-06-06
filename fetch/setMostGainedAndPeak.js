
// works on v3 files with set gains and gainsDays
// needs an up to date players database
// used for setting mostGained, peak, and lowest fields for all ranking categories
// saves the player json and attempts to update the db

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import glob from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const inputDir = path.resolve(__dirname, 'archive');
const outputDir = path.resolve(__dirname, 'archive-afterpeaks');
const categoriesSkip = ['top100', 'top15']; //categories not in the db

//works on v3 files with set gains and gainsDays
//also needs an up to date players database
//used to set mostGained, peak, and lowest fields for all categories
//saves the player json and attempts to update the db
try {
	const client = await MongoClient.connect(process.env.DB_URI);
	const plrColl = client.db(process.env.DB_NAME_OTHER).collection('players');

	const playersDatabase = await plrColl.find().toArray();
	const playersMap = new Map();
	for (const i of playersDatabase) playersMap.set(i._id, i);

	const globFiles = glob.sync(inputDir + '\\20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]\\top*.json');

	for (const i of globFiles) {
		const split = i.split('/'); //path.sep didn't work on windows lol
		const date = split[split.length - 2];
		const categoryRaw = split[split.length - 1];
		const category = categoryRaw.slice(0, categoryRaw.length - '.json'.length);
		if (categoriesSkip.includes(category)) continue; //skip categories not in the database
		console.log(`Checking ${category} on ${date}`);

		const fileJson = JSON.parse(fs.readFileSync(i));

		for (const j in fileJson) {
			const plr = fileJson[j];
			const _id = plr._id;
			const plrFromDatabase = playersMap.get(_id);
			if (!plrFromDatabase) {
				console.warn(`${plr.name} (${_id}) is not in the database!`);
				continue;
			}

			let change = false;
			const plrFromDatabaseCategory = plrFromDatabase[category];
			if (!plrFromDatabaseCategory) continue;

			//only set mostGained for days without gaps for data consistency
			if (plr.gained != null && !plr.gainedDays) {
				if (
					plrFromDatabaseCategory.mostGained?.value == null ||
					plrFromDatabaseCategory.mostGained.value < plr.gained
				) {
					plrFromDatabaseCategory.mostGained = { date, value: plr.gained };
					change = true;
				}
			}

			//set peak and lowest
			const o = { date, value: plr.value };
			if (
				plrFromDatabaseCategory.peak?.value == null ||
				plrFromDatabaseCategory.peak.value < plr.value
			) {
				plrFromDatabaseCategory.peak = o;
				change = true;
			}
			if (
				plrFromDatabaseCategory.lowest?.value == null ||
				plrFromDatabaseCategory.lowest.value > plr.value
			) {
				plrFromDatabaseCategory.lowest = o;
				change = true;
			}

			if (change) playersMap.set(_id, plrFromDatabase);
		}
	}

	const playersNew = Array.from(playersMap.values());
	fs.writeFileSync(path.join(outputDir, 'players.json'), JSON.stringify(playersNew));

	const promises = new Array(playersNew.length);
	for (const i in playersNew) {
		promises[i] = new Promise(async (resolve) => {
			await plrColl.updateOne({ _id: playersNew[i]._id }, { $set: playersNew[i] });
			resolve(1);
		});
	}

	await Promise.all(promises);

	client.close();
} catch (e) {
	console.error(e);
	process.exit(1);
}
