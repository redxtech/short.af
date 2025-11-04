// some useful functions

// allowed characters for a shortcut
export const allowedCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+.'
const genCharset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'

// check if a string is a valid url
export const isValidHttpUrl = (str: string) => {
	let url
	try {
		url = new URL(str)
	} catch (_) {
		return false
	}
	return url.protocol === 'http:' || url.protocol === 'https:'
}

// random number generator
export const random = (upTo: number): number => Math.floor(Math.random() * upTo) + 1

// generate random string in base58
export const randomString = (length: number): string => {
	const stringBuilder = []

	// push a random character into the string builder
	for (let i = 0; i < length; i++) {
		stringBuilder.push(genCharset.charAt(random(genCharset.length)))
	}

	return stringBuilder.join('')
}

// check if a shortcut exists by checking if it's in the kv namespace
export const checkExists = async (env: Env, shortcut: string): Promise<boolean> => (await env.REDIRECTS.get(shortcut)) !== null
