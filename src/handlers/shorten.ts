// handler for shorten endpoint

import { config } from '../config.ts'
import { addShortcut, getShortcut } from '../db.ts'
import { allowedCharset, headers, isValidHttpUrl, randomString } from '../utils.ts'


// handle POST /shorten
export const handleShorten = async (request: Request): Promise<Response> => {
	// get the request data
	const body = await request.json()
	const shortcut = {
		to: body.to,
		from: body.from
	}

	// if from isn't valid, generate a random string for it
	while (!shortcut.from) {
		const newFrom = randomString(5)

		// check that the random string doesn't already exist as a shortcut
		const existing = await getShortcut(newFrom)

		// if it doesn't already exist, use it, otherwise repeat the loop
		if (!existing) {
			shortcut.from = newFrom
		}
	}

	// test if the from string is valid, contains only chars from charset
	const validFrom = shortcut.from.split('').every((c: string) => allowedCharset.includes(c))

	// if either are invalid, return 400
	if (!validFrom || !isValidHttpUrl(shortcut.to)) {
		return new Response(JSON.stringify({ error: 'invalid characters or url' }), { status: 400, headers })
	}

	// test if shortcut exists
	const redirect = await getShortcut(shortcut.from)

	// if the redirect doesn't already exist, create it, otherwise throw error
	if (!redirect && !shortcut.from.startsWith(`expand`)) {
		// test if the url is sketchy before adding it
		if (config.get('googleSafeBrowsingKey')) {
			try {
				const safeTest = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${config.get('googleSafeBrowsingKey')}`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						client: {
							clientId: 'shawtaf',
							clientVersion: '1.0.0'
						},
						threatInfo: {
							threatTypes: [
								'MALWARE',
								'POTENTIALLY_HARMFUL_APPLICATION',
								'SOCIAL_ENGINEERING',
								'UNWANTED_SOFTWARE'
							],
							platformTypes: ['ANY_PLATFORM'],
							threatEntryTypes: ['URL'],
							threatEntries: [{ url: shortcut.to }]
						}
					})
				})
				const result = await safeTest.json()

				// if there's a match, return an error and don't shorten the url
				if (result.matches) {
					return new Response(JSON.stringify({ error: 'malicious url - ' + result?.matches[0]?.threatType }), { status: 403, headers })
				}
			} catch (err) {
				return new Response(JSON.stringify({ error: 'error checking safe browsing api - ' + err }), { status: 503, headers })
			}
		}

		// check if it exists already
		const added = await addShortcut(shortcut)

		// if succesfully added, respond with 201, otherwise fail with 400
		if (added) {
			return new Response(JSON.stringify(shortcut), { status: 201, headers })
		} else {
			return new Response(JSON.stringify({ error: 'failed to create shortcut' }), { status: 400, headers })
		}
	} else {
		return new Response(JSON.stringify({ error: 'already exists' }), { status: 422, headers })
	}
}

