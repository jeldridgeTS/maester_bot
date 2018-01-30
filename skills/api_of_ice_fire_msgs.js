const _ = require('lodash')

const axios = require('axios')

module.exports = (controller) => {

    var msg_types = ['direct_message', 'direct_mention', 'mention']

    controller.hears('Tell me about (.*)', msg_types, (bot, msg) => {
        var url = `http://www.anapioficeandfire.com/api/characters/?name=${msg.match[1]}`

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

// Formatting for returned char info data
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


// All the business to get the char info
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

    var promiseArray = characterInfo.allegiances.concat(characterInfo.spouse).unique()

    console.log(promiseArray)

    return axios.all(characterInfo.allegiances.map(link => axios.get(link)))
      .then(axios.spread((...results) => {
        characterInfo.allegiances = results[0].data.name
        console.log(results.length)
      }))
      .catch((e) => {
        console.log(e)
      })
  })
  .then((response) => {
    if (characterInfo.spouse) {
      return axios.get(characterInfo.spouse)
    } else {
      characterInfo.spouse = 'Ah... no records of marriage.'
      callback(characterInfo)
    }
  })
  .then((response) => {
    characterInfo.spouse = response.data.name
    callback(characterInfo)
  })
  .catch((e) => {
    if (e.code === 'ENOTFOUND') {
      console.log('Unable to connect to api server')
    } else {
      console.log(e.message)
    }
  })
}

// Get additional info (to be used in promise array)
var getSpouses = () => {
  axios.get(characterInfo.spouse)
    .then((response) => characterInfo.spouse = response.data.name)
    .catch((e) => console.log(e))
}

var getAllegiances = () => {
  axios.all(characterInfo.allegiances.map(link => axios.get(link)))
    .then(axios.spread((...results) => {
      characterInfo.allegiances = results[0].data.name
      console.log(results.length)
    }))
    .catch((e) => {
      console.log(e)
    })
}

// Utility method for pruning duplicate array elements after concat
Array.prototype.unique = function() {
  var a = this.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1)
      }
  }
  return a
}
