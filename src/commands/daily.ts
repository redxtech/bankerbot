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

		const amount = config.get('currency.daily')

		try {
			const guild = interaction.guild?.id
			if (!guild) throw new Error('no guild found')

			// calculate time since last daily claim
			const daily = new Date(await checkDaily(guild, user.id))
			const day = 1000 * 60 * 60 * 24
			const nextDaily = new Date(daily.getTime() + day)
			const now = Date.now()
			const diff = nextDaily.getTime() - now
			const days = Math.floor(diff / day)

			// if the cooldown period isn't over,
			// return the time remaining.
			if (days >= 0) {
				const parts: Record<string, number> = {
					hour: Math.floor((diff / (1000 * 60 * 60)) % 24),
					minute: Math.floor((diff / 1000 / 60) % 60),
					second: Math.floor((diff / 1000) % 60),
				}

				const segments: Array<string> = []

				for (const key in parts) {
					const part = `${parts[key]} ${key + (parts[key] === 1 ? '' : 's')}`
					if (parts[key]) {
						segments.push(key === 'second' ? 'and ' + part : part)
					}
				}

				await interaction.reply(
					`Too soon, you fool! You can claim your daily money in ${segments.join(
						', '
					)}.`
				)
			} else {
				// update the user's balance and last claim time
				await addBalance(guild, user.id, amount)
				await setDaily(guild, user.id)
				await interaction.reply(
					`You have claimed your daily money of ${amount} ${config.get(
						'currency.name'
					)}!`
				)
			}
		} catch (err) {
			logger.error('Something went wrong claiming daily.')
			logger.error(err)
			await interaction.reply('Failed to claim daily, something went wrong.')
		}
	},
}
