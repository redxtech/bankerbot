import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js'

import logger from '@logger'

import { addGamble, checkBalance, setBalance } from 'db'
import config from '@config'
import { random } from 'utils'

export default {
	data: new SlashCommandBuilder()
		.setName('all-in')
		.setDescription('Flips a coin, you can bet on it (whole balance only).')
		.addIntegerOption(option =>
			option
				.setName('number')
				.setDescription('Number to bet on')
				.setMinValue(0)
				.setMaxValue(10)
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		logger.info('Gambling: coin flip exponential')
		const balance = await checkBalance(interaction.user.id)
		// @ts-expect-error it works
		const choice = interaction.options.getInteger('number')

		const number = random(10)
		const won = choice === number

		const newBalance = won ? balance ** 2 : Math.floor(Math.sqrt(balance))
		const diff = newBalance - balance
		await setBalance(interaction.user.id, newBalance)
		await addGamble(diff)

		const response = new EmbedBuilder()
			.setColor(won ? 'Green' : 'Red')
			.setTitle(won ? 'You lucky fucker, you won!' : 'Ha! You fool! You lost!')
			.setDescription(
				`You bet it all on ${choice} and the ball landed on ${number}.`
			)
			.addFields(
				{
					name: 'Bet Amount',
					value: `${balance} ${config.get('currency.name')}`,
					inline: true,
				},
				{ name: 'Bet Number', value: `${choice}`, inline: true },
				{ name: 'Actual Number', value: `${number}`, inline: true },
				{
					name: 'New balance',
					value: `${newBalance} ${config.get('currency.name')}`,
					inline: true,
				}
			)
			.setThumbnail(
				won
					? 'https://media.tenor.com/B85QfhcxFKMAAAAC/rat-spinning.gif'
					: 'https://cdn.discordapp.com/attachments/1117852257157906492/1119782228407361696/ezgif.com-gif-maker.gif'
			)
		await interaction.reply({ embeds: [response] })
	},
}
