const db = require("quick.db")
const ms = require("ms")
const parsems = require("parse-ms")
const Discord = require("discord.js")

module.exports = {
    name: "creategwa",
    run: async (chan, time, winners, prize, message, client) => {

        let content = ""
        let countdown = parsems(time)
        if (countdown) {
            let hours = countdown.seconds
            let mins = countdown.minutes
            let days = countdown.days

            if (days == 0) {
                if (hours == 0) {
                    content = `${mins} ${mins > 1 ? "mins" : "min"}` 
                } else if (mins == 0) {
                    content = `${hours} ${hours > 1 ? "hours" : "hour"}`
                } else {
                    content = `${hours} ${hours > 1 ? "hours" : "hour"} and ${mins} ${mins > 1 ? "mins" : "min"}`
                }
            } else if (hours == 0) {
                if (mins == 0) {
                    content = `${days} ${days > 1 ? "days" : "day"}`
                } else {
                    content = `${days} ${days > 1 ? "days" : "day"} and ${mins} ${mins > 1 ? "mins" : "min"}`
                }
            } else if (min == 0) {
                content = `${days} ${days > 1 ? "days" : "day"} and ${hours} ${hours > 1 ? "hours" : "hour"}`
            } else {
                content = `${days} ${days > 1 ? "days" : "day"}, ${hours} ${hours > 1 ? "hours" : "hour"} and ${mins} ${mins > 1 ? "mins" : "min"}`
            }
        }

        let endsAt = Date.now() + time

        chan.send(
            new Discord.MessageEmbed()
            .setTitle(prize)
            .setDescription(`**:tada: GIVEAWAY STARTING :tada:**\n\nReact with :tada: to participate!\n\nTime: **${content}**\nWinners: ${winners}\nHosted by: ${message.author}\n\nGiveaway ID: ${db.get(`giveawaystotal_${message.guild.id}`)+1}`)
            .setFooter("Ends at")
            .setTimestamp(endsAt)
            .setColor("#008800")
        ).then(m => {
            m.react("🎉")
            db.add(`giveawaylength_${message.guild.id}`, 1)
            db.add(`giveawaystotal_${message.guild.id}`, 1)
            db.set(`giveawayid-${db.get(`giveawaystotal_${message.guild.id}`)}_${message.guild.id}`, {
                channel: chan.id,
                guild: message.guild.id,
                winners: winners,
                endsAt: endsAt,
                timecontent: content,
                prize: prize,
                messageid: m.id,
                running: true
            })
            let giveaway = db.all().filter(data => data.ID.startsWith(`giveawayid-${db.get(`giveawaystotal_${message.guild.id}`)}_${message.guild.id}`))[0]
            client.emit("giveawayStart", giveaway)
        })

    }
}