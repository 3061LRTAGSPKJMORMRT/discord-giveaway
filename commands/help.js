const Discord = require("discord.js")

module.exports = {
    name: "help",
    run: async (message) => {

        message.channel.send(
            new Discord.MessageEmbed()
            .setTitle("Help")
            .setDescription(`[] means required, () means optional\n\n**\`g!start [time] (winners) [prize]\`**\n - Creates an instant giveaway in that channel\n\n**\`g!create\`**\n - Helps you to create a giveaway step by step\n\n**\`g!giveaways\`**\n - Sends a message with the list of giveaways running\n\n**\`g!edit [giveaway id] [time/winners/prize] [new value]\`**\n - Edits the giveaway\n\n**\`g!cancel [giveaway id]\`**\n - Cancels the giveaway\n\n**\`g!end [giveaway id]\`**\n - Ends the giveaway right away\n\n**\`g!reroll\`**\n - Rerolls to get a new winner\n\n**\`g!help\`**\n - Shows this help message`)
            .setColor(`#000088`)
            .setFooter(`The prefix is g!`)
        )
    }
}