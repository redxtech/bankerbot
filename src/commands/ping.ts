import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	Interaction,
	SlashCommandBuilder,
} from 'discord.js'

import logger from '@logger'

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('pings the bot.'),
	async execute(interaction: CommandInteraction) {
		logger.info('Ping pong!')

		const pingButton = new ButtonBuilder()
			.setCustomId('ping')
			.setLabel('ping')
			.setStyle(ButtonStyle.Primary)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(pingButton)

		const filter = (i: Interaction) =>
			// @ts-expect-error it works
			i.customId === 'ping' && i.user.id === interaction.user.id

		const collector = interaction.channel?.createMessageComponentCollector({
			filter,
			time: 15000,
		})

		if (!collector) throw new Error('no collector found')

		collector.on('collect', async i => {
			await i.update({ content: 'Ping ping!', components: [] })
		})

		await interaction.reply({ content: 'Pong!', components: [row] })
	},
}
