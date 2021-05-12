const db = require("quick.db")

module.exports = {
    name: "end",
    run: async (message, args, client) => {

        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Insufficient permissions! You need the `MANAGE ROLES` permission to use this command!")

        if (!args[0]) return message.channel.send("Please add the giveaway ID!")

        if (!db.get(`giveawayid-${args[0]}_${message.guild.id}`)) return message.channel.send("This giveaway does not exist!")

        if (db.get(`giveawayid-${args[0]}_${message.guild.id}.running`) != true) return message.channel.send("This giveaway has already ended!")

        let gwa = db.all().filter(data => data.ID.startsWith(`giveawayid-${args[0]}_${message.guild.id}`))[0]

        client.emit("giveawayEnd", gwa)

    }
}