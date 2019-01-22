var Authentication = require('../models/authentication.js');
var Error = require('../util/error.js');

class AuthenticationController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
    }

    storeJwt(username, jwt, cb) {

    }
}

module.exports = AuthenticationController;