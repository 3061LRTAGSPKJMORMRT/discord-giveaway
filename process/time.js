const ms = require("ms")

module.exports = {
    name: "time",
    run: async (chan, filter, message, client) => {

        const collector = message.channel.createMessageCollector(filter, {time:20000})
        let passed= false
        collector.on("collect", async m => {
            let time = ms(m.content)
            if (!time) {
                message.channel.send("Please enter a valid time!")
            } else {
                if (time < 60000 || time > 1209600000) {
                    message.channel.send("The minimum time is 1 hour and the maximum is 2 weeks!")
                } else {
                    passed = true
                    message.channel.send("Nice! Now how many winners should there be?")
                    client.process.get("winners").run(chan, time, filter, message, client)
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