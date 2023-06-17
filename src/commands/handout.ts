import {
	CommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from 'discord.js'

import logger from '@logger'

import { addBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('handout')
		.setDescription('Gives a user some money')
		.addUserOption(option =>
			option
				.setName('recipient')
				.setDescription('user to give handout to')
				.setRequired(true)
		)
		.addNumberOption(option =>
			option
				.setName('amount')
				.setDescription('amount to handout')
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction: CommandInteraction) {
		logger.info('Giving handout to a user...')

		const recipient = interaction.options.getUser('recipient')
		// @ts-expect-error it works
		const amount = interaction.options.getNumber('amount')

		try {
			const newBalance = await addBalance(recipient?.id, amount)
			await interaction.reply(
				`Handed out. ${recipient?.username} now has ${newBalance} ${config.get(
					'currency.name'
				)}.`
			)
		} catch (err) {
			await interaction.reply(
				`Failed to send, you don't have enough ${config.get('currency.name')}.`
			)
		}
	},
}
