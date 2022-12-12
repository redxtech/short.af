import { MongoConfig } from './src/types.ts'

export const port = 8080

export const googleSafeBrowsingKey = false

export const mongo: MongoConfig = {
	host: 'yoinked_mongo',
	port: 27017,
	username: 'yoinked',
	password: 'yoinked'
}

