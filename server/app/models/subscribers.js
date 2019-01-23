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
                    var appPrivateKey = this.decodeJwtTokenPayload(jsonFile[this.username].jwt).scopes.appPrivateKey;
                    this.getFilesPrivateKeysFile(appPrivateKey, jsonFile[this.username].address, function(errFp, respFp) {
                        if (errFp) throw new Error(404, 'myFilesPrivateKeys.json not found.');
                        else {
                            this.getSubscribersFile(appPrivateKey, jsonFile[this.username].address, function(errSub, respSub) {
                                if (errSub) throw new Error(404, 'bp/subscribers.json not found.');
                                else {
                                    this.getFileFromUrl(jsonFile[this.username].address, 'pageInfo.json', function(errPi, respPi) {
                                        if (errPi) throw new Error(404, 'pageInfo.json not found.');
                                        else {
                                            this.handleFilesRead(appPrivateKey, jsonFile[this.username].address, this.userName, respFp, respSub, respPi, cb);
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

    handleFilesRead(appPrivateKey, jwt, address, userName, filesPrivateKeys, subscribers, pageInfo, cb) {
        var date = new Date(Date.now());
        date.setDate(date.getDate() + pageInfo.subscriptionDuration);
        subscribers[this.appPublicKey] = {expirationDate:date};
        var subscribersToSave = Blockstack.encryptContent(subscribers, {publicKey: Blockstack.getPublicKeyFromPrivate(appPrivateKey)});
        var subscriptionFile = {};
        Object.keys(filesPrivateKeys).forEach(function(key) {
            if (filesPrivateKeys[key] && filesPrivateKeys[key].decryptionPrivateKey) {
                subscriptionFile[key] = {decryptionPrivateKey: Blockstack.encryptContent(filesPrivateKeys[key].decryptionPrivateKey, {publicKey: this.appPublicKey})};
            }
        });
        this.uploadFile(jwt, address, 'subscribers.json', subscribersToSave, function(errSub, resSub) {
            if (errSub) throw new Error(403, 'bp/subscribers.json write error. ' + errSub);
            else {
                this.uploadFile(jwt, address, this.appPublicKey + '.json', subscriptionFile, function(errPk, resPk) {
                    if (errPk) throw new Error(403, 'bp/[appPublicKey].json write error. ' + errPk);
                    else {
                        cb(null, {success:true});
                    }
                });
            }
        });
    }

    uploadFile(jwtToken, address, fileName, file, cb) {
        Blockstack.getOrSetLocalGaiaHubConnection().then(hubConfig => {
            hubConfig.token = jwtToken;
            hubConfig.address = address;
            Blockstack.uploadToGaiaHub('bp/' + fileName, file, hubConfig).then(res => cb(null, res)).catch(err => cb(err));;
        }).catch(err => cb(err));
    }

    getSubscribersFile(appPrivateKey, address, cb) {
        this.getPrivateFile(appPrivateKey, address, 'bp/subscribers.json', function(error, response) {
            if (error) cb(error);
            else {
                cb(null, response);
            }
        });
    }

    getFilesPrivateKeysFile(appPrivateKey, address, cb) {
        this.getPrivateFile(appPrivateKey, address, 'myFilesPrivateKeys.json', function(error, response) {
            if (error) cb(error);
            else {
                cb(null, response);
            }
        });
    }

    getPrivateFile(appPrivateKey, address, fileName, cb) {
        this.getFileFromUrl(address, fileName, function(error, response) {
            if (error) cb(error);
            else {
                cb(null, Blockstack.decryptContent(response,{privateKey:appPrivateKey}));
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


