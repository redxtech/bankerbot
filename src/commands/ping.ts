import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	Interaction,
	SlashCommandBuilder,
} from 'discord.js'

import logger from '@logger'

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('pings the bot.'),
	async execute(interaction: CommandInteraction) {
		logger.info('Ping pong!')

		const embed = new EmbedBuilder()
			.setTitle('Ping')
			.setDescription('Pong!')
			.setColor('Blue')

		await interaction.reply({ embeds: [embed] })
	},
}
