import {
	CommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js'

import logger from '@logger'

import { setBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('set')
		.setDescription("Set a user's balance")
		.addUserOption(option =>
			option
				.setName('victim')
				.setDescription('user to set balance of')
				.setRequired(true)
		)
		.addIntegerOption(option =>
			option
				.setName('amount')
				.setDescription('amount to set')
				.setMinValue(0)
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction: CommandInteraction) {
		logger.info("Setting a user's balance...")

		try {
			const recipient = interaction.options.getUser('victim')
			// @ts-expect-error it works
			const amount = interaction.options.getInteger('amount')

			if (!recipient)
				return await interaction.reply('You must specify a victim')

			const newBalance = await setBalance(recipient.id, amount)

			await interaction.reply(
				`Set ${recipient?.username}'s balance to ${newBalance} ${config.get(
					'currency.name'
				)}.`
			)
		} catch (err) {
			logger.error('Something went wrong setting balance.')
			logger.error(err)
			await interaction.reply(
				"Failed to plan economy, you goofed! (I lied it was the bot's fault probably.)"
			)
		}
	},
}
