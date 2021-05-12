const db = require("quick.db")

module.exports = {
    name: "cancel",
    aliases: ["delete"],
    run: async (message, args, client) => {

        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Insufficient permissions! You need the `MANAGE ROLES` permission to use this command!")

        if (!args[0]) return message.channel.send("Please add the giveaway ID!")

        if (!db.get(`giveawayid-${args[0]}_${message.guild.id}`)) return message.channel.send("This giveaway does not exist!")

        if (db.get(`giveawayid-${args[0]}_${message.guild.id}.running`) != true) return message.channel.send("This giveaway has already ended!")

        let gwa = db.get(`giveawayid-${args[0]}_${message.guild.id}.messageid`)
        let chan = db.get(`giveawayid-${args[0]}_${message.guild.id}.channel`)

        let channel = await client.channels.fetch(chan)
        if (!channel) return message.channel.send("An error occured! Channel not found!")
        if (!message.guild.channels.cache.get(channel.id)) return message.channel.send("An error occured! Channel not found!")

        let msg = await channel.messages.fetch(gwa)
        if (!msg) return message.channel.send("Giveaway message not found!")

        msg.delete()
        db.delete(`giveawayid-${args[0]}_${message.guild.id}`)
        db.subtract(`giveawaylength_${message.guild.id}`, 1)
        message.channel.send("Done! The giveaway has been deleted!")
        
        
    }
}