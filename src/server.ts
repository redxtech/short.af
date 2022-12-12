// everything relating to the webserver is here

import { ConnInfo } from 'https://deno.land/std@0.167.0/http/server.ts'
import { handleEnablePage, handleHome, handleTroll } from './handlers/main.ts'
import { handleShorten } from './handlers/shorten.ts'
import { handleEnable } from './handlers/enable.ts'
import { handleShortcut } from './handlers/shortcut.ts'


// server handler function
export const handler = async (request: Request, connInfo: ConnInfo): Promise<Response> => {
	// different handlers for different endpoints
	const url = new URL(request.url)

	if (url.pathname === '/') {
		// serve a simple homepage
		return handleHome()
	} else if (request.method === 'POST' && url.pathname === '/shorten') {
		// shorten the url
		return handleShorten(request)
	} else if (url.pathname === '/enable') {
		if (request.method === 'POST') {
			// handle the enabling if POST
			return handleEnable(request)
		} else {
			// show enable page if GET
			return handleEnablePage()
		}
	} else if (url.pathname.startsWith('/.htaccess')) {
		// catch bots scanning for vulnerabilities
		return handleTroll()
	} else {
		// handle the standard shortcut case
		return await handleShortcut(request, connInfo)
	}
}
