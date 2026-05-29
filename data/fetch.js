// Fetch today's ranking from osu!Stats API, save it as a single json and upsert the database entry
// Takes ~13 minutes for all 4 categories, cannot be made parallel due to rate limiting
// OUTPUT -> ./archive-fetched/

import * as dotenv from "dotenv";
import * as fs from "fs";
import { MongoClient } from "mongodb";
import * as path from "path";
import { io } from "socket.io-client";
import { fileURLToPath } from "url";
import { populatePlayers } from "./populatePlayers.js";
import { setMostGainedRanking } from "./setMostGainedRanking.js";
import {
	CATEGORY_NAMES,
	compareByGivenFieldDescendingOrId,
	COUNTRY_CODES,
	createRankingIndexes,
	formatDate,
	OSUSTATS_FETCH_ENDPOINT,
	parseCategoryNumber
} from "./shared.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", ".env"), silent: true });

////////////////////////////
const MIN_SCORE_THRESHOLD = { top50: 1275, top25: 725, top8: 275, top1: 18 };
const MAX_PAGE = 10;
const PLAYERS_PER_PAGE = 15;
const OUTPUT_DIR = "archive-fetched";
const RESUME_INPUT_DIR = "archive-fetch-cursors";
const FLAGS = {
	ONE_PAGE_ONLY: "-onePage",
	CUSTOM_DATE: "-date=",
	SKIP_SOCKET: "-noSocket",
	SKIP_DAY_GAINS: "-noGains",
	SKIP_MOST_GAINED: "-noMostGained",
	SKIP_PLAYERS: "-noPlayers",
	SKIP_DB: "-noDb",
	SKIP_OUTPUT_FILES: "-noFile",
	NO_RESUME: "-noResume",
	FORCE_OVERWRITE: "-force"
};
////////////////////////////

function parseCustomDate(flags) {
	const customDateString = flags.find(a => a.startsWith(FLAGS.CUSTOM_DATE));
	return customDateString ? customDateString.slice(FLAGS.CUSTOM_DATE.length) : formatDate();
}

function saveResumeState(date, category, countryIndex, page) {
	try {
		const resumeDir = path.resolve(__dirname, RESUME_INPUT_DIR);
		if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir, { recursive: true });

		const resumeFile = path.resolve(resumeDir, `${date}.json`);
		const resumeState = { category, countryIndex, page, date };
		fs.writeFileSync(resumeFile, JSON.stringify(resumeState, null, 2));
		console.log(`Resume state saved to ${resumeFile}`);
	} catch (e) {
		console.error("Failed to save resume state:\n", e);
	}
}

function loadResumeState(date, flags) {
	if (flags.includes(FLAGS.NO_RESUME)) return null;

	try {
		const resumeFile = path.resolve(__dirname, RESUME_INPUT_DIR, `${date}.json`);
		if (fs.existsSync(resumeFile)) {
			const resumeState = JSON.parse(fs.readFileSync(resumeFile, "utf-8"));
			console.log(
				`Found resume state for ${date}: category=${resumeState.category}, countryIndex=${resumeState.countryIndex}, page=${resumeState.page}`
			);
			return resumeState;
		}
	} catch (e) {
		console.error("Failed to load resume state:\n", e);
	}
	return null;
}

function deleteResumeState(date) {
	try {
		const resumeFile = path.resolve(__dirname, RESUME_INPUT_DIR, `${date}.json`);
		if (fs.existsSync(resumeFile)) {
			fs.unlinkSync(resumeFile);
			console.log(`Resume state deleted for ${date}`);
		}
	} catch (e) {
		console.error("Failed to delete resume state:\n", e);
	}
}

function loadPartialData(date, flags) {
	if (flags.includes(FLAGS.NO_RESUME)) return null;

	try {
		const partialFile = path.resolve(__dirname, OUTPUT_DIR, `${date}.json`);
		if (fs.existsSync(partialFile)) return JSON.parse(fs.readFileSync(partialFile, "utf-8"));
	} catch (e) {
		console.error("Failed to load partial data:\n", e);
	}
	return null;
}

function convertToDatabaseEntry(rankingEntry, date) {
	return { _id: date, ...rankingEntry };
}

// TODO set gainedScores
function setPlayersDayGains(playersArray, flags, category = "top50") {
	if (flags.includes(FLAGS.SKIP_DAY_GAINS)) return playersArray;
	// set gainedScores and gainedDays for every player from the collection here
	return playersArray;
}

async function fetchCountryPage(country, page = 1, category = "top50") {
	console.time(`${country} #${page}`);
	let hasNextPage = true;
	let players = [];

	try {
		const body = JSON.stringify({
			gamemode: "0",
			page,
			rankMin: "1",
			rankMax: parseCategoryNumber(category),
			country
		});
		const response = await fetch(OSUSTATS_FETCH_ENDPOINT, {
			method: "POST",
			body,
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
				Accept: "application/json"
			}
		});
		if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

		const data = await response.json();
		if (!data?.length) throw new Error("osu!stats API returned no data");

		data.forEach((plr, index) => {
			const scores = Number(plr.count);
			if (scores >= MIN_SCORE_THRESHOLD[category]) {
				players.push({
					_id: plr.userId,
					name: plr.osu_user.userName,
					rank: 0,
					scores,
					countryRank: (page - 1) * PLAYERS_PER_PAGE + index + 1,
					country: plr.osu_user.country
				});
			} else {
				hasNextPage = false;
				return false;
			}
		});
	} catch (e) {
		console.error("Failed to fetch country page:\n", e);
		hasNextPage = false;
		players = null;
	} finally {
		console.timeEnd(`${country} #${page}`);
		return { players, hasNextPage };
	}
}

// Returns { (categoryName: [entries]) x4 }
async function fetchRankingEntry(mongoClient, flags, date, resumeState = null) {
	console.time(`Fetching ${date} ranking took`);
	let rankingEntries = loadPartialData(date, flags) || {};
	let totalPlayerCount = 0;

	const categoryStartIndex = resumeState ? CATEGORY_NAMES.indexOf(resumeState.category) : 0;

	for (let catIdx = categoryStartIndex; catIdx < CATEGORY_NAMES.length; catIdx++) {
		const category = CATEGORY_NAMES[catIdx];
		console.log(`Fetching ${category} ranking...`);
		const categoryEntries =
			resumeState && resumeState.category === category && rankingEntries[category] ? [...rankingEntries[category]] : [];
		const countryStartIndex = resumeState && resumeState.category === category ? resumeState.countryIndex : 0;
		const countryArray = Object.entries(COUNTRY_CODES).map(([i, code]) => ({ i: Number(i), code }));

		for (const { i, code: country } of countryArray.slice(countryStartIndex)) {
			let page =
				resumeState && resumeState.category === category && resumeState.countryIndex === i ? resumeState.page : 1;
			let pageData = { players: null, hasNextPage: true };

			while (pageData.hasNextPage && page <= MAX_PAGE) {
				pageData = await fetchCountryPage(country, page++, category);

				if (pageData.players == null) {
					console.log("Returned null - aborting.");

					if (!flags.includes(FLAGS.SKIP_OUTPUT_FILES)) {
						rankingEntries[category] = categoryEntries.sort((a, b) =>
							compareByGivenFieldDescendingOrId(a, b, "scores")
						);
						for (const idx in categoryEntries) categoryEntries[idx].rank = Number(idx) + 1;

						saveResumeState(date, category, i, page - 1);

						const PARTIAL_OUTPUT_FILE = path.resolve(__dirname, OUTPUT_DIR, date + ".json");
						fs.writeFileSync(PARTIAL_OUTPUT_FILE, JSON.stringify(rankingEntries, null, 2));
						console.log("Partial data saved to " + PARTIAL_OUTPUT_FILE);
					}

					mongoClient && mongoClient.close();
					process.exit(2);
				}
				if (!pageData.players.length) break;

				totalPlayerCount += pageData.players.length;
				const playersWithGains = setPlayersDayGains(pageData.players, flags);
				categoryEntries.push(...playersWithGains);
				if (flags.includes(FLAGS.ONE_PAGE_ONLY)) break;
			}

			rankingEntries[category] = categoryEntries.sort((a, b) => compareByGivenFieldDescendingOrId(a, b, "scores"));
			for (const idx in categoryEntries) categoryEntries[idx].rank = Number(idx) + 1;

			if (i == "0") {
				// TODO: Assume 0th categoryEntries index will always be the US with the most players
				// abort script if no scores are gained by any player (like the old script)
				// add flag to skip the check
				if (flags.includes(FLAGS.ONE_PAGE_ONLY)) break;
			}

			await new Promise(resolve => setTimeout(() => resolve(true), 2000)); // rate limiting to prevent 429 errors
		}

		if (resumeState && resumeState.category === category) resumeState = null;
	}

	console.log(`Fetched ${totalPlayerCount} entries`);
	console.timeEnd(`Fetching ${date} ranking took`);
	return rankingEntries;
}

// MAIN EXECUTION

const flags = process.argv.splice(2);
if (flags.includes("help") || flags.includes("--help") || flags.includes("-h")) {
	console.log("Available flags:\n", FLAGS);
	process.exit(0);
}

const date = parseCustomDate(flags);
const resumeState = loadResumeState(date, flags);
if (
	!resumeState &&
	!flags.includes(FLAGS.FORCE_OVERWRITE) &&
	fs.existsSync(path.resolve(__dirname, OUTPUT_DIR, `${date}.json`))
) {
	console.log(
		`Output file for ${date} already exists, aborting. Use ${FLAGS.FORCE_OVERWRITE} flag to force overwrite.`
	);
	process.exit(1);
}

const client = !flags.includes(FLAGS.SKIP_DB) && (await MongoClient.connect(process.env.DB_URI));
const rankingEntry = await fetchRankingEntry(client, flags, date, resumeState);

if (!flags.includes(FLAGS.SKIP_OUTPUT_FILES)) {
	try {
		const OUTPUT_FILE = path.resolve(__dirname, OUTPUT_DIR, date + ".json");
		fs.writeFileSync(OUTPUT_FILE, JSON.stringify(rankingEntry));
		console.log("Output saved to " + OUTPUT_FILE);
	} catch (e) {
		console.error("Failed to save output file:\n", e);
	}
}

if (!flags.includes(FLAGS.SKIP_DB)) {
	try {
		const dbRankings = client.db(process.env.DB_NAME).collection("rankings");
		if (!flags.includes(FLAGS.FORCE_OVERWRITE) && (await dbRankings.countDocuments({ _id: date })) > 0) {
			console.log(
				`Database entry for ${date} already exists, skipping database update. Use ${FLAGS.FORCE_OVERWRITE} flag to overwrite.`
			);
		} else {
			console.log("Inserting into database...");
			await dbRankings.updateOne({ _id: date }, { $set: { ...rankingEntry } }, { upsert: true });
			await createRankingIndexes(dbRankings);
		}
	} catch (e) {
		console.error("Failed to insert into database:\n", e);
	}
}

deleteResumeState(date);
if (client && !flags.includes(FLAGS.SKIP_PLAYERS))
	await populatePlayers(client, [convertToDatabaseEntry(rankingEntry, date)]);

const mostGainedPerCategory =
	!client || flags.includes(FLAGS.SKIP_MOST_GAINED) ? {} : await setMostGainedRanking(client);
client && client.close();

if (!flags.includes(FLAGS.SKIP_SOCKET)) {
	console.log("Setting up ranking update socket...");
	const socket = io(process.env.SOCKET_URI + "/poggers", {
		path: "/socket.io/poggers"
	});

	await new Promise((resolve, reject) => {
		socket.on("connect", () => {
			socket.emit("ranking-update", mostGainedPerCategory);
			console.log("Ranking update socket notified");
			resolve(1);

			// disconnect after receiving confirmation from the server (might be kind of dum, was used for debug)
			// socket.on("ranking-update-confirm", () => {
			// 	socket.disconnect();
			// 	resolve(1);
			// });
		});

		socket.on("connect_failed", e => {
			console.error("Failed to connect to socket:\n", e);
			reject(e);
		});
	});
}

console.log("All done :)");
