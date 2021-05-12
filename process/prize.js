module.exports = {
    name: "prize",
    run: async (chan, time, winners, filter, message, client) => {

        let passed = false
        const collector = message.channel.createMessageCollector(filter, {time: 20000})

        collector.on("collect", async m => {
            if (m.content.length > 256) {
                message.channel.send("Uhh, that is too much! Try to shorten your wording! Maximum characters allowed is 250!")
            } else {
                passed = true
                message.channel.send(`Nice! The giveaway message has been sent in ${chan}!`)
                client.process.get("creategwa").run(chan, time, winners, m.content, message)
                collector.emit("end")
            }
        })
    }
}