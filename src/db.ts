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

// check if the url or host is set
if (!config.get('db.url') && !config.get('db.host')) {
	throw Error('database url or hostname required')
}

// create the client
const client = new MongoClient(connectURL)
export const dbclient = client.connect().then(() => db) // workaround to wait for db connect

// get the collections
const db = client.db(config.get('db.name'))
const bank = db.collection('bank')
const loans = db.collection('loans')
const gamble = db.collection('gamble')

// function to check a users balance
export const checkBalance = async (
	guild: Snowflake,
	id: Snowflake
): Promise<number> => {
	const user = await bank.findOne({ id, guild })

	// if the user doesn't exist, create it. otherwise return the balance
	if (!user) {
		await bank.insertOne({ id, guild, balance: 0 })
		return 0
	} else {
		return user.balance
	}
}

// function to add money to a users balance
export const addBalance = async (
	guild: Snowflake,
	id: Snowflake | undefined,
	amount: number
): Promise<number> => {
	const user = await bank.findOne({ id, guild })
	if (!user || !id) {
		// if the user doesn't exist, create it
		await bank.insertOne({ id, guild, balance: amount })
		return amount
	} else {
		// update the balance and return it
		await bank.updateOne({ id, guild }, { $inc: { balance: amount } })
		return await checkBalance(guild, id)
	}
}

// function to transfer money from one user to another
export const transferBalance = async (
	guild: Snowflake,
	id1: Snowflake,
	id2: Snowflake,
	amount: number
): Promise<number> => {
	// get the users from the database
	const user1 = await bank.findOne({ id: id1, guild })
	const user2 = await bank.findOne({ id: id2, guild })

	// if the user doesn't exist, throw an error
	if (!user1 || !user2) throw Error('user not found')
	if (user1.balance < amount) throw Error('insufficient funds')

	// update the balances
	await bank.updateOne({ id: id1, guild }, { $inc: { balance: -amount } })
	await bank.updateOne({ id: id2, guild }, { $inc: { balance: amount } })

	// return the new balance
	return user1.balance - amount
}

// function to set a users balance
export const setBalance = async (
	guild: Snowflake,
	id: Snowflake,
	amount: number
) => {
	// get the user from the database
	const user = await bank.findOne({ id, guild })

	// if the user doesn't exist, create it
	if (!user) {
		await bank.insertOne({ id, guild, balance: amount })
		return amount
	}

	// update the balance and return it
	await bank.updateOne({ id, guild }, { $set: { balance: amount } })
	return amount
}

// function to loan money to a user
export const createLoan = async (
	guild: Snowflake,
	lender: Snowflake,
	borrower: Snowflake,
	amount: number
) => {
	// get the users from the database
	const user1 = await bank.findOne({ id: lender, guild })
	const user2 = await bank.findOne({ id: borrower, guild })

	// check if the users exist and if the lender has enough money
	if (!user1 || !user2) throw Error('user not found')
	if (user1.balance < amount) throw Error('insufficient funds')

	// log the loan in the database
	await loans.insertOne({
		guild,
		lender,
		borrower,
		amount,
		date: Date.now(),
	})

	// update the balances
	await bank.updateOne({ id: lender, guild }, { $inc: { balance: -amount } })
	await bank.updateOne({ id: borrower, guild }, { $inc: { balance: amount } })

	// return the new balance
	return user1.balance - amount
}

export const calculateInterest = (amount: number, date: Date) => {
	date = new Date(date)
	const interest = config.get('currency.interest')
	const days = (Date.now() - date.getTime()) / 1000 / 60 / 60 / 24
	return Math.ceil(amount * (1 + interest) ** days)
}

// functuon to check the loans a user has
export const checkLoans = async (guild: Snowflake, id: Snowflake) => {
	// get the loans from the database and return them
	return await loans
		// TODO: check if this works
		.find({ guild, $or: [{ borrower: id }, { lender: id }] })
		.toArray()
}

// function to check the loans a user has given
export const checkLoansGiven = async (guild: Snowflake, id: Snowflake) => {
	return await loans.find({ lender: id, guild }).toArray()
}

// function to repay a loan
export const repayLoan = async (
	guild: Snowflake,
	borrower: Snowflake,
	lender: Snowflake
) => {
	const loan = await loans.findOne({ borrower, lender, guild })
	// get the loan from the database
	if (!loan) return 0

	// get the balance of the user and the amount they owe
	const balance = await checkBalance(guild, borrower)
	const owed = calculateInterest(loan.amount, loan.date)

	// check if the user has enough money to repay the loan
	if (owed > balance) return 0

	// repay the loan and delete it from the database
	await bank.updateOne({ id: borrower, guild }, { $inc: { balance: -owed } })
	await bank.updateOne({ id: lender, guild }, { $inc: { balance: owed } })
	await loans.deleteOne({ borrower, lender, guild })

	return owed
}

type LeaderboardEntry = {
	id: Snowflake
	balance: number
	guild: Snowflake
}

// function to get the leaderboard
export const getLeaderboard = async (
	guild: Snowflake,
	amount?: number
): Promise<LeaderboardEntry[]> => {
	const leaderboard = await bank
		.find<LeaderboardEntry>({ guild })
		.sort({ balance: -1 })
		.toArray()

	// return only the top n entries
	return leaderboard ? leaderboard.slice(0, amount || 10) : []
}

// function to keep track of how much money has been won by gambling
export const addGamble = async (
	guild: Snowflake,
	amount: number
): Promise<number> => {
	const gambleAmount = await gamble.findOne({ id: 'gamble', guild })

	// if there is no entry for the gamble, create one
	// otherwise, update the amount
	if (!gambleAmount) {
		await gamble.insertOne({ id: 'gamble', guild, amount })
		return amount
	} else {
		await gamble.updateOne({ id: 'gamble', guild }, { $inc: { amount } })
		return gambleAmount.amount + amount
	}
}

// function to check how much money has been won by gambling
export const checkGambled = async (guild: Snowflake): Promise<number> => {
	const gambleAmount = await gamble.findOne({ id: 'gamble', guild })

	// if there is no entry for the gamble, create one
	// otherwise, return the amount
	if (!gambleAmount) {
		await gamble.insertOne({ id: 'gamble', guild, amount: 0 })
		return 0
	} else {
		return gambleAmount.amount
	}
}

// function to check the number of days since a user claimed their daily money
export const checkDaily = async (
	guild: Snowflake,
	id: Snowflake
): Promise<number> => {
	const user = await bank.findOne({ id, guild })

	// if the user doesn't exist, create it
	if (!user) {
		const daily = Date.now()
		await bank.insertOne({ id, guild, balance: 0, daily })
		return daily
	} else {
		return user.daily
	}
}

// function to update the last time a user claimed their daily money
export const setDaily = async (guild: Snowflake, id: Snowflake) => {
	const user = await bank.findOne({ id, guild })
	const daily = Date.now()
	if (!user) {
		await bank.insertOne({ id, guild, balance: 0, daily })
		return daily
	}
	await bank.updateOne({ id, guild }, { $set: { daily } })

	return Date.now()
}
