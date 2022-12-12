// handlers for simple default pages

import { htmlHeaders as headers } from "../utils.ts"

// handle GET /
export const handleHome = (): Response => {
	return new Response(Deno.readFileSync(Deno.cwd() + '/src/public/index.html'), {
		status: 200,
		headers
	})
}

// handle 404
export const notFound = (): Response => {
	return new Response('404 not found', { status: 404 })
}

// we do some trolling
export const handleTroll = (): Promise<Response> => {
	// wait 10 seconds, then return i'm a teapot
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(new Response(';)', { status: 418 }))
		}, 10000)
	})
}

