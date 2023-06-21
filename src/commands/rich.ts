import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
	userMention,
} from 'discord.js'

import config from '@config'
import logger from '@logger'

import { getLeaderboard } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('rich')
		.setDescription('gets the richest users.'),
	async execute(interaction: CommandInteraction) {
		logger.info('Checking top users...')

		try {
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			const users = await getLeaderboard(guild)

			const fullUsers = await Promise.all(
				users.map(async user => {
					return { ...user, mention: userMention(user.id) }
				})
			)

			// format the leaderboard
			const leaderboard = fullUsers
				.map((user, index) => {
					return `${index + 1}. ${user.mention} - ${user.balance} ${config.get(
						'currency.name'
					)}`
				})
				.join('\n')

			const embed = new EmbedBuilder()
				.setTitle('Richest Users')
				.setDescription(leaderboard)
				.setColor('Blue')

			await interaction.reply({ embeds: [embed] })
		} catch (err) {
			logger.error('Something went wrong checking rich people.')
			logger.error(err)
			await interaction.reply(
				'Failed to check rich people, something went wrong.'
			)
		}
	},
}
