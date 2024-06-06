import * as path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const client = await MongoClient.connect(process.env.DB_URI);
const db = client.db(process.env.DB_NAME_RANKING);

const collections = await db.listCollections(undefined, { nameOnly: true }).toArray();

const exclude = ['2022-10-09', '2022-10-10', '2022-10-11', '2022-10-12'];
const minDate = '2022-10-15'; //first date not to drop
const maxDate = 'Z';

for (const i of collections) {
	if (i.name >= minDate && i.name <= maxDate) continue;
	if (exclude.includes(i.name)) continue;
	console.log('Dropping collection ' + i.name);
	await db.collection(i.name).drop();
}

client.close();
