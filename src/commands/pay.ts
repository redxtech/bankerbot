import {
	CommandInteraction,
	SlashCommandBuilder,
	userMention,
} from 'discord.js'

import logger from '@logger'

import { checkBalance, transferBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('pay')
		.setDescription('pays a user a certain amount of money.')
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

		try {
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			const recipient = interaction.options.getUser('recipient')
			// @ts-expect-error it works
			const amount = interaction.options.getInteger('amount')

			if (!recipient) {
				return await interaction.reply('You must specify a recipient.')
			}

			if (recipient?.id === interaction.user.id) {
				return await interaction.reply('You cannot pay yourself.')
			}

			if (amount > (await checkBalance(guild, interaction.user.id))) {
				return await interaction.reply(
					'You are too poor to send that much money.'
				)
			}

			const newBalance = await transferBalance(
				guild,
				interaction.user.id,
				recipient.id,
				amount
			)

			await interaction.reply(
				`Sent ${amount} to ${userMention(
					recipient.id
				)}. You now have ${newBalance} ${config.get('currency.name')}.`
			)
		} catch (err) {
			logger.error('Something went wrong paying user.')
			logger.error(err)
			await interaction.reply('Failed to pay user, something went wrong.')
		}
	},
}
