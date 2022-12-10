// simple ip grabber that reports to a discord webhook

import { serve } from "https://deno.land/std@0.167.0/http/server.ts"

import { handler } from "./server.ts"
import { port } from '../config.ts'

// main wrapper function
const main = async () => {
	// TODO allow setting port from environment
	// run the server
	await serve(handler, { port })
}

// lets goooo
main()

