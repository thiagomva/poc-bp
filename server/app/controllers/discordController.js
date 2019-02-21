var Discord = require('../models/discord.js');
var Error = require('../util/error.js');

class DiscordController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.code) throw new Error(400, 'code is mandatory');
        if (!json.guildId) throw new Error(400, 'guildId is mandatory');
    }

    getAccessToken(json, authToken, cb) {
        this.valid(json);
        new Discord().getAccessToken(json.code, json.guildId, authToken, cb);        
    }

    validJoinServer(json){
        if (!json) throw new Error(400, 'no body in request');
        if(!json.pageUsername) throw new Error(400, 'pageUsername is mandatory');
        if(!json.discordAuthorization) throw new Error(400, 'discordAuthorization is mandatory');
    }

    joinServer(json, authToken, cb){
        validJoinServer(json);
        new Discord().joinServer(json, authToken, cb);
    }
}

module.exports = DiscordController;