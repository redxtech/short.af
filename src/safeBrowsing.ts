export const checkSafeBrowsing = async (env: Env, dest: string): Promise<boolean> => {
	const key = env.GOOGLE_SAFE_BROWSING_KEY

	try {
		const safeTest = await fetch(
			`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					client: {
						clientId: 'shortaf',
						clientVersion: '1.0.0',
					},
					threatInfo: {
						threatTypes: [
							'MALWARE',
							'POTENTIALLY_HARMFUL_APPLICATION',
							'SOCIAL_ENGINEERING',
							'UNWANTED_SOFTWARE',
						],
						platformTypes: ['ANY_PLATFORM'],
						threatEntryTypes: ['URL'],
						threatEntries: [{ url: dest }],
					},
				}),
			},
		)

		const result = await safeTest.json()

		// if there aren't any matches, the url is safe
		if (!result.matches) {
			return true
		}

		// if there are matches, log the error and return false
		console.error('destination is unsafe:', dest)
		console.error(result.matches)
		return false
	} catch (err) {
		console.error(err)
		return false
	}
}
