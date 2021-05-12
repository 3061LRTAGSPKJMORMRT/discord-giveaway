const db = require("quick.db")
const Discord = require("discord.js")
const parsems = require("parse-ms")

module.exports = {
    name: "giveaways",
    aliases: ["giveaway"],
    run: async (message, args, client) => {

        let allgwas = db.all().filter(data => data.ID.startsWith("giveawayid-") && data.ID.endsWith(message.guild.id) && db.get(`${data.ID}.running`) == true)

        let content = ""

        if (allgwas.length == 0) return message.channel.send("There are no giveaways running!")

        for (let i = 0 ; i < allgwas.length ; i++) {
            content += `${i+1}. ***${db.get(`${allgwas[i].ID}.prize`)}***\n`
            let newtimecontent = ''
            let endsat = parsems(db.get(`${allgwas[i].ID}.endsAt`) - Date.now())
            let hours = endsat.hours
            let days = endsat.days
            let mins = endsat.minutes

            if (days == 0) {
                if (hours == 0) {
                    newtimecontent = `${mins} ${mins == 1 ? "mins" : "min"}`
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

            content += `Giveaway ID: ${allgwas[i].ID.replace("giveawayid-", "").replace(`_${message.guild.id}`, "")} | Ends in **${newtimecontent}**\n\n`
        }

        message.channel.send(
            new Discord.MessageEmbed()
            .setTitle("Running Giveaways")
            .setColor("#FFFF00")
            .setDescription(content)
            .setFooter("Only 5 giveaways can run at a time per guild1")
        )

    }
}