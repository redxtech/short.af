// handler for enable endpoint

import { token } from "../../config.ts"
import { enableShortcut, getShortcut } from "../db.ts"
import { headers } from "../utils.ts"


// handle POST /enable
export const handleEnable = async (request: Request): Promise<Response> => {
	// get shortcut & token from request body
	const {shortcut, token: enableToken } = await request.json()

	// make sure token is valid
	if (enableToken !== token) {
		return new Response(JSON.stringify({ error: 'token not accepted'}), { status: 401, headers })
	}
	if (shortcut) {
		// test if shortcut exists
		const redirect = await getShortcut(shortcut)

		if (redirect) {
			const enabled = await enableShortcut(shortcut)

			console.log(enabled)
			return new Response(JSON.stringify(enabled), { status: 200, headers })
		} else {
			return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers })
		}
	} else {
		return new Response(JSON.stringify({ error: 'invalid shortcut' }), { status: 400, headers })
	}
}

