// handler for expand endpoint

import { Redirect } from '../types.ts'

// handle GET /expand/:shortcut
export const handleExpand = (redirect: Redirect): Response =>
	new Response(redirect.to, { status: 200 })
