import convict from 'npm:convict';

export const config = convict({
	port: {
		doc: 'The port for the webserver to listen on',
		format: 'port',
		default: 8080,
		env: 'PORT',
		arg: 'port',
	},
	googleSafeBrowsingKey: {
		doc: 'API Key to enable google safe browsing checking',
		format: String,
		default: undefined,
		env: 'GOOGLE_SAFE_BROWSING_KEY',
		arg: 'safe-browsing-key',
	},
	db: {
		host: {
			doc: 'Database host name/IP',
			format: '*',
			default: 'localhost',
		},
		port: {
			doc: 'The port to connect to the database with',
			format: 'port',
			default: 27017,
		},
		name: {
			doc: 'Database name',
			format: String,
			default: 'yoinked',
		},
		username: {
			doc: 'Database username',
			format: String,
			default: 'yoinked',
		},
		password: {
			doc: 'Database password',
			format: String,
			default: 'yoinked',
		},
	},
});

config.loadFile(Deno.cwd() + '/yoinked.config.json');
