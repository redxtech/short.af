import convict from 'npm:convict'

export const config = convict({
	env: {
		doc: 'The application environment.',
		format: ['production', 'development', 'test'],
		default: 'development',
		env: 'DENO_ENV',
	},
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
			env: 'DB_HOST',
			arg: 'db-host',
		},
		port: {
			doc: 'The port to connect to the database with',
			format: 'port',
			default: 5432,
			env: 'DB_PORT',
			arg: 'db-port',
		},
		connections: {
			doc: 'Number of connections the pool can have',
			format: Number,
			default: 20,
			env: 'DB_CONNECTIONS',
			arg: 'db-connections',
		},
		name: {
			doc: 'Database name',
			format: String,
			default: 'yoinked',
			env: 'DB_NAME',
			arg: 'db-name',
		},
		username: {
			doc: 'Database username',
			format: String,
			default: 'yoinked',
			env: 'DB_USER',
			arg: 'db-user',
		},
		password: {
			doc: 'Database password',
			format: String,
			default: 'yoinked',
			env: 'DB_PASSWORD',
			arg: 'db-password',
		},
		cert: {
			doc: 'CA certificate for the database',
			format: String,
			default: '',
			env: 'DB_CA_CERT',
			arg: 'db-ca-cert',
		},
	},
})

config.loadFile(Deno.cwd() + '/yoinked.config.json')
