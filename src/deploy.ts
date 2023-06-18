import {
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from 'discord.js'

import config from '@config'
import logger from '@logger'

import { commands } from 'commands/commands'

const deploy: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
commands.forEach(command => {
	if ('data' in command && 'execute' in command) {
		deploy.push(command.data.toJSON())
	} else {
		logger.warn(
			`The command ${command} is missing a required "data" or "execute" property.`
		)
	}
})

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.get('token'))

// and deploy your commands!
;(async () => {
	try {
		console.log(`Started refreshing ${deploy.length} application (/) commands.`)

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(config.get('clientID')),
			{ body: deploy }
		)

		console.log(
			// @ts-expect-error type should be fine
			`Successfully reloaded ${data.length} application (/) commands.`
		)
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error)
	}
})()
