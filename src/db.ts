import { MongoClient } from 'mongodb'
import { Snowflake } from 'discord.js'

import config from '@config'

// initialization
const connectURL =
	(config.get('db.url')
		? config.get('db.url')
		: `mongodb://${config.get('db.username')}:${config.get(
				'db.password'
		  )}@${config.get('db.host')}:${config.get('db.port').toString()}`) || ''

if (!config.get('db.url') && !config.get('db.host')) {
	throw Error('database url or hostname required')
}

const client = new MongoClient(connectURL)
export const dbclient = client.connect().then(() => db) // workaround to wait for db connect
const db = client.db(config.get('db.name'))
const bank = db.collection('bank')
const loans = db.collection('loans')
const gamble = db.collection('gamble')

// function to check a users balance
export const checkBalance = async (id: Snowflake): Promise<number> => {
	const user = await bank.findOne({ id })
	if (!user) {
		await bank.insertOne({ id, balance: 0 })
		return 0
	} else {
		return user.balance
	}
}

// function to add money to a users balance
export const addBalance = async (
	id: Snowflake | undefined,
	amount: number
): Promise<number> => {
	const user = await bank.findOne({ id })
	if (!user || !id) {
		await bank.insertOne({ id, balance: amount })
		return amount
	} else {
		await bank.updateOne({ id }, { $inc: { balance: amount } })
		return await checkBalance(id)
	}
}

// function to transfer money from one user to another
export const transferBalance = async (
	id1: Snowflake,
	id2: Snowflake | undefined,
	amount: number
): Promise<number> => {
	const user1 = await bank.findOne({ id: id1 })
	const user2 = await bank.findOne({ id: id2 })
	if (!user1 || !user2) throw Error('user not found')
	if (user1.balance < amount) throw Error('insufficient funds')
	await bank.updateOne({ id: id1 }, { $inc: { balance: -amount } })
	await bank.updateOne({ id: id2 }, { $inc: { balance: amount } })
	return user1.balance - amount
}

// function to set a users balance
export const setBalance = async (id: Snowflake, amount: number) => {
	const user = await bank.findOne({ id })
	if (!user) {
		await bank.insertOne({ id, balance: amount })
		return amount
	}
	await bank.updateOne({ id }, { $set: { balance: amount } })
	return amount
}

type LeaderboardEntry = {
	id: Snowflake
	balance: number
}

// function to loan money to a user
export const createLoan = async (
	lender: Snowflake,
	borrower: Snowflake,
	amount: number
) => {
	const user1 = await bank.findOne({ id: lender })
	const user2 = await bank.findOne({ id: borrower })
	if (!user1 || !user2) return false
	if (user1.balance < amount) return false

	// log the loan in the database
	await loans.insertOne({
		lender,
		borrower,
		amount,
		date: Date.now(),
	})

	await bank.updateOne({ id: lender }, { $inc: { balance: -amount } })
	await bank.updateOne({ id: borrower }, { $inc: { balance: amount } })
	return true
}

export const calculateInterest = (amount: number, date: Date) => {
	date = new Date(date)
	const interest = config.get('currency.interest')
	const days = (Date.now() - date.getTime()) / 1000 / 60 / 60 / 24
	return Math.ceil(amount * (1 + interest) ** days)
}

// functuon to check the loans a user has
export const checkLoans = async (id: Snowflake) => {
	const loansList = await loans
		.find({ $or: [{ borrower: id }, { lender: id }] })
		.toArray()
	return loansList
}

// function to check the loans a user has given
export const checkLoansGiven = async (id: Snowflake) => {
	const loansList = await loans.find({ lender: id }).toArray()
	return loansList
}

// function to repay a loan
export const repayLoan = async (borrower: Snowflake, lender: Snowflake) => {
	const loan = await loans.findOne({ borrower, lender })
	// get the loan from the database
	if (!loan) return 0
	const balance = await checkBalance(borrower)

	const owed = calculateInterest(loan.amount, loan.date)

	// check if the user has enough money to repay the loan
	if (owed > balance) return 0

	// repay the loan
	await bank.updateOne({ id: borrower }, { $inc: { balance: -owed } })
	await bank.updateOne({ id: lender }, { $inc: { balance: owed } })
	await loans.deleteOne({ borrower, lender })
	return owed
}

// function to get the leaderboard
export const getLeaderboard = async (
	amount?: number
): Promise<LeaderboardEntry[]> => {
	const leaderboard = await bank
		.find<LeaderboardEntry>({})
		.sort({ balance: -1 })
		.toArray()
	// return only the top n entries
	return leaderboard ? leaderboard.slice(0, amount || 10) : []
}

// function to keep track of how much money has been won by gambling
export const addGamble = async (amount: number): Promise<number> => {
	const gambleAmount = await gamble.findOne({ id: 'gamble' })
	if (!gambleAmount) {
		await gamble.insertOne({ id: 'gamble', amount })
		return amount
	} else {
		await gamble.updateOne({ id: 'gamble' }, { $inc: { amount } })
		return gambleAmount.amount + amount
	}
}

// function to check how much money has been won by gambling
export const checkGambled = async (): Promise<number> => {
	const gambleAmount = await gamble.findOne({ id: 'gamble' })
	if (!gambleAmount) {
		await gamble.insertOne({ id: 'gamble', amount: 0 })
		return 0
	} else {
		return gambleAmount.amount
	}
}

// function to check the number of days since a user claimed their daily money
export const checkDaily = async (id: Snowflake): Promise<number> => {
	const user = await bank.findOne({ id })
	if (!user) {
		const daily = Date.now()
		await bank.insertOne({ id, balance: 0, daily })
		return daily
	} else {
		return user.daily
	}
}

// function to update the last time a user claimed their daily money
export const setDaily = async (id: Snowflake) => {
	const user = await bank.findOne({ id })
	const daily = Date.now()
	if (!user) {
		await bank.insertOne({ id, balance: 0, daily })
		return daily
	}
	await bank.updateOne({ id }, { $set: { daily } })

	return Date.now()
}
