// take a url (/api/expand/:shortcut) and return the destination url
export const expand = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
	const url = new URL(request.url)
	const shortcut = url.pathname.split('/')[3]
	const destination = await env.REDIRECTS.get(shortcut)

	if (destination) {
		return new Response(
			JSON.stringify({ status: 'success', from: shortcut, dest: destination }),
			{ status: 200, headers: { 'content-type': 'application/json' } }
		)
	}

	return new Response(
		JSON.stringify({ status: 'error', message: 'no destination found for shortcut' }),
		{ status: 404, headers: { 'content-type': 'application/json' } }
	)
}
