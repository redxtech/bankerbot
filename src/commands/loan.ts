import { CommandInteraction, SlashCommandBuilder } from 'discord.js'

import config from '@config'
import logger from '@logger'

import { checkBalance, checkLoans, loanBalance, repayLoan } from 'db'

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
		logger.info('Managing loans...')

		// @ts-expect-error it works
		const subcommand = interaction.options.getSubcommand()

		switch (subcommand) {
			case 'create': {
				const borrower = interaction.options.getUser('borrower')
				if (!borrower)
					return await interaction.reply('You must specify a borrower')
				// @ts-expect-error it works
				const amount = interaction.options.getInteger('amount')

				const loan = await loanBalance(interaction.user.id, borrower.id, amount)
				if (loan) {
					return await interaction.reply(
						`Sent ${amount} to ${
							borrower.username
						}. You now have ${await checkBalance(
							interaction.user.id
						)} ${config.get('currency.name')}.`
					)
				} else {
					return await interaction.reply(
						`Failed to send. You don't have enough ${config.get(
							'currency.name'
						)}.`
					)
				}
			}
			case 'repay': {
				const lender = interaction.options.getUser('lender')
				if (!lender) return await interaction.reply('You must specify a lender')
				const loan = await repayLoan(interaction.user.id, lender.id)
				if (loan) {
					return await interaction.reply(
						`Sent ${loan} to ${
							lender.username
						}. You now have ${await checkBalance(
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
			}
			case 'check': {
				const loans = await checkLoans(interaction.user.id)
				const loansWithUsers = await Promise.all(
					loans.map(async loan => {
						const user = await interaction.client.users.fetch(loan.lender)
						return {
							amount: loan.amount,
							lender: user.username,
							borrower: loan.borrower,
						}
					})
				)
				if (loans) {
					const displayLoans =
						loansWithUsers
							.map(
								loan =>
									`${loan.borrower} owes ${loan.amount} ${config.get(
										'currency.name'
									)} to ${loan.lender}`
							)
							.join('\n') || 'You have no loans'
					return await interaction.reply(displayLoans)
				} else {
					return await interaction.reply('You have no loans')
				}
			}
		}

		// if (subcommand === 'create') {
		// 	const borrower = interaction.options.getUser('borrower')
		// 	// @ts-expect-error it works
		// 	const amount = interaction.options.getInteger('amount')
		// 	const loan = await transferBalance(
		// 		interaction.user.id,
		// 		borrower?.id,
		// 		amount
		// 	)
		// 	if (loan) {
		// 		await interaction.reply(
		// 			`Sent ${amount} to ${
		// 				borrower?.username
		// 			}. You now have ${await checkBalance(
		// 				interaction.user.id
		// 			)} ${config.get('currency.name')}.`
		// 		)
		// 	} else {
		// 		await interaction.reply(
		// 			`Failed to send. You don't have enough ${config.get(
		// 				'currency.name'
		// 			)}.`
		// 		)
		// 	}
		// }
	},
}