// some useful functions

// allowed characters for a shortcut
export const allowedCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+.'
const genCharset = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789-_+.'

// predefined headers
export const headers = {
	'Content-Type': 'application/json'
}
export const htmlHeaders = {
	'Content-Type':  'text/html; charset=utf-8'
}

// check if a string is a valid url
export const isValidHttpUrl = (str: string) => {
  let url;
  try {
    url = new URL(str);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// random number generator
export const random = (upTo: number): number => Math.floor(Math.random() * upTo) + 1

// generate random string, excluding I & l
export const randomString = (length: number): string => {
	const stringBuilder = []

	// push a random character into the string builder
	for (let i = 0; i < length; i++) {
		stringBuilder.push(genCharset.charAt(random(genCharset.length)))
	}

	return stringBuilder.join('')
}

