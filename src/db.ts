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
): Promise<boolean> => {
	const user1 = await bank.findOne({ id: id1 })
	const user2 = await bank.findOne({ id: id2 })
	if (!user1 || !user2) return false
	if (user1.balance < amount) return false
	await bank.updateOne({ id: id1 }, { $inc: { balance: -amount } })
	await bank.updateOne({ id: id2 }, { $inc: { balance: amount } })
	return true
}
