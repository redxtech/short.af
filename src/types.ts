// schema for redirects list
export type Redirect = {
	from: string
	to: string
	yoink?: boolean
}

export type MongoConfig = {
	host: string
	port: number
	username: string
	password: string
}

