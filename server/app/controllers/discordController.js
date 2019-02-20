var Discord = require('../models/discord.js');
var Error = require('../util/error.js');

class DiscordController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.code) throw new Error(400, 'code is mandatory');
        if (!json.server_id) throw new Error(400, 'server id is mandatory');
    }

    getAccessToken(json, cb) {
        this.valid(json);
        new Discord(json.code, json.server_id).getAccessToken(cb);
    }
}

module.exports = DiscordController;