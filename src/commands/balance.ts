import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import config from '@config'
import logger from '@logger'

import { checkBalance } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('bal')
		.setDescription('Checks your balance')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('user to check balance of')
				.setRequired(false)
		),
	async execute(interaction: CommandInteraction) {
		logger.info('Checking balance...')

		try {
			const user = interaction.options.getUser('user') || interaction.user
			// TODO: switch to nickname
			const startOfSentence =
				user.id === interaction.user.id ? 'You have' : `${user.username} has`

			await interaction.reply(
				`${startOfSentence} ${await checkBalance(user.id)} ${config.get(
					'currency.name'
				)}.`
			)
		} catch (err) {
			logger.error('Something went wrong checking balance.')
			logger.error(err)
			await interaction.reply('Failed to go all in, something went wrong.')
		}
	},
}
