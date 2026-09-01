// works on converted files (v3.2)
// gets all json files in order and sets `gainedScores`, `gainedRanks`, and `gainedDays` fields
// saves all json files and attempts to add them to the db
// used to fix gains not being set properly on days between v2 and v3
// INPUT ./archive-new/ -> OUTPUT ./archive-aftergains/

import { getDaysBetweenDates } from "./shared.js";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env"), silent: true });

////////////////////////////
const inputDir = path.resolve(__dirname, "archive-new");
const outputDir = path.resolve(__dirname, "archive-aftergains");
////////////////////////////

export async function calculateGainedScores(mongoClient = null) {
	// whether ran manually from console as opposed to another script that passes in a shared client
	try {
		const useOwnClient = mongoClient == null;
		if (useOwnClient) mongoClient = await MongoClient.connect(process.env.DB_URI);
		const dbRankings = mongoClient.db(process.env.DB_NAME).collection("rankings");

		let players = {}; // maps (of players by id) for each category, used to get day to day gains
		let prevDate = "";
		const globFiles = fs.globSync(inputDir + "/*.json").sort();
		for (const file of globFiles) {
			const date = path.basename(file, ".json");
			console.log(`Converting ${date}...`);
			const fileJson = JSON.parse(fs.readFileSync(file));
			const fileConverted = {}; // arrays of converted players for each category

			const dateDiff = prevDate ? getDaysBetweenDates(new Date(date), new Date(prevDate)) : 0;
			if (dateDiff > 1) console.log(`${dateDiff} day difference between entries, setting gainedDays`);

			for (const category in fileJson) {
				const convertedPlayersArray = new Array(fileJson[category].length);
				for (const i in fileJson[category]) {
					const plr = fileJson[category][i];

					// set gains
					const prevPlr = players[category]?.get(plr._id);
					if (prevPlr && prevPlr.date == prevDate) {
						const prevScores = prevPlr.scores;
						const prevRank = prevPlr.rank;

						plr.gainedScores = prevScores ? plr.scores - prevScores : undefined;
						plr.gainedRanks = prevRank ? prevRank - plr.rank : undefined; // reversed because (+1 is 100 -> 99 etc.)
						if (dateDiff > 1) plr.gainedDays = dateDiff;
					}

					convertedPlayersArray[i] = plr;
					if (!players[category]) players[category] = new Map();
					players[category].set(plr._id, { ...plr, date });
				}
				fileConverted[category] = convertedPlayersArray;
			}

			const outputPath = path.join(outputDir, date + ".json");
			console.log(`Writing to ${outputPath}...`);
			fs.writeFileSync(outputPath, JSON.stringify(fileConverted));

			const insertRes = await dbRankings.updateOne({ _id: date }, { $set: fileConverted }, { upsert: true });
			console.log(`Modified ${insertRes.modifiedCount}, upserted ${insertRes.upsertedCount}`);

			prevDate = date;
		}

		mongoClient.close();
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
}

// run if called directly from console
if (process.argv[1] === import.meta.filename) calculateGainedScores();
