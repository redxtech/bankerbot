import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js'

import config from '@config'
import logger from '@logger'

import { checkGambled } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('gambled')
		.setDescription('shows how much has been won/lost from gambling.'),
	async execute(interaction: CommandInteraction) {
		logger.info('Checking gambled...')

		try {
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			const amount = await checkGambled(guild)
			const message = `${amount >= 0 ? amount : -amount} ${config.get(
				'currency.name'
			)} has been ${amount >= 0 ? 'won' : 'lost'} from gambling.`

			const embed = new EmbedBuilder()
				.setDescription('Amount Gambled')
				.setDescription(message)
				.setColor(amount >= 0 ? 'Green' : 'Red')

			await interaction.reply({ embeds: [embed] })
		} catch (err) {
			logger.error('Something went wrong checking gambled.')
			logger.error(err)
			await interaction.reply('Failed to check gambled, something went wrong.')
		}
	},
}
