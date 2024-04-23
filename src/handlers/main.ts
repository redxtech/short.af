// handlers for simple default pages

import { config } from '../config.ts'
import { htmlHeaders as headers } from '../utils.ts'

// handle GET /
export const handleHome = (): Response => {
	if (config.get('env') !== 'production') {
		console.log('serving home page')
	}

	return new Response(
		Deno.readFileSync(Deno.cwd() + '/src/public/index.html'),
		{
			status: 200,
			headers,
		},
	)
}

// handle 404
export const notFound = (): Response => {
	if (config.get('env') !== 'production') {
		console.log('serving 404 page')
	}

	return new Response('404 not found', { status: 404 })
}

// we do some trolling
export const handleTroll = (): Promise<Response> => {
	if (config.get('env') !== 'production') {
		console.log('serving troll response')
	}

	// wait 10 seconds, then return i'm a teapot
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(new Response(';)', { status: 418 }))
		}, 10000)
	})
}
