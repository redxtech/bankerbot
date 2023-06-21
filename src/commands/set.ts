import {
	CommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	userMention,
} from 'discord.js'

import logger from '@logger'

import { setBalance } from 'db'
import config from '@config'

export default {
	data: new SlashCommandBuilder()
		.setName('set')
		.setDescription("set a user's balance.")
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
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			const recipient = interaction.options.getUser('victim')
			// @ts-expect-error it works
			const amount = interaction.options.getInteger('amount')

			if (!recipient)
				return await interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('Set Balance')
							.setDescription('You must specify a victim')
							.setColor('Red'),
					],
				})

			const newBalance = await setBalance(guild, recipient.id, amount)

			const message = `Set ${userMention(
				recipient.id
			)}'s balance to ${newBalance} ${config.get('currency.name')}.`

			const embed = new EmbedBuilder()
				.setTitle('Assign Balance')
				.setDescription(message)
				.setColor('Green')

			await interaction.reply({ embeds: [embed] })
		} catch (err) {
			logger.error('Something went wrong setting balance.')
			logger.error(err)
			await interaction.reply(
				"Failed to plan economy, you goofed! (I lied it was the bot's fault probably.)"
			)
		}
	},
}
