module.exports = function(controller) {

    // Basic debug log
    controller.hears('debug', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {

        bot.reply(message, message)

    })
}
