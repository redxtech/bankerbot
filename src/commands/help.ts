import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js'

import logger from '@logger'

import { commands } from './commands'

export default {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('shows help menu'),
	async execute(interaction: CommandInteraction) {
		logger.info('Showing help')

		const messageEmbed = new EmbedBuilder()
			.setTitle('Banker Bot Help')
			.setDescription("Here's a list of all the commands you can use:")
			.setColor('Blue')
			.setThumbnail('https://i.imgur.com/rKmmUrc.png')

		for (const command of commands) {
			messageEmbed.addFields({
				name: `\`/${command.data.name}\``,
				value: command.data.description,
			})
		}

		await interaction.reply({ embeds: [messageEmbed] })
	},
}
