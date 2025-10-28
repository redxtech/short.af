// we do some trolling
export const troll = async (): Promise<Response> => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(new Response(';)', { status: 418 }))
		}, 10_000)
	})
}

