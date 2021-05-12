module.exports = {
    name: "winners",
    run: async (chan, time, filter, message, client) => {


        let passed = false
        const collector = message.channel.createMessageCollector(filter, {time: 20000}) 

        collector.on("collect", async m => {
            let winners = parseInt(m.content)
            if (!winners) {
                message.channel.send("That's not a valid number!")
            } else {
                if (m.content.includes(".")) {
                    message.channel.send("Intergers only!")
                } else {
                    if (winners < 1 || winners > 10) {
                        message.channel.send("The minimum winners required is 1 and the maximum is 10!")
                    } else {
                        passed = true
                        message.channel.send("Awsome! Now let's get to the fun part! What will the prize be?")
                        client.process.get("prize").run(chan, time, winners, filter, message, client)
                        collector.emit("end")
                    }
                }
            }
        })

        collector.on("end", () => {
            if (passed == false) {
                message.channel.send(`You took too long to respond! The giveaway has been canceled!`)
            }
        })

    }
}