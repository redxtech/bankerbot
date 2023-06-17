import {
	Client,
	Collection,
	CommandInteraction,
	Events,
	GatewayIntentBits,
	SlashCommandBuilder,
} from 'discord.js'

import config from '@config'
import logger from '@logger'

import { commands } from 'commands/commands'
import { slashCommandHandler } from 'slashCommandHandler'

export type Command = {
	data: SlashCommandBuilder
	execute: (interaction: CommandInteraction) => Promise<void>
}

const client: Client & { commands?: Collection<string, unknown> } = new Client({
	intents: [GatewayIntentBits.Guilds],
})

client.commands = new Collection()

commands.forEach(command => {
	if ('data' in command && 'execute' in command) {
		client.commands?.set(command.data.name, command)
	} else {
		logger.warn(
			`The command ${command} is missing a required "data" or "execute" property.`
		)
	}
})

client.once(Events.ClientReady, c => {
	logger.info(`Ready! Logged in as ${c.user.tag}`)
})

client.on(Events.InteractionCreate, slashCommandHandler)

client.login(config.get('token'))
