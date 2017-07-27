var normalizedPath = require("path").join(__dirname, "skills")

module.exports = (controller) => {

    // Attach any skills/scripts you want this bot to be able to use
    require(`${normalizedPath}/debug_msgs`)(controller)
    require(`${normalizedPath}/basic_msgs`)(controller)
    require(`${normalizedPath}/user_tracking`)(controller)
    require(`${normalizedPath}/loyalty_tracker_msgs`)(controller)
    require(`${normalizedPath}/api_of_ice_fire_msgs`)(controller)

}
