var request = require('request')

module.exports = (controller, request) => {

    controller.on('channel_joined', (bot, message) => {
    })



    /***************************************************************************

    Examples of dry code for future google spreadsheets api

    controller.hears('get users', 'direct_mention', (bot, msg) => {
        var users = spreadSheet.get_all_users()
        bot.reply(msg, `Users in channel: ${users}`)
    })

    controller.hears('share me', 'direct_mention', (bot, msg) => shared_stuff.share_test(bot, msg))

    ***************************************************************************/
}
