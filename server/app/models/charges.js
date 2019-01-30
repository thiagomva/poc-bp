const axios = require('axios');
var config = require('nconf');
var Subscribers = require('./subscribers.js');
var chargesStoreName = 'chargesStore.json';

class Charges {
    getCallbackResult(callback, cb) {
        var fs = require("fs");
        try {
            if(callback.status != "processing" && callback.status != "paid"){
                cb(null, null);
            }
            var content;
            var stringfiedJson = "";
            if (fs.existsSync('./' + chargesStoreName)) {
                content = fs.readFileSync('./' + chargesStoreName);
                var jsonFile = JSON.parse(content);
                if(jsonFile[callback.id] && jsonFile[callback.id].status != "paid" &&  jsonFile[callback.id].status != callback.status){
                    jsonFile[callback.id].status = callback.status;
                    fs.writeFileSync(chargesStoreName, JSON.stringify(jsonFile), "utf8");

                    if(jsonFile[callback.id].status == "processing" || jsonFile[callback.id].status == "paid"){
                        new Subscribers(jsonFile[callback.id].username, jsonFile[callback.id].appPublicKey, jsonFile[callback.id].monthly).getSubscribersResult(cb);
                    }
                    else{
                        cb(null, JSON.parse(stringfiedJson));
                    }
                }
            }
            else {
                throw new Error("chargesStore not found.")
            }
        } catch(err) {
            cb(err)
        }
    }

    getCreateResult(json, cb) {
        new Subscribers(json.username, json.appPublicKey).getPageInfo(
            function(errPi, resPi){
                if (errPi) throw new Error(404, 'pageInfo.json not found.');
                else {
                    var price = 20;
                    if(json.monthly){
                        price = resPi.monthlyPrice;
                    }
                    else{
                        price = resPi.yearlyPrice;
                    }

                    var fs = require("fs");
                    var chargesStoreName = 'chargesStore.json';
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
                            if (fs.existsSync('./' + chargesStoreName)) {
                                var content = fs.readFileSync('./' + chargesStoreName);
                                jsonFile = JSON.parse(content);
                            }
                            jsonFile[data.id] = {username: json.username, appPublicKey: json.appPublicKey, status: data.status, monthly: json.monthly}
                            fs.writeFileSync(chargesStoreName, JSON.stringify(jsonFile), "utf8");
                            cb(null, data);
                        })
                        .catch(error => {
                            cb(error);
                        });
                    } catch(err) {
                        cb(err)
                    }
                }
            }
        );
    }

    getCheckResult(check, cb) {
        var fs = require("fs");
        try {
            var content;
            var stringfiedJson = "";
            if (fs.existsSync('./' + chargesStoreName)) {
                content = fs.readFileSync('./' + chargesStoreName);
                var jsonFile = JSON.parse(content);
                let httpConfig = {
                    headers: {
                        Authorization: config.get('OPEN_NODE_API_KEY')
                    }
                };
                var url = config.get('OPEN_NODE_API_URL') + "v1/charge/";
                var apiCalls = 0;
                Object.keys(jsonFile).map((chargeId) => {
                    if(jsonFile[chargeId].status != "paid" && jsonFile[chargeId].appPublicKey == check.appPublicKey){
                        apiCalls++;
                        axios.get(url + chargeId, httpConfig).then(response => {
                            var data = response && response.data && response.data.data;
                            if(jsonFile[chargeId].status != data.status){
                                jsonFile[chargeId].status = data.status;
                                if(jsonFile[chargeId].status == "paid" || jsonFile[chargeId].status == "processing"){
                                    new Subscribers(jsonFile[chargeId].username, jsonFile[chargeId].appPublicKey, jsonFile[chargeId].monthly).getSubscribersResult(cb);
                                }
                            }
                            apiCalls--;
                            if(apiCalls <= 0){
                                fs.writeFileSync(chargesStoreName, JSON.stringify(jsonFile), "utf8");
                                cb(null,null);
                            }
                        })
                        .catch(error => {
                            cb(error);
                        });
                    }
                });
            }
            else {
                throw new Error("chargesStore not found.")
            }
        } catch(err) {
            cb(err)
        }
    }
}

module.exports = Charges;