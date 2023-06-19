import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import logger from '@logger'
import config from '@config'
import { addBalance, checkDaily, setDaily } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Claims your daily money'),
	async execute(interaction: CommandInteraction) {
		logger.info('Claiming daily money')
		const user = interaction.user
		// const amount = config.get('currency.daily')
		const amount = 5

		// calculate time since last daily claim
		const daily = new Date(await checkDaily(user.id))
		const nextDaily = new Date(daily.getTime() + 86400000)
		const now = Date.now()
		const diff = nextDaily.getTime() - now
		const day = 1000 * 60 * 60 * 24
		const days = Math.floor(diff / day)

		// if it's been less than 24 hours since the last claim, return
		// the time remaining
		if (days < 1) {
			const hours = Math.floor(diff / (1000 * 60 * 60))
			const minutes = Math.floor((diff / (1000 * 60)) % 60)
			const seconds = Math.floor((diff / 1000) % 60)
			await interaction.reply(
				`Too soon, you fool! You can claim your daily money in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
			)
		} else {
			// update the user's balance and last claim time
			await addBalance(user.id, amount)
			await setDaily(user.id)
			await interaction.reply(
				`You have claimed your daily money of ${amount} ${config.get(
					'currency.name'
				)}!`
			)
		}
	},
}
