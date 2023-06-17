import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import logger from '@logger'

import { checkBalance, transferBalance } from 'db'

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
		.addNumberOption(option =>
			option.setName('amount').setDescription('amount to pay').setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		logger.info('Paying a user...')

		const recipient = interaction.options.getUser('recipient')
		// @ts-expect-error it works
		const amount = interaction.options.getNumber('amount')

		const transfer = await transferBalance(
			interaction.user.id,
			recipient?.id,
			amount
		)

		if (transfer) {
			await interaction.reply(
				`Sent. Your balance is now ${await checkBalance(interaction.user.id)}.`
			)
		} else {
			await interaction.reply("Failed to send, you don't have enough money")
		}
	},
}
