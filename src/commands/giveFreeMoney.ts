import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	userMention,
} from 'discord.js'

import logger from '@logger'

import { checkBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('givefreemoney')
		.setDescription('gives you some free money.'),
	async execute(interaction: CommandInteraction) {
		logger.info('Giving free money to a user...')

		try {
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			const balance = await checkBalance(guild, interaction.user.id)

			if (interaction.user.id === config.get('hostID')) {
				const message = `Free Money!!! Giving ${userMention(
					interaction.user.id
				)} 1000 of free ${config.get('currency.name')}, for a total of ${
					balance + 1000
				} ${config.get('currency.name')}.`

				const embed = new EmbedBuilder()
					.setTitle('Giving Free Money')
					.setDescription(message)
					.setColor('Green')

				await interaction.reply({ embeds: [embed] })
			} else {
				const embed = new EmbedBuilder()
					.setTitle('No Free Money')
					.setDescription('You cannot receive free money.')
					.setColor('Red')

				await interaction.reply({ embeds: [embed] })
			}
		} catch (err) {
			logger.error('Something went wrong giving out free money.')
			logger.error(err)
			await interaction.reply(
				'Failed to give free money, something went wrong.'
			)
		}
	},
}
