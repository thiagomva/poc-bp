var config = require('nconf');
var Error = require('../util/error.js');
var Blockstack = require('blockstack');

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
                    var userJwt = jsonFile[this.username].jwt;
                    console.log(userJwt);
                    //TODO Do stuff (save docs etc using jwt)
                    //Blockstack.getFile(...); //autocomplete doesn't work, members and methods generated dynamically
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

    throwNotFoundError() {
        throw new Error(404, 'Username not found.');
    }
}

module.exports = Subscribers;