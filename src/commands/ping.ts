import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import logger from '@logger'

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pings the bot'),
	async execute(interaction: CommandInteraction) {
		logger.info('Ping pong!')
		await interaction.reply('Pong!')
	},
}
