const axios = require('axios');
var config = require('nconf');
var Subscribers = require('./subscribers.js');
var PageInfoData = require('../data/pageInfoData.js');
var ChargeData = require('../data/chargeData.js');
var PeriodType = require('./periodType.js');

class Charges {
    getCallbackResult(callback, cb) {
        try {
            if(callback.status != "processing" && callback.status != "paid"){
                cb(null, null);
            }
            var chargeData = new ChargeData();
            var _this = this;
            chargeData.get(callback.id).then(charge => {
                _this.updateChargeStatusIfNecessary(charge, callback.status, cb);
            });
        } catch(err) {
            cb(err)
        }
    }

    updateChargeStatusIfNecessary(charge, newStatus, cb){
        if(charge.status != "paid" &&  charge.status != newStatus){
            charge.status = newStatus;
            var chargeData = new ChargeData();
            chargeData.update(charge).then(result => {
                if(charge.status == "processing" || charge.status == "paid"){
                    new Subscribers(charge.username, charge.appPublicKey, charge.periodType == 0, charge.subscriberUsername).getSubscribersResult(cb);
                }
                else{
                    cb(null, JSON.parse(stringfiedJson));
                }
            });
        }
        else{
            cb(null, false);
        }
    }

    getCreateResult(json, cb) {
        var pageInfoData = new PageInfoData();
        var chargeData = new ChargeData();
        pageInfoData.get(json.username).then(pageInfo => {
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
                    var charge = {chargeId: data.id, username: json.username, appPublicKey: json.appPublicKey, status: data.status, periodType: (json.monthly ? 0 : 1), subscriberUsername: json.subscriberUsername, amount: (data.amount/100000000.0)}
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
        var chargeData = new ChargeData();
        var _this = this;
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
                    _this.updateChargeStatusIfNecessary(charge, data.status, () => {
                        apiCalls--;
                        if(apiCalls <= 0){
                            cb(null,null);
                        }
                    });
                    
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

    getTotalAmount(username, cb){
        var chargeData = new ChargeData();
        chargeData.listPaidFromUser(username).then(charges => {
            var totalAmount = 0;
            if(charges){
                charges.forEach((charge) => {
                    if(charge.amount){
                        totalAmount += charge.amount;
                    }
                });
            }
            cb(null, totalAmount);
        })
        .catch(error => {
            cb(error);
        });
    }

    updateAllChargesInfo(cb){
        var chargeData = new ChargeData();
        chargeData.listAllPending().then(charges => {
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

    getUserPayment(loggedUsername, pageUsername){
        return new Promise(function(resolve, reject){
            var chargeData = new ChargeData();
            chargeData.listPaidAndProcessingFromUserAndSubscriber(pageUsername, loggedUsername).then(result =>{
                result.forEach(charge => {
                    if(GetExpirationDateFromCharge(charge) > new Date()){
                        resolve(charge);
                        return;
                    }
                });
                resolve(null);
            }).catch(reject);
        });
    }

    static GetExpirationDateFromCharge(charge){
        var expirationDate = charge.paymentDate;
        if(periodType == PeriodType.MONTHLY){
            expirationDate.setMonth(expirationDate.getMonth()+1);
        }
        else if(periodType == PeriodType.YEARLY){
            expirationDate.setYear(expirationDate.getFullYear()+1);
        }
        else if(periodType == PeriodType.HALF_YEARLY){
            expirationDate.setMonth(expirationDate.getMonth()+6);
        }
        else if(periodType == PeriodType.QUARTERLY){
            expirationDate.setMonth(expirationDate.getMonth()+3);
        }
        return expirationDate;
    }
}

module.exports = Charges;