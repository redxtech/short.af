// test if a shortcut exists, and if so, redirect to the destination
export const shortcut = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
	const url = new URL(request.url);
	const path = url.pathname;
	const shortcut = path.substring(path.indexOf('/') + 1);
	const destination = await env.REDIRECTS.get(shortcut);

	return destination
		? Response.redirect(destination, 302)
		: new Response('not found', { status: 404 });
}
