var config = require('nconf');
var Error = require('../util/error.js');
var Blockstack = require('blockstack');
var JsonTokens = require('jsontokens');
const axios = require('axios');

class Subscribers {
    constructor(username, appPublicKey) {
        this.username = username;
        this.appPublicKey = appPublicKey;
    }

    getSubscribersResult(cb) {
        var fs = require("fs");
        var jwtStoreName = 'jwtStore.json';
        try {
            var content;
            if (fs.existsSync('./' + jwtStoreName)) {
                content = fs.readFileSync('./' + jwtStoreName);
                var jsonFile = JSON.parse(content);
                if(jsonFile[this.username] && jsonFile[this.username].jwt && jsonFile[this.username].address) {
                    var appPrivateKey = this.decodeJwtTokenPayload(jsonFile[this.username].jwt).scopes[0].appPrivateKey;
                    var self = this;
                    self.getFilesPrivateKeysFile(self, appPrivateKey, jsonFile[self.username].address, function(errFp, respFp) {
                        if (errFp) throw new Error(404, 'myFilesPrivateKeys.json not found.');
                        else {
                            self.getSubscribersFile(self, appPrivateKey, jsonFile[self.username].address, function(errSub, respSub) {
                                if (errSub) throw new Error(404, 'bp/subscribers.json not found.');
                                else {
                                    self.getFileFromUrl(jsonFile[self.username].address, 'pageInfo.json', function(errPi, respPi) {
                                        if (errPi) throw new Error(404, 'pageInfo.json not found.');
                                        else {
                                            self.handleFilesRead(self, appPrivateKey, jsonFile[self.username].jwt, jsonFile[self.username].address, respFp, respSub, respPi, cb);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
                else {
                    this.throwNotFoundError();
                }
            }
            else {
                this.throwNotFoundError();
            }
          } catch(err) {
            cb(err)
          }
    }

    handleFilesRead(self, appPrivateKey, jwt, address, filesPrivateKeys, subscribers, pageInfo, cb) {
        var date = new Date(Date.now());
        date.setDate(date.getDate() + pageInfo.subscriptionDuration);
        subscribers[self.appPublicKey] = {expirationDate:date};
        var subscribersToSave = Blockstack.encryptContent(JSON.stringify(subscribers), {publicKey: Blockstack.getPublicKeyFromPrivate(appPrivateKey)});
        var subscriptionFile = {};
        Object.keys(filesPrivateKeys).forEach(function(key) {
            if (filesPrivateKeys[key] && filesPrivateKeys[key].decryptionPrivateKey) {
                subscriptionFile[key] = {decryptionPrivateKey: Blockstack.encryptContent(filesPrivateKeys[key].decryptionPrivateKey, {publicKey: self.appPublicKey})};
            }
        });
        self.uploadFile(jwt, address, 'subscribers.json', subscribersToSave, function(errSub, resSub) {
            if (errSub) throw new Error(403, 'bp/subscribers.json write error. ' + errSub);
            else {
                self.uploadFile(jwt, address, self.appPublicKey + '.json', subscriptionFile, function(errPk, resPk) {
                    if (errPk) throw new Error(403, 'bp/[appPublicKey].json write error. ' + errPk);
                    else {
                        cb(null, {success:true});
                    }
                });
            }
        });
    }

    uploadFile(jwtToken, address, fileName, file, cb) {
        var hubConfig = {
            url_prefix: "https://gaia.blockstack.org/hub/",
            server: "https://hub.blockstack.org",
            address: address,
            token: jwtToken
        };
        Blockstack.uploadToGaiaHub('bp/' + fileName, file, hubConfig).then(res => cb(null, res)).catch(err => cb(err));
    }

    getSubscribersFile(self, appPrivateKey, address, cb) {
        self.getPrivateFile(self, appPrivateKey, address, 'bp/subscribers.json', function(error, response) {
            if (error) {
                if (error.response && error.response.status == 404) cb(null, {});
                else cb(error);
            } else {
                cb(null, JSON.parse(response));
            }
        });
    }

    getFilesPrivateKeysFile(self, appPrivateKey, address, cb) {
        self.getPrivateFile(self, appPrivateKey, address, 'myFilesPrivateKeys.json', function(error, response) {
            if (error) {
                if (error.response && error.response.status == 404) cb(null, {});
                else cb(error);
            } else {
                cb(null, JSON.parse(response));
            }
        });
    }

    getPrivateFile(self, appPrivateKey, address, fileName, cb) {
        self.getFileFromUrl(address, fileName, function(error, response) {
            if (error) cb(error);
            else {
                cb(null, Blockstack.decryptContent(JSON.stringify(response),{privateKey:appPrivateKey}));
            }
        });
    }

    getFileFromUrl(address, fileName, cb) {
        var url = 'https://gaia.blockstack.org/hub/' + address + '/' + fileName;
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


