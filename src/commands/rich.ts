import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import config from '@config'
import logger from '@logger'

import { getLeaderboard } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('rich')
		.setDescription('Gets the richest users'),
	async execute(interaction: CommandInteraction) {
		logger.info('Checking top users...')

		const users = await getLeaderboard()

		const fullUsers = await Promise.all(
			users.map(async user => {
				const { username } = await interaction.client.users.fetch(user.id)
				return { ...user, username }
			})
		)

		// format the leaderboard
		const leaderboard = fullUsers
			.map((user, index) => {
				return `${index + 1}. ${user.username} - ${user.balance} ${config.get(
					'currency.name'
				)}`
			})
			.join('\n')

		await interaction.reply(leaderboard)
	},
}
