const axios = require('axios');
var config = require('nconf');
var Subscribers = require('./subscribers.js');
var chargesStoreName = 'chargesStore.json';
var PageInfoData = require('../data/pageInfoData.js');
var ChargeData = require('../data/chargeData.js');

class Charges {
    getCallbackResult(callback, cb) {
        try {
            if(callback.status != "processing" && callback.status != "paid"){
                cb(null, null);
            }
            var chargeData = new PageInfoData();
            chargeData.get(callback.id).then(charge => {
                updateChargeStatusIfNecessary(charge, callback.status, cb);
            });
        } catch(err) {
            cb(err)
        }
    }

    updateChargeStatusIfNecessary(charge, newStatus, cb){
        if(charge.status != "paid" &&  charge.status != newStatus){
            charge.status = newStatus;
            chargeData.update(charge).then(result => {
                if(charge.status == "processing" || charge.status == "paid"){
                    new Subscribers(charge.username, charge.appPublicKey, charge.periodType == 0).getSubscribersResult(cb);
                }
                else{
                    cb(null, JSON.parse(stringfiedJson));
                }
            });
        }
    }

    getCreateResult(json, cb) {
        var pageInfoData = new PageInfoData();
        var chargeData = new PageInfoData();
        pageInfoData.get(this.userBlockstackId).then(pageInfo => {
            var price = 20;
            if(json.monthly){
                price = pageInfo.monthlyPrice;
            }
            else{
                price = pageInfo.yearlyPrice;
            }

            var body = {
                amount: price,
                currency: 'USD',
                callback_url: config.get('OPEN_NODE_CALLBACK_URL'),
                success_url: config.get('OPEN_NODE_SUCCESS_URL') + json.username + "?handler=openNode"
            };
            let httpConfig = {
                headers: {
                    Authorization: config.get('OPEN_NODE_API_KEY')
                }
            };
            try {
                var url = config.get('OPEN_NODE_API_URL') + "v1/charges";
                axios.post(url, body, httpConfig).then(response => {
                    var data = response && response.data && response.data.data;
                    var jsonFile = {};
                    var charge = {chargeId: data.id, username: json.username, appPublicKey: json.appPublicKey, status: data.status, periodType: json.monthly ? 0 : 1}
                    chargeData.insert(charge)
                    .then(result => cb(null, data))
                    .catch(error => { cb(error); });
                })
                .catch(error => { cb(error); });
            } catch(err) { cb(err) }
        })
        .catch(err => { cb(err) });
    }

    getCheckResult(check, cb){
        var chargeData = new PageInfoData();
        chargeData.listPending(check.appPublicKey).then(charges => {
            let httpConfig = {
                headers: {
                    Authorization: config.get('OPEN_NODE_API_KEY')
                }
            };
            var url = config.get('OPEN_NODE_API_URL') + "v1/charge/";
            var apiCalls = 0;
            charges.forEach((charge) => {
                apiCalls++;
                axios.get(url + charge.chargeId, httpConfig).then(response => {
                    var data = response && response.data && response.data.data;
                    updateChargeStatusIfNecessary(charge, data.status, () => {});
                    if(apiCalls <= 0){
                        cb(null,null);
                    }
                })
                .catch(error => {
                    cb(error);
                });
            });
            if(charges.length <= 0){
                cb(null,null);
            }
        });
    }
}

module.exports = Charges;