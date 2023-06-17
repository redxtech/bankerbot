import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import logger from '@logger'

import { checkBalance } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('bal')
		.setDescription('Checks your balance'),
	async execute(interaction: CommandInteraction) {
		logger.info('Checking balance...')
		await interaction.reply(
			`Your balance is ${await checkBalance(interaction.user.id)}.`
		)
	},
}
