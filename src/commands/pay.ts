import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import logger from '@logger'

import { checkBalance, transferBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('pay')
		.setDescription('Pays a user a certain amount of money')
		.addUserOption(option =>
			option
				.setName('recipient')
				.setDescription('user to pay')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName('amount')
				.setDescription('amount to pay')
				.setMinValue(1)
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		logger.info('Paying a user...')

		const recipient = interaction.options.getUser('recipient')
		// @ts-expect-error it works
		const amount = interaction.options.getInteger('amount')

		const transfer = await transferBalance(
			interaction.user.id,
			recipient?.id,
			amount
		)

		if (transfer) {
			await interaction.reply(
				`Sent ${amount} to ${
					recipient?.username
				}. You now have ${await checkBalance(interaction.user.id)} ${config.get(
					'currency.name'
				)}.`
			)
		} else {
			await interaction.reply(
				`Failed to send. You don't have enough ${config.get('currency.name')}.`
			)
		}
	},
}
