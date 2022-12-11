import { MongoClient} from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { mongo } from '../config.ts';

import { Redirect } from "./types.ts";

// initialization
const client = new MongoClient();
await client.connect(`mongodb://${mongo.username}:${mongo.password}@${mongo.host}:${mongo.port}`);
const db = client.database('yoinked');
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

// enable yoinking for a shortcut
export const enableShortcut = async (shortcut: string): Promise<Redirect | undefined> => {
	const update = await redirects.updateOne({ from: shortcut }, { yoink: true })
	if (update) {
		return await getShortcut(shortcut)
	}
}

// disable yoinking for a shortcut
export const disableShortcut = async (shortcut: string): Promise<Redirect | undefined> => {
	const update = await redirects.updateOne({ from: shortcut }, { yoink: false })
	if (update) {
		return await getShortcut(shortcut)
	}
}

// change a shortcut in the database
export const changeShortcut = async (shortcut: Redirect): Promise<Redirect | undefined> => {
	const update = await redirects.updateOne({ from: shortcut.from }, { to: shortcut.to })
	if (update) {
		return await getShortcut(shortcut.from)
	}
}

