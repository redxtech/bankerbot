import { Client, Events, GatewayIntentBits } from 'discord.js'

import config from '@config'
import logger from '@logger'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once(Events.ClientReady, c => {
	logger.info(`Ready! Logged in as ${c.user.tag}`)
})

client.login(config.get('token'))
