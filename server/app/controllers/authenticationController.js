var Authentication = require('../models/authentication.js');
var Error = require('../util/error.js');

class AuthenticationController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.username) throw new Error(400, 'username is mandatory');
        if (!json.jwt) throw new Error(400, 'jwt is mandatory');
        if (!json.address) throw new Error(400, 'address is mandatory');
    }

    storeJwt(json, cb) {
        this.valid(json);
        new Authentication(json.username, json.jwt, json.address).getAuthenticationResult(cb);
    }
}

module.exports = AuthenticationController;