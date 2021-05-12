const db = require("quick.db")
const Discord = require("discord.js")
const ms = require("ms")
const fs = require("fs")
const prefix = "g!"
const token = ""
const client = new Discord.Client()
client.commands = new Discord.Collection()
client.process = new Discord.Collection()

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

const processFiles = fs.readdirSync('./process').filter(file => file.endsWith(".js"))
for (const file of processFiles) {
    const process = require(`./process/${file}`)
    client.process.set(process.name, process)
}

client.on("ready", () => {
    console.log("Giveaway Bot is online!")

    //resume all the giveaways 
    client.guilds.cache.forEach(async guild => {
        let giveawaysran = db.all().filter(data => data.ID.startsWith("giveawayid-") && data.ID.endsWith(guild.id) && db.get(`${data.ID}.running`) == true)
        for (const i of giveawaysran) {
            if (db.get(`${i.ID}.endsAt`) <= Date.now()) {
                console.log(i)
                client.emit("giveawayEnd", (i))
            } else {
                client.emit("giveawayStart", (i))
            }
        }

    })
})

client.on("giveawayStart", async giveaway => {
    setTimeout(() => {
        client.emit("giveawayEnd", giveaway)
    }, db.get(`${giveaway.ID}.endsAt`)-Date.now())

})

client.on("giveawayEnd", async giveaway => {
    db.set(`${giveaway.ID}.running`, false)
    let channel = db.get(`${giveaway.ID}.channel`)
    let guild = await client.guilds.cache.get(`${db.get(`${giveaway.ID}.guild`)}`)
    channel = await client.channels.fetch(channel)
    if (channel && channel.guild.id == guild.id) {
        let mid = db.get(`${giveaway.ID}.messageid`)
        if (mid) {
            let message = await channel.messages.fetch(mid)
            if (message) {
                let reactions = message.reactions.resolve("🎉")
                if (reactions) {
                    db.subtract(`giveawaylength_${db.get(`${giveaway.ID}.channel`).guild.id}`, 1)
                    let members = await reactions.users.fetch()
                    if (members) {
                        let allreact = []
                        members.forEach(mem => {
                            if (mem.id != message.client.user.id) {
                                allreact.push(mem.id)
                            }
                        })
                        let winners = db.get(`${giveaway.ID}.winners`)
                        let allwinners = []
                        for (let b = 0 ; b < winners ; b++) {
                            if (allreact.length == 0) {
                                b = winners+1
                            } else {
                                let winner = allreact.splice(Math.floor(Math.random() * allreact.length), 1)
                                allwinners.push(winner)
                            }
                        }
                        if (allwinners.length == 0) {
                            channel.send(`I could not find any valid entries for the giveaway at: https://discordapp.com/channels/${channel.guild.id}/${channel.id}/${mid}`)
                        } else {
                            channel.send(`Congratulations <@${allwinners.join(">, <@")}>! You won: **${db.get(`${giveaway.ID}.prize`)}**\nhttps://discordapp.com/channels/${channel.guild.id}/${channel.id}/${mid}`).catch(e => console.log(e.message))
                        }
                    }
                } else {

                    db.subtract(`giveawaylength_${db.get(`${giveaway.ID}.channel`).guild.id}`, 1)
                    channel.send(`There were no reactions found for the giveaway at: https://discordapp.com/channels/${channel.guild.id}/${channel.id}/${mid}`)
                }
            } else {
                db.subtract(`giveawaylength_${db.get(`${giveaway.ID}.channel`).guild.id}`, 1)
            }
        } else {
            db.subtract(`giveawaylength_${db.get(`${giveaway.ID}.channel`).guild.id}`, 1)
        }
    } else {
        db.subtract(`giveawaylength_${db.get(`${giveaway.ID}.channel`).guild.id}`, 1)
    }
})


client.on("message", async message => {
    
    if (message.channel.type == "dm") return;
    if (!message.content.startsWith(prefix) || message.author.bot || !message.guild.me.hasPermission(["SEND_MESSAGES", "VIEW_CHANNEL", "ADD_REACTIONS"])) return;
    const command = message.content.slice(prefix.length).split(" ")[0].toLowerCase()
    let args = message.content.slice(command.length + prefix.length + 1).split(" ")

	if (args.length == 1) {
		if (args[0] == "") {
			args = []
		}
	}
	if (command) {
		const cmds = client.commands.get(command) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command))
		if (!cmds) return;
		try {
			cmds.run(message, args, client)
		} catch (e) {
			return message.channel.send("An error occured.\n\nError: " + e.message).catch(err => console.log(err.message));
		}
	}

     
})

client.login(token)
