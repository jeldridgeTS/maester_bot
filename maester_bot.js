if (!process.env.token) {
    console.log('Error: Specify token in environment')
    process.exit(1)
}

var Botkit  = require('botkit')
var Message = require('./lib/const_messages')
var request = require('request')

var controller = Botkit.slackbot({
  debug: false,
  log: true,
  logLevel: 0
})

// connect the bot to a stream of messages
controller.spawn({
  token: process.env.token,
}).startRTM()

// for debuging
controller.hears('debug', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {

  console.log(Message)

  bot.reply(message, message)

})

controller.hears('houses of westeros', ['direct_message', 'direct_mention', 'mention'], function(bot, message){

  var options = {
    url: 'http://www.anapioficeandfire.com/api/houses?pageSize=20',
    headers: {
      'Accept': 'application/vnd.anapioficeandfire+json; version=1'
    }
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body)

      data.forEach(function(element) {
        bot.reply(message, element.name)
      })

      console.log(response)
    }
  })

})

controller.hears(Message.LOYALTY, ['direct_message', 'direct_mention', 'mention', 'message_received'], function(bot, message) {
  
  var house = message.match[1] //match[1] is the (.*) group. match[0] is the entire group (open the (.*) doors).
  if (house === 'Stark') {
    return bot.reply(message, 'Hail the King in the North!')
  }
  return bot.reply(message, 'Meh')

})

// hears greeting
controller.hears(Message.BASIC_GREETING, ['direct_message', 'direct_mention', 'mention'], function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err)
        }
    })


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!')
        } else {
            bot.reply(message, 'Hello.')
        }
    })
})
