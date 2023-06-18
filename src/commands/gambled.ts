import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import config from '@config'
import logger from '@logger'

import { checkGambled } from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('gambled')
		.setDescription('Shows how much has been won/lost from gambling'),
	async execute(interaction: CommandInteraction) {
		logger.info('Checking gambled...')
		const amount = await checkGambled()
		await interaction.reply(
			`${amount >= 0 ? amount : -amount} ${config.get(
				'currency.name'
			)} has been ${amount >= 0 ? 'won' : 'lost'} from gambling.`
		)
	},
}
