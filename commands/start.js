const db = require("quick.db")
const Discord = require("discord.js")
const ms = require("ms")
const parsems = require("parse-ms")

module.exports = {
    name: "start",
    run: async (message, args, client) => {

        if (!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send("Insufficient permissions! You need the `MANAGE ROLES` permission to use this command!")
        if (db.get(`giveawaylength_${message.guild.id}`) >= 5) return message.channel.send("The maximum giveaways that can run in a server is 5!")
        if (args.length < 2) return message.channel.send("Invalid usage!\nProper usage: `g!start [time] [winners (optional)] [prize]`")

        let winners = 1
        let time = ms(args[0])
        let optionalw = parseInt(args[1])

        if (!time) {
            return message.channel.send("That's not a valid time!")
        }
        if (time < 60000 || time > 1209600000) {
            return message.channel.send("Minimum time for a giveaway is 1 minute, while the max is 2 weeks!")
        }
        let timer = args.splice(0, 1)
        if (optionalw) {
            winners = optionalw
            if (winners > 10) return message.channel.send(`You cannot have more than 10 winners!`)
            if (winners < 1) return message.channel.send("Minimum winners required is 1!")
            winners = args.splice(0, 1)
        }

        let countdown = parsems(time)
        let content = ""
        let days = countdown.days
        let hours = countdown.hours
        let mins = countdown.minutes
        if (days == 0) {
            if (mins == 0) {
                content = `${hours} ${hours > 1 ? "hours" : "hour"}`
            } else if (hours == 0) {
                content = `${mins} ${mins > 1 ? "mins" : "min"}`
            } else {
                content = `${hours} ${hours > 1 ? "hours" : "hour"} and ${mins} ${mins > 1 ? "mins" : "min"}`
            }
        } else if (hours == 0) {
            if (mins == 0) {
                content = `${days} ${days > 1 ? "days" : "day"}`
            } else {
                content = `${days} ${days > 1 ? "days" : "day"} and ${mins} ${mins > 1 ? "mins" : "min"}`
            }
        } else if (mins = 0) {
            content = `${days} ${days > 1 ? "days" : "day"} and ${hours} ${hours > 1 ? "hours" : "hour"}`
        } else {
            content = `${days} ${days > 1 ? "days" : "day"}, ${hours} ${hours > 1 ? "hours" : "hour"} and ${mins} ${mins > 1 ? "mins" : "min"}`
        }


        message.channel.send(
            new Discord.MessageEmbed()
            .setTitle(args.join(" "))
            .setDescription(`**:tada: GIVEAWAY STARTING :tada:**\n\nReact with :tada: to participate!\n\nTime: **${content}**\nWinners: ${winners}\nHosted by: ${message.author}\n\nGiveaway ID: ${db.get(`giveawaystotal_${message.guild.id}`)+1}`)
            .setColor("#008800")
            .setTimestamp(Date.now() + time)
            .setFooter("Ends at")
        ).then(m => {
            m.react("🎉")
            db.add(`giveawaylength_${message.guild.id}`, 1)
            db.add(`giveawaystotal_${message.guild.id}`, 1)
            db.set(`giveawayid-${db.get(`giveawaystotal_${message.guild.id}`)}_${message.guild.id}`, {
                channel: message.channel.id,
                guild: message.guild.id,
                winners: winners,
                endsAt: Date.now() + time,
                timecontent: content,
                prize: args.join(" "),
                messageid: m.id,
                running: true
            })
            let giveaway = db.all().filter(data => data.ID.startsWith(`giveawayid-${db.get(`giveawaystotal_${message.guild.id}`)}_${message.guild.id}`))[0]
            client.emit("giveawayStart", giveaway)
        })

        message.delete().catch(e => console.log(e.message))


    }
}

