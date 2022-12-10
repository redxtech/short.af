import { Database } from 'https://deno.land/x/aloedb@0.9.0/mod.ts'

import { Redirect } from "./types.ts";

// initialization
const db = new Database<Redirect>('database.json');

// query the database for a shortcut
export const getShortcut = async (shortcut: string): Promise<Redirect | undefined> => {
	const result = await db.findOne({ from: shortcut })
	if (result) {
		return result
	}

}

// add a shortcut to the database
export const addShortcut = async (shortcut: Redirect): Promise<Redirect | undefined> => {
	const existing = await db.findOne({ from: shortcut.from })
	if (!existing) {
		return await db.insertOne(shortcut)
	}
}

// enable yoinking for a shortcut
export const enableShortcut = async (shortcut: string): Promise<Redirect | undefined> => {
	const update = await db.updateOne({ from: shortcut }, { yoink: true })
	if (update) {
		return update
	}
}

// disable yoinking for a shortcut
export const disableShortcut = async (shortcut: string): Promise<Redirect | undefined> => {
	const update = await db.updateOne({ from: shortcut }, { yoink: false })
	if (update) {
		return update
	}
}

// change a shortcut in the database
export const changeShortcut = async (shortcut: Redirect): Promise<Redirect | undefined> => {
	const update = await db.updateOne({ from: shortcut.from }, { to: shortcut.to })
	if (update) {
		return update
	}
}

