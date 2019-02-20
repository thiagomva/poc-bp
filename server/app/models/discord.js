var DiscordApiData = require('../data/discordApiData.js');

class Discord {
    constructor(code, serverId, authorizationHeader) {
        this.code = code;
        this.serverId = serverId;
        this.authorizationHeader = authorizationHeader;
    }

    getAccessToken(cb) {
        var body = {
            client_id: this.serverId,
            client_secret: 'xulambis',
            grant_type: 'authorization_code',
            code: this.code,
            redirect_uri: 'https://bitpatron.co'
        };

        new DiscordApiData().postDiscord('oauth2/token', body, this.authorizationHeader);

    }
}

module.exports = Discord;