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
            charInfo.name                                  + "\n\n" +
            "Born "                + charInfo.born         + "\n\n" +
            "Titles: \n"           + charInfo.titles       + "\n\n" +
            "Aliases: \n"          + charInfo.aliases      + "\n\n" +
            "Allegiances: \n"      + charInfo.allegiances  + "\n\n" +
            "Culture: "            + charInfo.culture      + "\n\n" +
            "Spouse: "             + charInfo.spouse       + "\n\n" +
            "POV in Books: \n"     + charInfo.books
    })
}

// All the business to get the char info
var getCharacterInfo = (initialURL, callback) => {
  var characterInfo = {}
  
  axios.get(initialURL)
    .then((response) => {
      console.log(response)
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
          characterInfo.books        = response.data[0].povBooks
        }
      }

      var promiseArray = [
        getSpouse(characterInfo), 
        getAllegiances(characterInfo), 
        getPOVBooks(characterInfo)
      ]

      return axios.all(promiseArray)
    })
    .then((response) => {
      callback(characterInfo)
    })
}

// Get additional info (to be used in promise array)
var getSpouse = (characterInfo) => {
  if (characterInfo.spouse) {
    return axios.get(characterInfo.spouse)
      .then((response) => characterInfo.spouse = response.data.name)
      .catch((e) => console.log(e))
  } else {
    characterInfo.spouse = 'Ah, it appears there are no spousal records...'
  }
}

var getAllegiances = (characterInfo) => {
  if (characterInfo.allegiances.length > 0) {
    return axios.all(characterInfo.allegiances.map(link => axios.get(link)))
      .then(axios.spread((...results) => {
        characterInfo.allegiances = []
        results.forEach((element) => characterInfo.allegiances.push(element.data.name))
      }))
      .catch((e) => console.log(e))
  } else {
    characterInfo.allegiances = "Looks like they aren't very loyal."
  }
  
}

var getPOVBooks = (characterInfo) => {
  if (characterInfo.books.length > 0) {
    return axios.all(characterInfo.books.map(link => axios.get(link)))
    .then(axios.spread((...results) => {
      characterInfo.books = []
      results.forEach((element) => characterInfo.books.push(element.data.name))
      characterInfo.books = characterInfo.books.join(",  ")
    }))
    .catch((e) => console.log(e))
  } else {
    characterInfo.books = "We don't know their perspective."
  }
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