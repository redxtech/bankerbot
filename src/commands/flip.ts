import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import logger from '@logger'

import { addBalance, checkBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('flip')
		.setDescription('Flips a coin, you can bet on it.')
		.addStringOption(option =>
			option
				.setName('colour')
				.setDescription('Bet on red or black')
				.addChoices(
					{ name: 'Red', value: 'red' },
					{ name: 'Black', value: 'black' }
				)
				.setRequired(true)
		)
		.addNumberOption(option =>
			option
				.setName('amount')
				.setDescription('Amount to bet')
				.setMinValue(0)
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		logger.info('Gambling: coin flip')
		const balance = await checkBalance(interaction.user.id)
		// @ts-expect-error it works
		const bet = interaction.options.getNumber('amount') || 0
		// @ts-expect-error it works
		const choice = interaction.options.getString('colour')

		if (bet > balance) {
			await interaction.reply("You don't have enough money to make that bet.")
			return
		} else {
			const redOrBlack = Math.random() < 0.5 ? 'red' : 'black'
			if (choice === redOrBlack) {
				const newBalance = await addBalance(interaction.user.id, bet)
				await interaction.reply(
					`You won! Your balance is now ${newBalance} (+${bet}).`
				)
			} else {
				const newBalance = await addBalance(interaction.user.id, -bet)
				await interaction.reply(
					`Ha! You lost. You now have ${newBalance} ${config.get(
						'currency.name'
					)} (-${bet}).`
				)
			}
		}
	},
}
