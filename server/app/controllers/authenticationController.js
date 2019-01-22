var Authentication = require('../models/authentication.js');
var Error = require('../util/error.js');

class AuthenticationController {
    constructor() {}

    valid(username, jwt){
        if (!username) throw new Error(400, 'username is mandatory');
        if (!jwt) throw new Error(400, 'jwt is mandatory');
    }

    storeJwt(username, jwt, cb) {
        this.valid(username, jwt);
        new Authentication(username, jwt).getAuthenticationResult(cb);
    }
}

module.exports = AuthenticationController;