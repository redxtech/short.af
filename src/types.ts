// type for data passed to webhook function
export type WebhookData = {
	ip: string
	method: string
	url: string
	useragent: string
	host: string
	dnt?: string
	upgrade?: string
	redirect?: string
	forwarded?: {
		ip: string | undefined
		for: string | undefined
		host: string | undefined
		proto: string | undefined
		scheme: string | undefined
	}
	ch?: {
		ua: string | undefined
		mobile: string | undefined
		platform: string | undefined
	}
	location?: Record<string, string | undefined>
}

// schema for redirects list
export type Redirects = {
	from: string
	to: string
}[]

// scheme for enabled data points configuration
export type EnabledDataPoints = {
	ip: boolean,
	method: boolean,
	url: boolean,
	ua: boolean,
	host: boolean,
	shortcut: boolean,
	dnt: boolean,
	upgrade: boolean,
	redirect: boolean,
	forwarded: {
		for: boolean,
		host: boolean,
		proto: boolean,
		scheme: boolean
	},
	location:{
		isp: boolean,
		timezone: boolean
	}
}

