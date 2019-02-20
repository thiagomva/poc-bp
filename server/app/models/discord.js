var DiscordApiData = require('../data/discordApiData.js');
var nconf = require('nconf');

class Discord {
    constructor() {
    }

    getAccessToken(code, authorizationHeader, cb) {
        var body = {
            client_id: nconf.get("DISCORD_CLIENT_ID"),
            client_secret: nconf.get("DISCORD_CLIENT_SECRET"),
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://bitpatron.co'
        };

        new DiscordApiData().postDiscord('oauth2/token', body, authorizationHeader);

    }
}

module.exports = Discord;