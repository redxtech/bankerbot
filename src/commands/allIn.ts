import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js'

import logger from '@logger'

import { addGamble, checkBalance, setBalance } from 'db'
import config from '@config'
import { upCase } from 'utils'

export default {
	data: new SlashCommandBuilder()
		.setName('all-in')
		.setDescription('Flips a coin, you can bet on it (whole balance only).')
		.addStringOption(option =>
			option
				.setName('colour')
				.setDescription('Bet on red or black')
				.addChoices(
					{ name: 'red', value: 'red' },
					{ name: 'black', value: 'black' }
				)
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		logger.info('Gambling: coin flip exponential')
		const balance = await checkBalance(interaction.user.id)
		// @ts-expect-error it works
		const choice = interaction.options.getString('colour')

		const redOrBlack = Math.random() < 0.5 ? 'red' : 'black'
		const won = choice === redOrBlack

		const newBalance = won ? balance ** 2 : Math.floor(Math.sqrt(balance))
		const diff = newBalance - balance
		await setBalance(interaction.user.id, newBalance)
		await addGamble(diff)

		const response = new EmbedBuilder()
			.setColor(redOrBlack === 'red' ? 'Red' : 'NotQuiteBlack')
			.setTitle(won ? 'You won!' : 'Ha! You lost!')
			.setDescription(
				`You bet it all on ${choice} and the ball landed on ${redOrBlack}.`
			)
			.addFields(
				{
					name: 'Bet Amount',
					value: `${balance} ${config.get('currency.name')}`,
					inline: true,
				},
				{ name: 'Bet Colour', value: upCase(choice), inline: true },
				{ name: 'Actual Colour', value: upCase(redOrBlack), inline: true },
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
