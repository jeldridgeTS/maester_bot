if (!process.env.token) {
    console.log('Error: Specify token in environment')
    process.exit(1)
}

var Botkit  = require('botkit')
var config = {
  debug: false,
  log: true,
  logLevel: 0
}

var controller = Botkit.slackbot(config)

controller.spawn({
  token: process.env.token,
}).startRTM()

require('./maester_aemon.js')(controller)
