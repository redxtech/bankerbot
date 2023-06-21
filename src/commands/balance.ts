import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	userMention,
} from 'discord.js'

import config from '@config'
import logger from '@logger'

import { checkBalance } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('bal')
		.setDescription('checks your balance.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('user to check balance of')
				.setRequired(false)
		),
	async execute(interaction: CommandInteraction) {
		logger.info('Checking balance...')

		try {
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			const user = interaction.options.getUser('user') || interaction.user

			// TODO: switch to nickname
			const startOfSentence =
				user.id === interaction.user.id
					? 'You have'
					: `${userMention(user.id)} has`

			const balance = await checkBalance(guild, user.id)

			const embed = new EmbedBuilder()
				.setTitle('Balance')
				.setDescription(
					`${startOfSentence} ${balance} ${config.get('currency.name')}.`
				)
				.setColor('Blue')

			await interaction.reply({ embeds: [embed] })
		} catch (err) {
			logger.error('Something went wrong checking balance.')
			logger.error(err)
			await interaction.reply('Failed to go all in, something went wrong.')
		}
	},
}
