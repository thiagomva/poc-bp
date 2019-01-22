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
            if (fs.existsSync('./' + jwtStoreName)) {
                content = fs.readFileSync('./' + jwtStoreName);
                var jsonFile = JSON.parse(content);
                console.log(jsonFile);
                jsonFile[this.username] = this.jsonWebToken;
                console.log(jsonFile);
                fs.writeFileSync( jwtStoreName, JSON.stringify(jsonFile), "utf8");
                console.log(jsonFile);
            }
            else {
                var myJson = '{ "' + this.username + '": ' + '"' + this.jsonWebToken + '" }'
                fs.writeFile( jwtStoreName, myJson, "utf8", null );
            }
          } catch(err) {
            console.error(err)
          }

        return true;
    }
}

module.exports = Authentication;