import { expand } from "./handlers/expand"
import { shortcut } from "./handlers/shortcut"
import { shorten } from "./handlers/shorten"
import { troll } from "./handlers/troll"

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url)
		const path = url.pathname

		// handle special cases
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })
		} else if (path === '/api/shorten' && request.method === 'POST') {
			return shorten(request, env, ctx)
		} else if (path.startsWith('/api/expand/')) {
			return expand(request, env, ctx)
		} else if (['/.htaccess', '/wp-login.php'].includes(path)) {
			return troll()
		}

		// everything else is a shortcut
		return shortcut(request, env, ctx)
	},
} satisfies ExportedHandler<Env>
