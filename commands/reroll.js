const db = require("quick.db")

module.exports = {
    name: "reroll",
    run: async (message, args, client) => {

        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Insufficient permissions! You need the `MANAGE ROLES` permission to use this command!")
        
        if (!args[0]) return message.channel.send("Please insert the giveaway ID!")

        let giveaway = db.get(`giveawayid-${args[0]}_${message.guild.id}`)

        if (!giveaway) return message.channel.send("This giveaway does not exist!")

        if (db.get(`giveawayid-${args[0]}_${message.guild.id}.running`) == true) return message.channel.send("You can't reroll a giveaway that is running!")

        let prize = db.get(`giveawayid-${args[0]}_${message.guild.id}.prize`)
        let chan = await client.channels.fetch(db.get(`giveawayid-${args[0]}_${message.guild.id}.channel`))
        if (!chan) return message.channel.send("Channel not found!")
        if (message.guild.channels.cache.get(chan.id)) {

            let gwa = await chan.messages.fetch(db.get(`giveawayid-${args[0]}_${message.guild.id}.messageid`))
            if (gwa) {
                let reactions = gwa.reactions.resolve("🎉")
                if (reactions) {
                    let members = await reactions.users.fetch()
                    if (members) {
                        let allreact = []
                        members.forEach(mem => {
                            if (mem.id != message.guild.me.id) {
                                allreact.push(mem.id)
                            }
                        })
                        if (allreact.length == 0) {
                            message.channel.send("There were no eligible members found!")
                        } else {
                            let winner = allreact[Math.floor(Math.random() * allreact.length)]
                            chan.send(`The new winner for **${prize}** is <@${winner}>! Congrats`)
                        }
                    } else {
                        message.channel.send("There were no members found to react!")
                    }
                } else {
                    message.channel.send("There were no reactions found for this message!")
                }
            } else {
                message.channel.send("This giveaway seems to be deleted!")
            }
        } else {
            message.channel.send("An unknown error occured. Could you please try again?")
        }
        

    }
}