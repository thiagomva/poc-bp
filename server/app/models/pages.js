var config = require('nconf');
var Error = require('../util/error.js');

class Pages {
    constructor(userBlockstackId, pageDescription, numberOfPosts) {
        this.userBlockstackId = userBlockstackId;
        this.pageDescription = pageDescription;
        this.numberOfPosts = numberOfPosts;
    }

    getPagesResult(cb) {
        var fs = require("fs");
        var pageListFileName = 'pageList.json';

        try {
            var content;
            var stringfiedJson = "";
            if (fs.existsSync('./' + pageListFileName)) {
                content = fs.readFileSync('./' + pageListFileName);
                var jsonFile = JSON.parse(content);

                if (!jsonFile[this.userBlockstackId]) {
                    jsonFile[this.userBlockstackId] = {};
                } 

                if (this.numberOfPosts) {
                    jsonFile[this.userBlockstackId].numberOfPosts = this.numberOfPosts;
                }
                
                if(this.pageDescription) {
                    jsonFile[this.userBlockstackId].pageDescription = this.pageDescription;
                }
                
                stringfiedJson = JSON.stringify(jsonFile);
            }
            else {
                stringfiedJson = '{"' + this.userBlockstackId + '": { "pageDescription" : "' + this.pageDescription + '", "numberOfPosts" : ' + this.numberOfPosts + ' } }';
            }

            fs.writeFileSync(pageListFileName, stringfiedJson, "utf8");
            cb(null, JSON.parse(stringfiedJson));

          } catch(err) {
            cb(err)
          }
    }
}

module.exports = Pages;