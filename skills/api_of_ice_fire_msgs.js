const _ = require('lodash')

const axios = require('axios')

module.exports = (controller) => {

    var msg_types = ['direct_message', 'direct_mention', 'mention']

    controller.hears('Tell me about (.*)', msg_types, (bot, msg) => {
        var url = `http://www.anapioficeandfire.com/api/characters/?name=${msg.match[1]}`
        var charInfo = {}

        getCharacterInfo(url, (charInfo) => {
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

// ************************************ FUN ************************************ //

var replyCharInfo = (bot, msg, charInfo) => {
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

var getCharacterInfo = (initialURL, callback) => {
    var characterInfo = {}
    var spouseAndAlly
    axios.get(initialURL).then((response) => {
        if (response.data.length === 0) { throw new Error('Unable to find that character') }

        if (response.status == 200) {
            if (response.data.length === 1) {
                characterInfo.name         = response.data[0].name
                characterInfo.born         = response.data[0].born
                characterInfo.culture      = response.data[0].culture
                characterInfo.titles       = response.data[0].titles.join(",  ")
                characterInfo.aliases      = response.data[0].aliases.join(",  ")
                characterInfo.allegiances  = response.data[0].allegiances
                characterInfo.spouse       = response.data[0].spouse
            }
        }

        // axios.all([ axios.get(characterInfo.allegiances[0]), axios.get(characterInfo.allegiances[1]) ])
        //     .then(axios.spread((acct, perms) => {
        //         console.log(acct)
        //         console.log(perms)
        //     }))

        return axios.get(characterInfo.allegiances[0])

    }).then((response) => {
        // console.log(response.data)
        characterInfo.allegiances = response.data.name
        if (characterInfo.spouse) {
            return axios.get(characterInfo.spouse)
        } else {
            characterInfo.spouse = 'Ah... no records of marriage.'
            callback(characterInfo)
        }
    }).then((response) => {
        characterInfo.spouse = response.data.name
        callback(characterInfo)
    }).catch((e) => {
        if (e.code === 'ENOTFOUND') {
            console.log('Unable to connect to api server')
        } else {
            console.log(e.message)
        }
    })
}
