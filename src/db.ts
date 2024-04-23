import { Pool } from 'https://deno.land/x/postgres@v0.19.3/mod.ts';

import { config } from './config.ts';

import { Redirect } from './types.ts';

// initialization
const pool = new Pool(
	{
		applicationName: 'yoinked',
		user: config.get('db.username'),
		password: config.get('db.password'),
		database: config.get('db.name'),
		hostname: config.get('db.host'),
		port: config.get('db.port'),
	},
	config.get('db.connections'),
);

{
	// connect to the database, create the table if it doesn't exist
	using client = await pool.connect();
	await client.queryObject(
		`CREATE TABLE IF NOT EXISTS redirects (
      "from" TEXT PRIMARY KEY,
      "to" TEXT,
      key TEXT default '',
      timestamp timestamp default current_timestamp
    )`,
	);
}

// get a shortcut by its "from" value
export const getShortcut = async (
	from: string,
): Promise<Redirect | undefined> => {
	using client = await pool.connect();
	const { rows } = await client.queryObject<
		Redirect
	>`SELECT "from", "to" FROM redirects WHERE "from" = ${from}`;

	if (rows.length > 0) return rows[0];
};

// add a new shortcut to the database
export const addShortcut = async (
	shortcut: Redirect,
): Promise<Redirect | undefined> => {
	const existing = await getShortcut(shortcut.from);
	if (!existing) {
		using client = await pool.connect();
		const { rows } = await client.queryObject<
			Redirect
		>`INSERT INTO redirects ("from", "to") VALUES (${shortcut.from}, ${shortcut.to}) RETURNING "from", "to"`;

		if (rows.length > 0) return rows[0];
	}
};

// update a shortcut in the database
export const changeShortcut = async (
	shortcut: Redirect,
): Promise<Redirect | undefined> => {
	using client = await pool.connect();
	const { rows } = await client.queryObject<
		Redirect
	>`UPDATE redirects SET "to" = ${shortcut.to} WHERE "from" = ${shortcut.from} RETURNING "from", "to"`;

	if (rows.length > 0) return rows[0];
};
