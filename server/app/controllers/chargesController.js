var Charges = require('../models/charges.js');
var Error = require('../util/error.js');
var crypto = require('crypto');
var nconf = require('nconf');
class ChargesController {
    constructor() {}

    validCallback(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.id) throw new Error(400, 'id is mandatory');
        if (!json.status) throw new Error(400, 'status is mandatory');
        if (!json.hashed_order) throw new Error(400, 'hashed_order is mandatory');
        
        const received = json.hashed_order;
        const calculated = crypto.createHmac('sha256', nconf.get("OPEN_NODE_API_KEY")).update(json.id).digest('hex');

        if (received != calculated) {
            throw new Error(404, 'Forbidden');
        }
    }

    callback(json, cb) {
        this.validCallback(json);
        new Charges().getCallbackResult(json, cb);
    }

    validCreate(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.username) throw new Error(400, 'username is mandatory');
        if (!json.appPublicKey) throw new Error(400, 'appPublicKey is mandatory');
    }

    create(json, cb) {
        this.validCreate(json);
        new Charges().getCreateResult(json, cb);
    }

    validCheck(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.appPublicKey) throw new Error(400, 'appPublicKey is mandatory');
    }

    check(json, cb) {
        this.validCheck(json);
        new Charges().getCheckResult(json, cb);
    }
}

module.exports = ChargesController;