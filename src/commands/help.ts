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
		.setDescription('shows help menu.'),
	async execute(interaction: CommandInteraction) {
		logger.info('Showing help')

		const messageEmbed = new EmbedBuilder()
			.setTitle('Banker Bot Help')
			.setDescription("Here's a list of all the commands you can use:")
			.setColor('Blue')
			.setThumbnail('https://i.imgur.com/rKmmUrc.png')

		for (const command of commands) {
			const description = `Description: *${command.data.description}*`

			const options = command.data.options?.map(
				// @ts-expect-error it works
				option => `${option.name} -> ${option.description}`
			)

			const value = options?.length
				? `${description}\nOptions: *${options.join(', ')}*`
				: description

			messageEmbed.addFields({
				name: `\`/${command.data.name}\``,
				value,
			})
		}

		await interaction.reply({ embeds: [messageEmbed] })
	},
}
