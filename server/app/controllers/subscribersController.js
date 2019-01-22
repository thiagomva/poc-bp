var Subscribers = require('../models/subscribers.js');
var Error = require('../util/error.js');

class SubscribersController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
    }

    subscribe(username, appPublicKey, cb) {

    }
}

module.exports = SubscribersController;