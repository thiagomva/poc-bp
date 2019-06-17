var config = require('nconf');
var Error = require('../util/error.js');
var Blockstack = require('blockstack');
var JsonTokens = require('jsontokens');
const axios = require('axios');
var PageInfoData = require('../data/pageInfoData.js');
var SubscriberData = require('../data/subscriberData.js');
var Discord = require('./discord.js');

class Subscribers {
    constructor(username, appPublicKey, subscriberUsername, expirationDate) {
        this.username = username;
        this.appPublicKey = appPublicKey;
        this.subscriberUsername = subscriberUsername;
        this.expirationDate = expirationDate;
    }

    getSubscribersResult(cb) {
        var pageInfoData = new PageInfoData();
        var _this = this;
        pageInfoData.get(this.username).then(pageInfo => {
            if (pageInfo) {
                var payload = this.decodeJwtTokenPayload(pageInfo.jwt);
                var appPrivateKey = payload.scopes[0].appPrivateKey;
                var address = payload.scopes[0].address;
                var hubServerUrl = payload.scopes[0].hubServerUrl;
                var hubUrlPrefix = payload.scopes[0].hubUrlPrefix;
                var self = this;
                self.getFilesPrivateKeysFile(self, appPrivateKey, address, hubUrlPrefix, function(errFp, respFp) {
                    if (errFp) throw new Error(404, 'myFilesPrivateKeys.json not found.');
                    else {
                        self.getSubscribersFile(self, appPrivateKey, address, hubUrlPrefix, function(errSub, respSub) {
                            if (errSub) throw new Error(404, 'bp/subscribers.json not found.');
                            else {
                                self.getFileFromUrl(address, hubUrlPrefix, 'pageInfo.json', function(errPi, respPi) {
                                    if (errPi) throw new Error(404, 'pageInfo.json not found.');
                                    else {
                                        self.handleFilesRead(self, appPrivateKey, pageInfo.jwt, address, hubServerUrl, hubUrlPrefix, respFp, respSub, respPi, cb);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                this.throwNotFoundError();
            }
        }).catch(err => cb(err));
    }


    handleFilesRead(self, appPrivateKey, jwt, address, hubServerUrl, hubUrlPrefix, filesPrivateKeys, subscribers, pageInfo, cb) {
        var expiration = new Date(this.expirationDate).getTime();
        subscribers[self.appPublicKey.toLowerCase()] = {expirationDate:expiration, subscriberUsername: self.subscriberUsername};
        var subscribersToSave = Blockstack.encryptContent(JSON.stringify(subscribers), {publicKey: Blockstack.getPublicKeyFromPrivate(appPrivateKey)});
        var subscriptionFile = {};
        subscriptionFile[self.appPublicKey.toLowerCase()] = {expirationDate:expiration};
        Object.keys(filesPrivateKeys).forEach(function(key) {
            if (filesPrivateKeys[key] && filesPrivateKeys[key].decryptionPrivateKey) {
                subscriptionFile[key] = {decryptionPrivateKey: Blockstack.encryptContent(filesPrivateKeys[key].decryptionPrivateKey, {publicKey: self.appPublicKey})};
            }
        });
        self.uploadFile(jwt, address, hubServerUrl, hubUrlPrefix, 'subscribers.json', subscribersToSave, undefined, function(errSub, resSub) {
            if (errSub) throw new Error(403, 'bp/subscribers.json write error. ' + errSub);
            else {
                self.uploadFile(jwt, address, hubServerUrl, hubUrlPrefix, self.appPublicKey.toLowerCase() + '.json', JSON.stringify(subscriptionFile), "application/json", function(errPk, resPk) {
                    if (errPk) throw new Error(403, 'bp/[appPublicKey].json write error. ' + errPk);
                    else {
                        cb(null, {success:true});
                    }
                });
            }
        });
    }

    uploadFile(jwtToken, address, hubServerUrl, hubUrlPrefix, fileName, file, contentType, cb) {
        var hubConfig = {
            url_prefix: hubUrlPrefix,
            server: hubServerUrl,
            address: address,
            token: jwtToken
        };
        Blockstack.uploadToGaiaHub('bp/' + fileName, file, hubConfig, contentType).then(res => cb(null, res)).catch(err => cb(err));
    }

    getSubscribersFile(self, appPrivateKey, address, hubUrlPrefix, cb) {
        self.getPrivateFile(self, appPrivateKey, address, hubUrlPrefix, 'bp/subscribers.json', function(error, response) {
            if (error) {
                if (error.response && error.response.status == 404) cb(null, {});
                else cb(error);
            } else {
                cb(null, JSON.parse(response));
            }
        });
    }

    getFilesPrivateKeysFile(self, appPrivateKey, address, hubUrlPrefix, cb) {
        self.getPrivateFile(self, appPrivateKey, address, hubUrlPrefix, 'myFilesPrivateKeys.json', function(error, response) {
            if (error) {
                if (error.response && error.response.status == 404) cb(null, {});
                else cb(error);
            } else {
                cb(null, JSON.parse(response));
            }
        });
    }

    getPrivateFile(self, appPrivateKey, address, hubUrlPrefix, fileName, cb) {
        self.getFileFromUrl(address, hubUrlPrefix, fileName, function(error, response) {
            if (error) cb(error);
            else {
                cb(null, Blockstack.decryptContent(JSON.stringify(response),{privateKey:appPrivateKey}));
            }
        });
    }

    getFileFromUrl(address, hubUrlPrefix, fileName, cb) {
        var url = hubUrlPrefix + address + '/' + fileName;
        axios.get(url).then(response => {
            cb(null, response.data);
          })
          .catch(error => {
            cb(error);
          });
    }

    throwNotFoundError() {
        throw new Error(404, 'Username not found.');
    }

    decodeJwtTokenPayload(v1JwtToken){
        let token = v1JwtToken.replace('v1:','');
        let payload =  (0, JsonTokens.decodeToken)(token).payload;
        return payload;
    }

    savePosts(username, jwt, postObj){
        const fs = require('fs');
        var payload = this.decodeJwtTokenPayload(jwt);
        var address = payload.scopes[0].address;
        var hubUrlPrefix = payload.scopes[0].hubUrlPrefix;
        var self = this;
        self.getFileFromUrl(address, hubUrlPrefix, 'pageInfo.json', function(errPi, respPi) {
            if (errPi) throw new Error(404, 'pageInfo.json not found.');
            else {
                Object.keys(respPi.files).map(fileName => {
                    if(!isNaN(parseInt(fileName))){
                        var post = respPi.files[fileName];
                        post.username = username;
                        postObj.savePost(post);
                    }
                    else{
                        console.log("fileName is NaN: "+fileName);
                    }
                });
            }
        });
    }
    
    removeExpiredSubscribers(cb){
        var subscriberData = new SubscriberData();
        subscriberData.listExpiredAndNotRemovedFromRole().then(subscribers => {
            var discord = new Discord();
            subscribers.forEach((subscriber) => {
                discord.removeSubscriberFromDiscord(subscriber.DiscordId, subscriber.GuildId, subscriber.RoleId).then(result =>
                    subscriberData.get(subscriber.ChargeId, subscriber.PageUsername, subscriber.DiscordId).then(result => {
                        result.removedFromRole = new Date();
                        subscriberData.update(result);
                    }).catch(e => console.log(e))
                ).catch(e => console.log(e))
            });
            cb(null,null);
        });
    }    

    getWallet(username, cb){
        var pageInfoData = new PageInfoData();
        var _this = this;
        pageInfoData.get(username).then(pageInfo => {
            if (pageInfo) {
                var payload = this.decodeJwtTokenPayload(pageInfo.jwt);
                var appPrivateKey = payload.scopes[0].appPrivateKey;
                var address = payload.scopes[0].address;
                var hubServerUrl = payload.scopes[0].hubServerUrl;
                var hubUrlPrefix = payload.scopes[0].hubUrlPrefix;
                var self = this;
                self.getPrivateFile(self, appPrivateKey, address, hubUrlPrefix, "bitcoinWallet", cb);
            }
        });
    }
}

module.exports = Subscribers;


