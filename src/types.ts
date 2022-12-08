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

export type Redirects = {
	from: string
	to: string
}[]
