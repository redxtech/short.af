// everything relating to the webserver is here

import { ConnInfo } from "https://deno.land/std@0.167.0/http/server.ts";
import { sendWebhook } from "./webhook.ts";
import { Redirect, WebhookData } from "./types.ts";
import { addShortcut, getShortcut } from "./db.ts";

// check if a string is a valid url
const isValidHttpUrl = (str: string) => {
  let url;
  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// assert that the address is a network address instead of a unix address
function assertIsNetAddr(addr: Deno.Addr): asserts addr is Deno.NetAddr {
  if (!['tcp', 'udp'].includes(addr.transport)) {
    throw new Error('Not a network address');
  }
}

// get the remote address from the connection, checking it's the right type
const getRemoteAddress = (connInfo: ConnInfo): Deno.NetAddr => {
  assertIsNetAddr(connInfo.remoteAddr);
  return connInfo.remoteAddr;
}

// handle GET /
const handleHome = (): Response => {
	return new Response(Deno.readFileSync(Deno.cwd() + '/src/index.html'), {
		status: 200,
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	})
}

// handle GET /expand/:shortcut
const handleExpand = (redirect: Redirect): Response => new Response(redirect.to, { status: 200 })

// handle POST /shorten
const handleShorten = async (shortcut: Redirect): Promise<Response> => {
	// test if shortcut exists
	const redirect = await getShortcut(shortcut.from)

	// if the redirect doesn't already exist, create it, otherwise throw error
	if (!redirect && !['shorten', 'expand'].some(s => shortcut.from.startsWith(`/${s}/`))) {
		const added = await addShortcut(shortcut)
		// if succesfully added, respond with 201, otherwise fail with 400
		if (added) {
			return new Response(shortcut.to, { status: 201 })
		} else {
			return new Response('failed to create shortcut', { status: 400 })
		}
	} else {
		return new Response('already exists', { status: 422 })
	}
}

// handle POST /update
// TODO haha do this later

// handle GET /:shortcut
const handleShortcut = async (redirect: Redirect, request: Request, connInfo: ConnInfo): Promise<Response> => {
	// only grab ip if enabled
	if (redirect?.yoink) {
		console.log('yoinking...')

		// get the connected ip address
		const { hostname: ip } = getRemoteAddress(connInfo);

		// get initial data about the request
		const data: WebhookData = {
			ip,
			method: request.method,
			url: request.url,
			useragent: request.headers.get('user-agent') || 'undefined user-agent',
			host: request.headers.get('host') || 'undefined host',
			dnt: request.headers.get('dnt') || 'undefined do not track',
			upgrade: request.headers.get('upgrade-insecure-requests') || 'undefined upgrade insecure requests',
			redirect: request.redirect
		}

		// if the request was proxied, get the real ip
		if (request.headers.get('x-real-ip')) {
			const ip = request.headers.get('x-real-ip')?.split(', ')[0]
			data.forwarded = {
				ip,
				for: request.headers.get('x-forwarded-for') || undefined,
				host: request.headers.get('x-forwarded-host') || undefined,
				proto: request.headers.get('x-forwarded-proto') || undefined,
				scheme: request.headers.get('x-forwarded-scheme') || undefined
			}
		}

		// if the request includes client hints, include those
		data.ch = {
			ua: request.headers.get('sec-ch-ua') || undefined,
			mobile: request.headers.get('sec-ch-ua-mobile') || undefined,
			platform: request.headers.get('sec-ch-ua-mobile') || undefined
		}

		// get the location of the ip
		try {
			const geoReq = await fetch(`http://ip-api.com/json/${data.forwarded?.ip || data.ip}`)
			const geo = await geoReq.json()
			data.location = geo
		} catch (err) {
			console.error('Geolocation Failed:', err)
		}

		// send the webhook
		sendWebhook(data);
	}

	// respond with the redirect
	return Response.redirect(redirect.to, 302)
}

// we do some trolling
const handleTroll = (): Promise<Response> => {
	// wait 10 seconds, then return i'm a teapot
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(new Response(';)', { status: 418 }))
		}, 10000)
	})
}

// handle 404
const notFound = (): Response => {
	return new Response('404 not found', { status: 404 })
}

// server handler function
export const handler = async (request: Request, connInfo: ConnInfo): Promise<Response> => {
	// different handlers for different endpoints
	const url = new URL(request.url)
	if (url.pathname === '/') {
		// serve a simple homepage
		return handleHome()
	} else if (url.pathname.startsWith('/shorten/')) {
		// split path on | for from & to
		const [from, to] = url.pathname.replace('/shorten/', '').split('%7C')
		
		// if both were valid, otherwise return 400
		if (from && isValidHttpUrl(to)) {
			return handleShorten({ from, to })
		} else {
			return new Response('invalid values', { status: 400 })
		}
	} else if (url.pathname.startsWith('/.htaccess')) {
		return handleTroll()
	} else {
		// for for all other paths, check if there's a shortcut
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
			return await handleShortcut(redirect, request, connInfo)
		} else {
			return notFound()
		}
	}
}
