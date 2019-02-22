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
        new Discord().getAccessToken(json.code, json.guildId, authToken, json.redirectUri, cb);        
    }

    validJoinServer(json){
        if (!json) throw new Error(400, 'no body in request');
        if(!json.pageUsername) throw new Error(400, 'pageUsername is mandatory');
        if(!json.discordAuthorization) throw new Error(400, 'discordAuthorization is mandatory');
    }

    joinServer(json, authToken, cb){
        this.validJoinServer(json);
        new Discord().joinServer(json, authToken, cb);
    }

    listRoles(authToken, cb){
        new Discord().listRoles(authToken, cb);
    }

    validRole(json){
        if (!json) throw new Error(400, 'no body in request');
        if(!json.roleId) throw new Error(400, 'role id is mandatory');
        if(!json.roleName) throw new Error(400, 'role name is mandatory');
    }

    updateRole(json, authToken, cb) {
        this.validRole(json);
        new Discord().updateRole(json.roleId, json.roleName, authToken, cb);
    }
}

module.exports = DiscordController;