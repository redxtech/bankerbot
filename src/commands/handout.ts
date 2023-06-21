import {
	CommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	userMention,
} from 'discord.js'

import logger from '@logger'

import { addBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('handout')
		.setDescription('gives a user some money.')
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
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			const recipient = interaction.options.getUser('recipient')

			if (!recipient) throw new Error('no recipient found')

			// @ts-expect-error it works
			const amount = interaction.options.getInteger('amount')

			const newBalance = await addBalance(guild, recipient.id, amount)
			await interaction.reply(
				`Handed out. ${userMention(
					recipient.id
				)} now has ${newBalance} ${config.get('currency.name')}.`
			)
		} catch (err) {
			logger.error('Something went wrong giving handout.')
			logger.error(err)
			await interaction.reply('Failed to give handout, something went wrong.')
		}
	},
}
