// everything relating to the webserver is here

import { ConnInfo } from "https://deno.land/std@0.167.0/http/server.ts";
import { sendWebhook } from "./webhook.ts";
import { Redirect, WebhookData } from "./types.ts";
import { addShortcut, enableShortcut, getShortcut } from "./db.ts";
import { googleSafeBrowsingKey, token } from "../config.ts";

// allowed characters for a shortcut
const allowedCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+.'
const genCharset = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789-_+.'

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

// random number generator
const random = (upTo: number): number => Math.floor(Math.random() * upTo) + 1

// generate random string, excluding I & l
const randomString = (length: number): string => {
	const stringBuilder = []

	// push a random character into the string builder
	for (let i = 0; i < length; i++) {
		stringBuilder.push(genCharset.charAt(random(genCharset.length)))
	}

	return stringBuilder.join('')
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
	return new Response(Deno.readFileSync(Deno.cwd() + '/src/public/index.html'), {
		status: 200,
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	})
}

// handle GET /enable
const handleEnablePage = (): Response => {
	return new Response(Deno.readFileSync(Deno.cwd() + '/src/public/enable.html'), {
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
	if (!redirect && !shortcut.from.startsWith(`expand`)) {
		// test if the url is sketchy before adding it
		if (googleSafeBrowsingKey) {
			try {
				const safeTest = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${googleSafeBrowsingKey}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						client: {
							clientId: 'shawtaf',
							clientVersion: '1.0.0'
						},
						threatInfo: {
							threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'POTENTIALLY_HARMFUL_APPLICATION'],
							platformTypes: ['ANY_PLATFORM'],
							threatEntryTypes: ['URL'],
							threatEntries: [{ url: shortcut.to }]
						}
					})
				})
				const result = await safeTest.json()

				// if there's a match, return an error and don't shorten the url
				if (result.matches) {
					return new Response(JSON.stringify({ error: 'malicious url - ' + result?.matches[0]?.threatType }), {
						status: 403,
						headers: {
							'Content-Type': 'application/json'
						}
					})
				}
			} catch (err) {
				return new Response(JSON.stringify({ error: 'error checking safe browsing api - ' + err }), {
					headers: {
						'Content-Type': 'application/json'
					}
				})
			}
		}

		// check if it exists already
		const added = await addShortcut(shortcut)
		// if succesfully added, respond with 201, otherwise fail with 400
		if (added) {
			return new Response(JSON.stringify(shortcut), {
				status: 201,
				headers: {
					'Content-Type': 'application/json'
				}
			})
		} else {
			return new Response(JSON.stringify({ error: 'failed to create shortcut' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			})
		}
	} else {
		return new Response(JSON.stringify({ error: 'already exists' }), {
			status: 422,
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}
}

// handle POST /enable
const handleEnable = async (shortcut: string, enableToken: string): Promise<Response> => {
	// make sure token is valid
	if (enableToken !== token) {
		return new Response(JSON.stringify({ error: 'token not accepted'}), {
			status: 401,
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}
	if (shortcut) {
		// test if shortcut exists
		const redirect = await getShortcut(shortcut)

		if (redirect) {
			const enabled = await enableShortcut(shortcut)

			console.log(enabled)
			return new Response(JSON.stringify(enabled), {
				status: 200,
				headers: {
					'Content-Type': 'application/json'
				}
			})
		} else {
			return new Response(JSON.stringify({ error: 'not found' }), {
				status: 404,
				headers: {
					'Content-Type': 'application/json'
				}
			})
		}
	} else {
		return new Response(JSON.stringify({ error: 'invalid shortcut' }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}
}

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
	} else if (request.method === 'POST' && url.pathname === '/shorten') {
		// shorten the url

		// get the request data
		const body = await request.json()
		const to = body.to
		let from = body.from

		// if from isn't valid, generate a random string for it
		while (!from) {
			const newFrom = randomString(5)

			// check that the random string doesn't already exist as a shortcut
			const existing = await getShortcut(newFrom)

			// if it doesn't already exist, use it, otherwise repeat the loop
			if (!existing) {
				from = newFrom
			}
		}

		// test if the from string is valid, contains only chars from charset
		const validFrom = from.split('').every((c: string) => allowedCharset.includes(c))

		// if to is valid pass off to the shorten handler, otherwise return 400
		if (validFrom && isValidHttpUrl(to)) {
			return handleShorten({ from, to })
		} else {
			return new Response(JSON.stringify({ error: 'invalid characters or url' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			})
		}
	} else if (url.pathname === '/enable') {
		if (request.method === 'POST') {
			// handle the enabling if POST
			const { shortcut, token } = await request.json()
			return handleEnable(shortcut, token)
		} else {
			// show enable page if GET
			return handleEnablePage()
		}
	} else if (url.pathname.startsWith('/.htaccess')) {
		// catch bots scanning for vulnerabilities
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
