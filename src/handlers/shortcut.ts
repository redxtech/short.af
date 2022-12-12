// handler for the main shortcut functionality

import { getShortcut } from '../db.ts'
import { handleExpand } from './expand.ts'
import { notFound } from './main.ts'


// handle GET /:shortcut
export const handleShortcut = async (request: Request): Promise<Response> => {
	// for for all other paths, check if there's a shortcut
	const url = new URL(request.url)
	const path = url.pathname
	const isExpand = path.startsWith('/expand/')
	const shortcut = isExpand
		? path.replace('/expand/', '')
		: path.substring(url.pathname.indexOf('/') + 1)
	const redirect = await getShortcut(shortcut)

	// test if there's a shortcut, otherwise, show not found
	if (redirect) {
		if (isExpand) {
			return handleExpand(redirect)
		}
	} else {
		return notFound()
	}

	// respond with the redirect
	return Response.redirect(redirect.to, 302)
}

