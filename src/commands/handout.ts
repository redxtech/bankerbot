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
		.addIntegerOption(option =>
			option
				.setName('amount')
				.setDescription('amount to handout')
				.setMinValue(1)
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	async execute(interaction: CommandInteraction) {
		logger.info('Giving handout to a user...')

		try {
			const recipient = interaction.options.getUser('recipient')
			// @ts-expect-error it works
			const amount = interaction.options.getInteger('amount')

			const newBalance = await addBalance(recipient?.id, amount)
			await interaction.reply(
				`Handed out. ${recipient?.username} now has ${newBalance} ${config.get(
					'currency.name'
				)}.`
			)
		} catch (err) {
			logger.error('Something went wrong giving handout.')
			logger.error(err)
			await interaction.reply('Failed to give handout, something went wrong.')
		}
	},
}
