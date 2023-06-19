import convict from 'convict'
import { existsSync } from 'fs'

const config = convict({
	env: {
		doc: 'The application environment.',
		format: ['production', 'development', 'test'],
		default: 'development',
		env: 'NODE_ENV',
	},
	token: {
		doc: 'Discord bot token',
		format: String,
		default: '',
		env: 'TOKEN',
		arg: 'token',
	},
	clientID: {
		doc: 'Discord bot client ID',
		format: String,
		default: '',
		env: 'CLIENT_ID',
		arg: 'client-id',
	},
	hostID: {
		doc: "UUID of bot's host",
		format: String,
		default: null,
		env: 'HOST_ID',
		arg: 'host-id',
	},
	currency: {
		name: {
			doc: 'Name of currency',
			format: String,
			default: 'coins',
			env: 'CURRENCY_NAME',
			arg: 'currency-name',
		},
		daily: {
			doc: 'Amount of currency given daily',
			format: Number,
			default: 5,
			env: 'CURRENCY_DAILY',
			arg: 'currency-daily',
		},
		interest: {
			doc: 'Amount of interest to charge daily',
			format: Number,
			default: 0.05,
			env: 'CURRENCY_INTEREST',
			arg: 'currency-interest',
		},
		debt: {
			doc: 'Max amount of currency that can be in debt',
			format: Number,
			default: 100,
			env: 'CURRENCY_DEBT',
			arg: 'currency-debt',
		},
	},
	db: {
		url: {
			doc: 'Mongo connection URL',
			format: String,
			default: undefined,
			env: 'DB_URL',
			arg: 'db-url',
		},
		host: {
			doc: 'Database host name/IP',
			format: '*',
			default: undefined,
			env: 'DB_HOST',
			arg: 'db-host',
		},
		port: {
			doc: 'The port to connect to the database with',
			format: 'port',
			default: 27017,
			env: 'DB_PORT',
			arg: 'db-port',
		},
		name: {
			doc: 'Database name',
			format: String,
			default: 'pingbot',
			env: 'DB_NAME',
			arg: 'db-name',
		},
		username: {
			doc: 'Database username',
			format: String,
			default: 'pingbot',
			env: 'DB_USER',
			arg: 'db-user',
		},
		password: {
			doc: 'Database password',
			format: String,
			default: 'pingbot',
			env: 'DB_PASS',
			arg: 'db-pass',
		},
	},
	logger: {
		enabled: {
			doc: 'Whether console logging is enabled or not',
			format: Boolean,
			default: true,
		},
		level: {
			doc: 'Log only if level less than or equal to this level',
			format: ['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'trace'],
			default: 'debug',
		},
		format: {
			doc: 'Whether to use pretty or json logging',
			format: ['pretty', 'json'],
			default: 'pretty',
		},
		includeLogObjInPretty: {
			doc: 'Whether to include the log object in pretty logging',
			format: Boolean,
			default: true,
		},
	},
})

// // load config files
const configFiles: Array<string> = [config.get('env'), 'local']

configFiles.forEach(file => {
	const filePath = `./config/${file}.json`

	if (existsSync(filePath)) {
		config.loadFile(filePath)
	}
})

// perform validation
config.validate({ allowed: 'strict' })

export default config
