import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import config from '@config'
import logger from '@logger'

import {
	calculateInterest,
	checkBalance,
	checkLoans,
	createLoan,
	repayLoan,
} from 'db'

export default {
	data: new SlashCommandBuilder()
		.setName('loan')
		.setDescription('Manager loans')
		.addSubcommand(sub =>
			sub
				.setName('create')
				.setDescription('Create a loan')
				.addUserOption(option =>
					option
						.setName('borrower')
						.setDescription('user to lend money to')
						.setRequired(true)
				)
				.addIntegerOption(option =>
					option
						.setName('amount')
						.setDescription('amount of money to loan')
						.setMinValue(1)
						.setRequired(true)
				)
		)
		.addSubcommand(sub =>
			sub
				.setName('repay')
				.setDescription('Repay a loan')
				.addUserOption(option =>
					option
						.setName('lender')
						.setDescription('user to repay loan to')
						.setRequired(true)
				)
		)
		.addSubcommand(sub =>
			sub.setName('check').setDescription('Check your loans')
		),
	async execute(interaction: CommandInteraction) {
		// @ts-expect-error it works
		const subcommand = interaction.options.getSubcommand()

		const guild = interaction.guild?.id
		if (!guild) throw new Error('no guild found')

		switch (subcommand) {
			case 'create': {
				logger.info('Creating loan...')

				try {
					const borrower = interaction.options.getUser('borrower')
					if (!borrower)
						return await interaction.reply('You must specify a borrower')

					if (borrower?.id === interaction.user.id) {
						return await interaction.reply('You cannot loan yourself money.')
					}

					// @ts-expect-error it works
					const amount = interaction.options.getInteger('amount')

					if (amount < checkBalance(guild, interaction.user.id)) {
						return await interaction.reply(
							`Failed to send. You don't have enough ${config.get(
								'currency.name'
							)}.`
						)
					}

					const newBalance = await createLoan(
						guild,
						interaction.user.id,
						borrower.id,
						amount
					)

					return await interaction.reply(
						// TODO: use nickname
						`Sent ${amount} to ${
							borrower.username
						}. You now have ${newBalance} ${config.get('currency.name')}.`
					)
				} catch (err) {
					logger.error('Something went wrong creating loan.')
					logger.error(err)
					await interaction.reply(
						'Failed to create loan, something went wrong.'
					)
				}
				break
			}
			case 'repay': {
				logger.info('Repaying loan...')

				try {
					const lender = interaction.options.getUser('lender')
					if (!lender)
						return await interaction.reply('You must specify a lender')

					const loanAmount = await repayLoan(
						guild,
						interaction.user.id,
						lender.id
					)

					if (loanAmount) {
						return await interaction.reply(
							`Sent ${loanAmount} to ${
								lender.username
							}. You now have ${await checkBalance(
								guild,
								interaction.user.id
							)} ${config.get('currency.name')}.`
						)
					} else {
						return await interaction.reply(
							`Failed to repay your loan. You don't have enough ${config.get(
								'currency.name'
							)}.`
						)
					}
				} catch (err) {
					logger.error('Something went wrong repaying loan.')
					logger.error(err)
					await interaction.reply('Failed to repay loan, something went wrong.')
				}
				break
			}
			case 'check': {
				logger.info('Checking loans...')

				try {
					const loans = await checkLoans(guild, interaction.user.id)

					const loansWithUsers = await Promise.all(
						loans.map(async loan => {
							const lenderUser = await interaction.client.users.fetch(
								loan.lender
							)
							const borrowerUser = await interaction.client.users.fetch(
								loan.borrower
							)
							return {
								amount: loan.amount,
								lender: lenderUser.username,
								borrower: borrowerUser.username,
								date: loan.date,
							}
						})
					)

					// if there are loans, display them, otherwise say there are no loans
					if (loans) {
						const displayLoans =
							loansWithUsers
								.map(
									loan =>
										`${loan.borrower} owes ${loan.amount} (+${
											calculateInterest(loan.amount, loan.date) - loan.amount
										}) ${config.get('currency.name')} to ${loan.lender}`
								)
								.join('\n') || 'You have no loans'

						return await interaction.reply(displayLoans)
					} else {
						return await interaction.reply('You have no loans')
					}
				} catch (err) {
					logger.error('Something went wrong checking loans.')
					logger.error(err)
					await interaction.reply(
						'Failed to check loans, something went wrong.'
					)
				}
			}
		}
	},
}
