var config = require('nconf');
var Error = require('../util/error.js');

class Authentication {
    constructor(username, jsonWebToken) {
        this.username = username;
        this.jsonWebToken = jsonWebToken;
    }

    getAuthenticationResult(cb) {
        return true;
    }
}

module.exports = Authentication;