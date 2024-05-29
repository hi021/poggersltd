
// works on v3 files with set gains and gainsDays
// also needs an up to date players database
// used to set mostGained, peak, and lowest fields for all categories
// saves the player json and attempts to update the db

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import glob from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const inputDir = path.resolve(__dirname, 'archive').replace(/\\/g, "/");
const outputDir = path.resolve(__dirname, 'archive-afterpeaks');
const categoriesSkip = ['top100', 'top15']; //categories not in the db

try {
	const client = await MongoClient.connect(process.env.DB_URI);
	const plrColl = client.db(process.env.DB_NAME).collection('players');

	const playersDatabase = await plrColl.find().toArray();
	const playersMap = new Map();
	for (const i of playersDatabase) playersMap.set(i._id, i);

	const globFiles = glob.globSync(inputDir + '\\*.json');

	for (const file of globFiles) {
		const split = file.split('/'); //path.sep didn't work on windows lol

		const date = split[split.length - 1].replace(".json", ""); //format filename into YYYY-MM-DD
		const fileJson = JSON.parse(fs.readFileSync(file));
		
		for (const category in fileJson) {
			if (categoriesSkip.includes(category)) continue; //skip categories not in the database
			console.log(`Checking ${category} on ${date}`);

			for(const plr of fileJson[category]) {
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
				if (plr.gainedScores != null && !plr.gainedDays) {
					if (
						plrFromDatabaseCategory.mostGained?.value == null ||
						plrFromDatabaseCategory.mostGained.value < plr.gainedScores
					) {
						plrFromDatabaseCategory.mostGained = { date, value: plr.gainedScores };
						change = true;
					}
				}

				//set peak and lowest
				const o = { date, value: plr.value };
				if (
					plrFromDatabaseCategory.peak?.value == null ||
					plrFromDatabaseCategory.peak.value < plr.scores
				) {
					plrFromDatabaseCategory.peak = o;
					change = true;
				}
				if (
					plrFromDatabaseCategory.lowest?.value == null ||
					plrFromDatabaseCategory.lowest.value > plr.scores
				) {
					plrFromDatabaseCategory.lowest = o;
					change = true;
				}

				if (change) playersMap.set(_id, plrFromDatabase);
			}
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
