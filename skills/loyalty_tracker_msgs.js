var Message = require('../msgs/const_messages')

var request = require('request')

module.exports = function(controller, request) {

    controller.hears(Message.LOYALTY, ['direct_message', 'direct_mention', 'mention', 'message_received'], function(bot, message) {

      var house = message.match[1] //match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
      if (house === 'Stark') {
        return bot.reply(message, 'Hail the King in the North!')
      }
      return bot.reply(message, 'Meh')

    })

    controller.hears('share over here', 'direct_mention', (bot, msg) => shared_stuff.share_test(bot, msg))
}
