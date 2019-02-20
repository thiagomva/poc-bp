var Discord = require('../models/discord.js');
var Error = require('../util/error.js');

class DiscordController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.code) throw new Error(400, 'code is mandatory');
        if (!json.authorizationHeader) throw new Error(400, 'authorization header is mandatory');
    }

    getAccessToken(json, cb) {
        this.valid(json);
        new Discord().getAccessToken(json.code, json.authorizationHeader, cb);
    }
}

module.exports = DiscordController;