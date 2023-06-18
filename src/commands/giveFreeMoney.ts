import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import logger from '@logger'

import { checkBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('givefreemoney')
		.setDescription('Gives you some money'),
	async execute(interaction: CommandInteraction) {
		logger.info('Giving free money to a user...')

		const balance = await checkBalance(interaction.user.id)

		if (interaction.user.id === config.get('hostID')) {
			await interaction.reply(
				`Free Money!!! Giving ${
					interaction.user.username
				} 1000 of free ${config.get('currency.name')}, for a total of ${
					balance + 1000
				} ${config.get('currency.name')}.`
			)
		} else {
			await interaction.reply('You cannot receive free money.')
		}
		// try {
		// const newBalance = await addBalance(interaction.user.id, 1000)
		// } catch (err) {
		// 	await interaction.reply(
		// 		`Failed to send, you don't have enough ${config.get('currency.name')}.`
		// 	)
		// }
	},
}
