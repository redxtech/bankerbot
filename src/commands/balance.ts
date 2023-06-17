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
		const user = interaction.options.getUser('user') || interaction.user
		const startOfSentence =
			user.id === interaction.user.id ? 'You have' : `${user.username} has`

		await interaction.reply(
			`${startOfSentence} ${await checkBalance(user.id)} ${config.get(
				'currency.name'
			)}.`
		)
	},
}
