var config = require('nconf');
var Error = require('../util/error.js');
var Blockstack = require('blockstack');
var JsonTokens = require('jsontokens');
const axios = require('axios');
var PageInfoData = require('../data/pageInfoData.js');

class Subscribers {
    constructor(username, appPublicKey, monthly) {
        this.username = username;
        this.appPublicKey = appPublicKey;
        this.monthly = monthly;
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
        var date = new Date();
        var expiration = date.getTime() + (86400000 * (this.monthly ? 30 : 365));
        subscribers[self.appPublicKey.toLowerCase()] = {expirationDate:expiration};
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
}

module.exports = Subscribers;


