var config = require('nconf');
var Error = require('../util/error.js');

class Subscribers {
    constructor(username, appPublicKey) {
        this.username = username;
        this.appPublicKey = appPublicKey;
    }

    getSubscribersResult(cb) {
        cb(null, JSON.parse('{ "success": true }'));
    }
}

module.exports = Subscribers;