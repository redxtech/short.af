// types from https://github.com/hckhanh/google-safe-browsing

type ThreatType = 'MALWARE' | 'POTENTIALLY_HARMFUL_APPLICATION' | 'SOCIAL_ENGINEERING' | 'THREAT_TYPE_UNSPECIFIED' | 'UNWANTED_SOFTWARE'

type PlatformType =
	| 'ALL_PLATFORMS'
	| 'ANDROID'
	| 'ANY_PLATFORM'
	| 'CHROME'
	| 'IOS'
	| 'LINUX'
	| 'OSX'
	| 'PLATFORM_TYPE_UNSPECIFIED'
	| 'WINDOWS'

type ThreatEntryType = 'EXECUTABLE' | 'THREAT_ENTRY_TYPE_UNSPECIFIED' | 'URL'

type ThreatEntry = { hash: string } | { url: string } | { digest: string }

interface ClientInfo {
	clientId: string
	clientVersion: string
}

interface ThreatInfo {
	threatTypes: ThreatType[]
	platformTypes: PlatformType[]
	threatEntryTypes: ThreatEntryType[]
	threatEntries: ThreatEntry[]
}

interface MetadataEntry {
	key: string
	value: string
}

interface ThreatEntryMetadata {
	entries: MetadataEntry[]
}

interface ThreatMatch {
	threatType: ThreatType
	platformType: PlatformType
	threatEntryType: ThreatEntryType
	threat: ThreatEntry
	threatEntryMetadata: ThreatEntryMetadata
	cacheDuration: string
}

interface ThreatMatch {
	threatType: ThreatType
	platformType: PlatformType
	threatEntryType: ThreatEntryType
	threat: ThreatEntry
	threatEntryMetadata: ThreatEntryMetadata
	cacheDuration: string
}

interface FindThreatMatchesRequest {
	client: ClientInfo
	threatInfo: ThreatInfo
}

interface FindThreatMatchesResponse {
	matches?: ThreatMatch[]
}

export const checkSafeBrowsing = async (env: Env, dest: string): Promise<boolean> => {
	const key = env.GOOGLE_SAFE_BROWSING_KEY

	try {
		const body: FindThreatMatchesRequest = {
			client: {
				clientId: 'shortaf',
				clientVersion: '1.0.0',
			},
			threatInfo: {
				threatTypes: ['MALWARE', 'POTENTIALLY_HARMFUL_APPLICATION', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'THREAT_TYPE_UNSPECIFIED'],
				platformTypes: ['ANY_PLATFORM'],
				threatEntryTypes: ['URL'],
				threatEntries: [{ url: dest }],
			},
		}

		const safeTest = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${key}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})

		const result = (await safeTest.json()) as FindThreatMatchesResponse

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
