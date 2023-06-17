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

export type Command = {
	data: SlashCommandBuilder
	execute: (interaction: CommandInteraction) => Promise<void>
}

const client: Client & { commands?: Collection<string, Command> } = new Client({
	intents: [GatewayIntentBits.Guilds],
})

client.commands = new Collection()

commands.forEach((command: Command) => {
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

client.on(Events.InteractionCreate, async interaction => {
	console.log(interaction)
	if (!interaction.isChatInputCommand()) return

	// @ts-expect-error added the type
	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`)
		return
	}

	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			})
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			})
		}
	}
})

client.login(config.get('token'))
