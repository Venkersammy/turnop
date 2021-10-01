const fs = require('fs')
const { Client, Intents, Constants } = require('discord.js')
const { token, guildId } = require('../config.json')
const mongoose = require('./mongoose')
const user = require('../schemas/userSchema')
const phone = require('../schemas/phoneSchema')
const mongo = require('mongodb')
const { db } = require('../schemas/userSchema')
const { add } = require('lodash')

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const connectToMongoDB = async () => {
	await mongoose().then((mongoose) => {
		try {
			console.log('Connected to mongodb!')
		}
		catch {
			mongoose.connection.close()
		}
	})
}

client.once('ready', () => {
	console.log('Ready!')
	connectToMongoDB()

	const guild = client.guilds.cache.get(guildId)
	let commands

	if (guild) {
		commands = guild.commands
	} 
	else {
		commands = client.application?.commands
	}

	commands?.create({
		name: 'turnop',
		description: "Notify subscribers when you turn up to voice chat.",
		
	})

	commands?.create({
		name: 'add',
		description: "Add your phone number you want to be notified at.",
		options: [
			{
				name: 'phone',
				description: 'phone number',
				required: true,
				type: 3
			}
		]
	})	
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) {
		return
	}

	const { commandName, options } = interaction

	if (commandName === 'turnop') {

		if (await user.db.collection('users').findOne( {discordId: {$eq: interaction.user.id}} ))
		{
			interaction.reply({
				content: 'You are already notifying subscribers when you join voice.',
				ephemeral: true
			})
			return
		}

		interaction.reply({
			content: 'Joining the voice chat will now notifiy subscribers.',
			ephemeral: true
		})
		const newUser = await user.create({
			username: interaction.user.username,
			discordId: interaction.user.id
		})
	}

	if (commandName === 'add') {

		if (await phone.db.collection('phones').findOne( {phoneNumber: {$eq: options.getString('phone')}} ))
		{
			interaction.reply({
				content: "Your phone number is already added.",
				ephemeral: true
			})
			return
		}

		const num = options.getString('phone')
		interaction.reply({
			content: 'You are now a subscriber.',
			ephemeral: true
		})
		
		const newPhone = await phone.create( {
			phoneNumber: num
		})
	}
})

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { 
    if (newVoiceState.channel) { 
        console.log("buns")
	}
});

// Login to Discord with your client's token
client.login(token);

