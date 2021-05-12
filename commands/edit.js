const db = require("quick.db")
const Discord = require("discord.js")
const ms = require("ms")
const parsems = require("parse-ms")


module.exports = {
    name: "edit",
    run: async (message, args, client) => {

        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Insufficient permissions! You need the `MANAGE ROLES` permission to use this command!")

        if (args.length < 3) return message.channel.send("Invalid usage! To edit the giveaway, do `g!edit [giveawayID] [winners/time/prize] [new value]`")

        if (!db.get(`giveawayid-${args[0]}_${message.guild.id}`)) return message.channel.send("This giveaway does not exist!")

        if (db.get(`giveawayid-${args[0]}_${message.guild.id}.running`) != true) return message.channel.send("This giveaway has already ended!")

        if (!["winner", "winners", "time", "prize"].includes(args[1].toLowerCase())) return message.channel.send(`You can't edit \`${args[1]}\`! Available edits: \`winners\` \`time\` \`prize\``)

        let chan = await client.channels.fetch(db.get(`giveawayid-${args[0]}_${message.guild.id}.channel`))
        let msg = db.get(`giveawayid-${args[0]}_${message.guild.id}.messageid`)
        let time = db.get(`giveawayid-${args[0]}_${message.guild.id}.timecontent`)
        let winners = db.get(`giveawayid-${args[0]}_${message.guild.id}.winners`)

        if (!chan) return message.channel.send("Channel not found!")
        if (!message.guild.channels.cache.get(chan.id)) return message.channel.send("Channel not found!")

        if (["winner", "winners"].includes(args[1].toLowerCase())) {
            let winnersnew = parseInt(args[2])
            if (!winnersnew) return message.channel.send("Please add a valid number!")
            if (args[2].includes(".")) return message.channel.send("Intergers only!")
            if (winnersnew < 1 || winnersnew > 10) return message.channel.send("Minimum winners required is 1 and the maximum is 10!")
            db.set(`giveawayid-${args[0]}_${message.guild.id}.winners`, winnersnew)
            let gwa = await chan.messages.fetch(msg)
            if (!gwa) return message.channel.send("This giveaway has been deleted!")
            gwa.edit(
                new Discord.MessageEmbed()
                .setColor("#008800")
                .setDescription(gwa.embeds[0].replace(`Winners: ${winners}`, `Winners: ${winnersnew}`))
                .setTimestamp(gwa.embeds[0].timestamp)
                .setFooter(gwa.embeds[0].footer.text)
                .setTitle(gwa.embeds[0].title)
            )
            message.channel.send(`Done! The giveaway has been edited!\nhttps://discordapp.com/channels/${message.guild.id}/${chan.id}/${gwa.id}`)
        } else if (args[1].toLowerCase() == "time") {
            let newtime = ms(args[2])
            if (!newtime) return message.channel.send("Invalid time!")
            if (newtime < 60000 || newtime > 1209600000) return message.channel.send("The minimum time required is 1 minute and the maximum is 2 weeks!")
            db.set(`giveawayid-${args[0]}_${message.guild.id}.endsAt`, Date.now() + newtime)
            let newEndsAt = parsems(Date.now() + newtime)
            let gwa = await chan.messages.fetch(msg)
            if (!gwa) return message.channel.send("This giveaway has been deleted!")

            let hours = newEndsAt.hours
            let days = newEndsAt.days
            let mins = newEndsAt.minutes
            let newtimecontent = ""

            if (days == 0) {
                if (hours == 0) {
                    newtimecontent = `${mins} ${mins > 1 ? "mins" : "min"}`
                } else if (mins == 0 ) {
                    newtimecontent = `${hours} ${hours > 1 ? "hours" : "hour"}`
                } else {
                    newtimecontent = `${hours} ${hours > 1 ? "hours" : "hour"} and ${mins} ${mins > 1 ? "mins" : "min"}`
                }
            } else if (hours == 0) {
                if (mins == 0) {
                    newtimecontent = `${days} ${days > 1 ? "days" : "day"}`
                } else {
                    newtimecontent = `${days} ${days > 1 ? "days" : "day"} and ${mins} ${mins > 1 ? "mins" : "min"}`
                }
            } else if (mins == 0) {
                newtimecontent = `${days} ${days > 1 ? "days" : "day"} and ${hours} ${hours > 1 ? "hours" : "hour"}`
            } else {
                newtimecontent = `${days} ${days > 1 ? "days" : "day"}, ${hours} ${hours > 1 ? "hours" : "hour"} and ${mins} ${mins > 1 ? "mins" : "min"}`
            }

            db.set(`giveawayid-${args[0]}_${message.guild.id}.timecontent`, newtimecontent)
            gwa.edit(
                new Discord.MessageEmbed()
                .setColor("#008800")
                .setDescription(gwa.embeds[0].replace(`Time: ${time}`, `Time: ${newtimecontent}`))
                .setTimestamp(gwa.embeds[0].timestamp)
                .setFooter(gwa.embeds[0].footer.text)
                .setTitle(gwa.embeds[0].title)
            )
            message.channel.send(`Done! The giveaway has been edited!\nhttps://discordapp.com/channels/${message.guild.id}/${chan.id}/${gwa.id}`)
             
        } else if (args[1].toLowerCase() == "prize") {
            let s = args.splice(0, 1)
            args.splice(0, 1)
            if (args.join(" ") > 256) return message.channel.send("Uhh, your prize message is too long! Try shortening it!")
            db.set(`giveawayid-${s}_${message.guild.id}.prize`, args.join(" "))
            let gwa = await chan.messages.fetch(msg)
            gwa.edit(
                new Discord.MessageEmbed()
                .setTitle(args.join(" "))
                .setDescription(gwa.embeds[0].description)
                .setFooter(gwa.embeds[0].footer.text)
                .setColor("#008800")
                .setTimestamp(gwa.embeds[0].timestamp)
            )
            message.channel.send(`Done! The giveaway has been edited!\nhttps://discordapp.com/channels/${message.guild.id}/${chan.id}/${gwa.id}`)

        }

        



    }
}