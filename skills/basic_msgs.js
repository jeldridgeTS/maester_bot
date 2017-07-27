pry = require('pryjs')

var Message = require('../msgs/const_messages')

module.exports = (controller) => {

    controller.hears(Message.BASIC_GREETING, ['direct_message', 'direct_mention', 'mention'], (bot, message) => {

        bot.api.reactions.add({
            timestamp: message.ts,
            channel: message.channel,
            name: 'robot_face',
        }, (err, res) => {
            if (err) {
                bot.botkit.log('Failed to add emoji reaction :(', err)
            }
        })

        bot.api.users.info({user: message.user}, (err, res) => {
            if (res.user) {
                bot.reply(message, `Hello ${res.user.name}.`)
            } else {
                bot.reply(message, 'Hello.')
            }
        })
    })
}
