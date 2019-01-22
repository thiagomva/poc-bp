var Subscribers = require('../models/subscribers.js');
var Error = require('../util/error.js');

class SubscribersController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.username) throw new Error(400, 'username is mandatory');
        if (!json.appPublicKey) throw new Error(400, 'appPublicKey is mandatory');
    }

    subscribe(json, cb) {
        this.valid(json);
        new Subscribers(json.username, json.appPublicKey).getSubscribersResult(cb);
    }
}

module.exports = SubscribersController;