var config = require('nconf');
var Error = require('../util/error.js');
var Blockstack = require('blockstack');
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
            var stringfiedJson = "";
            if (fs.existsSync('./' + jwtStoreName)) {
                content = fs.readFileSync('./' + jwtStoreName);
                var jsonFile = JSON.parse(content);
                if(jsonFile[this.username] && jsonFile[this.username].jwt && jsonFile[this.username].address) {
                    var appPrivateKey = null; //TODO get appPrivateKey
                    this.getFilesPrivateKeysFile(appPrivateKey, jsonFile[this.username].address, function(errFp, respFp) {
                        if (errFp) throw new Error(404, 'bp/myFilesPrivateKeys.json not found.');
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

                    cb(null, JSON.parse('{ "success": true }'));
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

    handleFilesRead(appPrivateKey, address, userName, filesPrivateKeys, subscribers, pageInfo, cb) {
        var date = new Date(Date.now());
        date.setDate(date.getDate() + pageInfo.subscriptionDuration);
        subscribers[this.appPublicKey] = {expirationDate:date};
        //TODO save file bp/subscribers.json PRIVATE with subscribers

        var subscriptionFile = {};
        Object.keys(filesPrivateKeys).forEach(function(key) {
            if (filesPrivateKeys[key] && filesPrivateKeys[key].decryptionPrivateKey) {
                subscriptionFile[key] = {decryptionPrivateKey: Blockstack.encryptContent(filesPrivateKeys[key].decryptionPrivateKey, {publicKey: this.appPublicKey})};
            }
        });
        
        //TODO save file bp/{this.appPublicKey}.json PUBLIC with subscriptionFile
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
        this.getPrivateFile(appPrivateKey, address, 'bp/myFilesPrivateKeys.json', function(error, response) {
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
            cb(null, JSON.parse(response));
          })
          .catch(error => {
            cb(error);
          });
    }

    throwNotFoundError() {
        throw new Error(404, 'Username not found.');
    }
}

module.exports = Subscribers;