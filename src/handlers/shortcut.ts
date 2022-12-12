// handler for the main shortcut functionality

import { ConnInfo } from 'https://deno.land/std@0.167.0/http/server.ts'
import { getShortcut } from '../db.ts';
import { WebhookData } from '../types.ts'
import { getRemoteAddress } from '../utils.ts';
import { sendWebhook } from '../webhook.ts';
import { handleExpand } from './expand.ts';
import { notFound } from './main.ts';


// handle GET /:shortcut
export const handleShortcut = async (request: Request, connInfo: ConnInfo): Promise<Response> => {
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
		sendWebhook(data)
	}

	// respond with the redirect
	return Response.redirect(redirect.to, 302)
}

