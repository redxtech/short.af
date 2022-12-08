// everything relating to the webserver is here

import { ConnInfo } from "https://deno.land/std@0.167.0/http/server.ts";
import { sendWebhook } from "./webhook.ts";
import { WebhookData } from "./types.ts";
import { links } from "../config.ts";


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

// server handler function
export const handler = async (request: Request, connInfo: ConnInfo): Promise<Response> => {
	// only send webhook if not favicon
	const url = new URL(request.url);
	if (!/favicon.ico/.test(url.pathname)) {
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

	// get shortcut and destination if they exist
	const shortcut: string = url.pathname.substring(url.pathname.indexOf('/') + 1)
	const redirect = links.find(l => l.from === shortcut)

	// if a shortcut exists, redirect to it
	if (redirect) {
		return Response.redirect(redirect.to, 302)
	} else {
		// respond with the same body regardless of request
		const body = 'hello friend\n';

		return new Response(body, { status: 200 });
	}
};
