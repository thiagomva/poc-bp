var config = require('nconf');
var Error = require('../util/error.js');

class Subscribers {
    constructor(jsonWebToken) {
        this.jsonWebToken = jsonWebToken;
    }

    getSubscribersResult() {
        return true;
    }
}

module.exports = Subscribers;