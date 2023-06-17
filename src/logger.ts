import { ISettingsParam, Logger } from 'tslog'
import config from '@config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const loggerOptions: ISettingsParam<Record<string, any>> = {
	type: config.get('logger.enabled')
		? (config.get('logger.format') as 'json' | 'pretty')
		: 'hidden',
	prettyLogTemplate: '[{{name}}{{logLevelName}}] ',
	prettyErrorTemplate: '{{errorMessage}}\n{{errorStack}}',
	minLevel: [
		'silly',
		'trace',
		'debug',
		'info',
		'warn',
		'error',
		'fatal',
	].indexOf(config.get('logger.level')),
	metaProperty: 'metadata',
	overwrite: {
		mask(args) {
			if (config.get('logger.format') !== 'pretty') return args
			// Strip objects from logs if pretty logging is enabled and this option isn't overridden
			return args.filter(
				arg =>
					typeof arg !== 'object' ||
					config.get('logger.includeLogObjInPretty') ||
					config.get('logger.format') !== 'pretty'
			)
		},
	},
}
const logger = new Logger(loggerOptions)

export default logger
