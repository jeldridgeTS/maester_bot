const _ = require('lodash')

var request = require('request')

function getRelativeName(url, charInfo, relativeType, cb) {
    request(url, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            var data = JSON.parse(body)
            charInfo[relativeType] = data.name
        } else {
            console.log('Could not find any records.')
        }
        cb(charInfo)
    })
}

// TODO
function getAllegiances(url, allegiances, cb) {

}

function getCharInfo(url, cb) {
    var charInfo = {}
    request(url, (err, res, body) => {
        console.log(url)
        if (!err && res.statusCode == 200) {
            var data = JSON.parse(body)

            if (data.length === 1) {
                charInfo.name         = data[0].name
                charInfo.born         = data[0].born
                charInfo.culture      = data[0].culture
                charInfo.titles       = data[0].titles.join(",  ")
                charInfo.aliases      = data[0].aliases.join(",  ")
                charInfo.allegiances  = data[0].allegiances.join(", ")
                charInfo.spouse       = data[0].spouse
            } else if (data.length > 1) {
                bot.reply(msg, 'We have too many similar records, I need specifics!')
            } else {
                bot.reply(msg, 'I do not recall that name.')
            }
        }

        if (charInfo.spouse) {
            url = charInfo.spouse
            charInfo.spouse = getRelativeName(url, charInfo, 'spouse', cb)
        }
    })
}

function replyCharInfo(bot, msg, charInfo) {
    bot.reply(msg, {
        text :
            charInfo.name                             + "\n\n" +
            "Born: "          + charInfo.born         + "\n\n" +
            "Titles: \n"      + charInfo.titles       + "\n\n" +
            "Aliases: \n"     + charInfo.aliases      + "\n\n" +
            "Allegiances: \n" + charInfo.allegiances  + "\n\n" +
            "Culture: "       + charInfo.culture      + "\n\n" +
            "Spouse: "        + charInfo.spouse
    })
}

module.exports = (controller) => {

    var msg_types = ['direct_message', 'direct_mention', 'mention']

    controller.hears('Tell me about (.*)', msg_types, (bot, msg) => {
        var url = `http://www.anapioficeandfire.com/api/characters/?name=${msg.match[1]}`
        var charInfo = {}

        getCharInfo(url, function(charInfo) {
            replyCharInfo(bot, msg, charInfo)
        })
    })

    controller.hears('houses of westeros', msg_types, (bot, msg) => {
        var options = {
            url: 'http://www.anapioficeandfire.com/api/houses?pageSize=20',
            headers: {
                'Accept': 'application/vnd.anapioficeandfire+json; version=1'
            }
        }

        request(options, (err, res, body) => {
            if (!err && res.statusCode == 200) {
                var data = JSON.parse(body)

                data.forEach((element) => {
                    bot.reply(msg, element.name)
                })

                console.log(res)
            }
        })

    })
}
