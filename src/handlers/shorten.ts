import { randomString, checkExists, allowedCharset, isValidHttpUrl } from "../utils";
import { checkSafeBrowsing } from "../safeBrowsing";

// shorten urls POSTed to /shorten
export const shorten = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
	const body = await request.json() as { from: string, dest: string }

	const shortcut = {
		from: body.from,
		dest: body.dest
	}

	// if the from field is blank, generate a random shortcut
	while (!shortcut.from) {
		const newFrom = randomString(6)

		if (!(await checkExists(env, newFrom))) {
			shortcut.from = newFrom;
		}
	}

	// test if the from string is valid, contains only chars from charset
	const validFrom = shortcut.from.split('').every((c: string) =>
		allowedCharset.includes(c)
	)

	// if either are invalid, return 400
	if (!validFrom || !isValidHttpUrl(shortcut.dest)) {
		return new Response(
			JSON.stringify({ status: 'error', message: 'invalid characters or url' }),
			{ status: 400, headers: { 'content-type': 'application/json' } }
		)
	}

	// test if the shortcut already exists
	if (await checkExists(env, shortcut.from)) {
		return new Response(
			JSON.stringify({ status: 'error', message: 'shortcut already exists' }),
			{ status: 422, headers: { 'content-type': 'application/json' } }
		)
	}

	// fail on special cases (length < 3, or starts with known strings)
	if (shortcut.from.length < 3 || [ 'expand', 'shorten', '.htaccess', 'wp-login.php' ].some(from => shortcut.from.startsWith(from))) {
		return new Response(
			JSON.stringify({ status: 'error', message: 'shortcut not allowed' }),
			{ status: 403, headers: { 'content-type': 'application/json' } }
		)
	}

	// check if the destination is safe (if google safe browsing key is set)
	if (env.GOOGLE_SAFE_BROWSING_KEY && !(await checkSafeBrowsing(env, shortcut.dest))) {
		return new Response(
			JSON.stringify({ status: 'error', message: 'destination is unsafe' }),
			{ status: 403, headers: { 'content-type': 'application/json' } }
		)
	}

	try {
		// set the shortcut in the kv namespace
		await env.REDIRECTS.put(shortcut.from, shortcut.dest)

		return new Response(
			JSON.stringify({ status: 'success', ...shortcut }),
			{ status: 201, headers: { 'content-type': 'application/json' } }
		)
	} catch (err) {
		return new Response(
			JSON.stringify({ status: 'error', message: 'failed to set shortcut' }),
			{ status: 500, headers: { 'content-type': 'application/json' } }
		)
	}
}
