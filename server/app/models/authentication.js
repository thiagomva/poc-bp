var config = require('nconf');
var Error = require('../util/error.js');

class Authentication {

    constructor(username, jsonWebToken, address) {
        this.username = username;
        this.jsonWebToken = jsonWebToken;
        this.address = address;
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
                jsonFile[this.username]["jwt"] = this.jsonWebToken;
                jsonFile[this.username]["address"] = this.address;
                stringfiedJson = JSON.stringify(jsonFile);
            }
            else {
                stringfiedJson = '{"' + this.username + '":' + '{"jwt":"' + this.jsonWebToken + '","address":"' + this.address + '"}}';
            }
            fs.writeFileSync( jwtStoreName, stringfiedJson, "utf8");
            cb(null, JSON.parse(stringfiedJson));
          } catch(err) {
            cb(err)
          }
    }
}

module.exports = Authentication;