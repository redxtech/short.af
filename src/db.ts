import { MongoClient} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { config } from './config.ts';

import { Redirect } from "./types.ts";

// initialization
const connectURL = config.get('db.url')
  ? config.get('url')
  : `mongodb://${config.get('db.username')}:${config.get('db.password')}@${
    config.get('db.host')}:${config.get('db.port').toString()}`

const client = new MongoClient();
await client.connect(connectURL);
const db = client.database(config.get('db.name'));
const redirects = db.collection<Redirect>('redirects');

// query the database for a shortcut
export const getShortcut = async (shortcut: string): Promise<Redirect | undefined> => {
	const result = await redirects.findOne({ from: shortcut })
	if (result) {
		return result
	}
}

// add a shortcut to the database
export const addShortcut = async (shortcut: Redirect): Promise<Redirect | undefined> => {
	const existing = await redirects.findOne({ from: shortcut.from })
	if (!existing) {
		return await redirects.insertOne(shortcut) as Redirect
	}
}

// change a shortcut in the database
export const changeShortcut = async (shortcut: Redirect): Promise<Redirect | undefined> => {
	const update = await redirects.updateOne({ from: shortcut.from }, { $set: { to: shortcut.to } })
	if (update) {
		return await getShortcut(shortcut.from)
	}
}

