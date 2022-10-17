import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, 'archive-other');

function createNGram(str) {
	if (!str || str.length <= 3) return str;

	const minGram = 3;
	const maxGram = str.length;

	return str
		.split(' ')
		.reduce((ngrams, token) => {
			if (token.length > minGram) {
				for (let i = minGram; i <= maxGram && i <= token.length; ++i) {
					ngrams = [...ngrams, token.substr(0, i)];
				}
			} else {
				ngrams = [...ngrams, token];
			}
			return ngrams;
		}, [])
		.join(' ');
}

const oldPlayers = JSON.parse(fs.readFileSync(path.join(dir, 'players-old.json')));
const newPlayers = JSON.parse(fs.readFileSync(path.join(dir, 'players-new.json')));
const mergedPlayers = new Map();

for (const i of newPlayers) {
	mergedPlayers.set(i._id, i);
}
for (const i of oldPlayers) {
	if (mergedPlayers.has(i._id)) {
		//if already has v3 data
		if (i.oldNam?.length) {
			const plr = mergedPlayers.get(i._id);
			mergedPlayers.set(i._id, {
				...plr,
				oldName: [...new Set([...(plr.oldName ?? []), ...i.oldNam])]
			});
		}
	} else {
		const plr = {
			_id: i._id,
			name: i.nam,
			country: i.cntr,
			nameKey: createNGram(i.nam),
			top50: {
				date: i.date,
				rank: i.pos,
				countryRank: i.cntrPos,
				value: i.t50,
				gained: i.g50
				//missing gainedRank (and mostGained, but set those with a separate script)
			}
		};
		if (i.oldNam?.length) plr.oldName = i.oldNam;

		mergedPlayers.set(i._id, plr);
	}
}

fs.writeFileSync(
	path.join(dir, 'players-merged.json'),
	JSON.stringify(Array.from(mergedPlayers.values()))
);
