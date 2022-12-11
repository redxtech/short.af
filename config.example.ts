import { EnabledDataPoints } from './src/types.ts'

export const port = 8080

export const webhookURL = ''

export const token = ''

export const mongo = {
	host: '127.0.0.1',
	port: '27017',
	username: 'yoinked',
	password: 'yoinked'
}

export const enabled: EnabledDataPoints = {
	ip: true,
	method: true,
	url: true,
	ua: true,
	host: false,
	shortcut: true,
	dnt: false,
	upgrade: false,
	redirect: false,
	forwarded: {
		for: true,
		host: true,
		proto: false,
		scheme: false
	},
	location:{
		isp: true,
		timezone: true
	}
}
