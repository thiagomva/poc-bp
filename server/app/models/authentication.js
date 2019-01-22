var config = require('nconf');
var Error = require('../util/error.js');

class Authentication {

    constructor(username, jsonWebToken) {
        this.username = username;
        this.jsonWebToken = jsonWebToken;
    }

    getAuthenticationResult(cb) {
        var fs = require("fs");
        var jwtStoreName = 'jwtStore.json';
        try {
            var content;
            var stringfiedJson = "";
            if (fs.existsSync('./' + jwtStoreName)) {
                content = fs.readFileSync('./' + jwtStoreName);
                var jsonFile = JSON.parse(content);
                jsonFile[this.username] = this.jsonWebToken;
                stringfiedJson = JSON.stringify(jsonFile);
            }
            else {
                stringfiedJson = '{ "' + this.username + '": ' + '"' + this.jsonWebToken + '" }';
            }
            fs.writeFileSync( jwtStoreName, stringfiedJson, "utf8" );
            cb(null, JSON.parse(stringfiedJson));
          } catch(err) {
            cb(err)
          }
    }
}

module.exports = Authentication;