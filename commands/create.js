const db = require("quick.db")
const Discord = require("discord.js")

module.exports = {
    name: "create",
    run: async (message, args, client) => {

        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Insufficient permissions! You need the `MANAGE ROLES` permission to use this command!")
        if (db.get(`giveawaylength_${message.guild.id}`) >= 5) return message.channel.send("Maximum giveaways running per guild is 5!")

        message.channel.send("Alright then, where should the channel be?")
        
        const filter = m => m.author.id == message.author.id

        const collector = message.channel.createMessageCollector(filter, {time: 20000})
        let passed = false
        collector.on("collect", async m => {
            if (!m.mentions.channels.first()) {
                message.channel.send("Please mention a channel!")
            } else {
                let chan = message.guild.channels.cache.get(m.mentions.channels.first().id)
                if (!chan) {
                    message.channel.send("That is not a valid channel! Please try again!")
                } else {
                    passed = true
                    message.channel.send("Sweet! Now how long should the giveaway last?")
                    client.process.get("time").run(chan, filter, message, client)
                    collector.emit("end")
                }
            }
        })

        collector.on("end", () => {
            if (passed == false) {
                message.channel.send("You took too long to respond! The giveaway has been canceled!")
            }
        })

    }
}