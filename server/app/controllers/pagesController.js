var Pages = require('../models/pages.js');
var Error = require('../util/error.js');

class PagesController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.jwt) throw new Error(400, 'jwt is mandatory');
        if (!json.userBlockstackId) throw new Error(400, 'userBlockstackId is mandatory');
        if (!json.pageName && !json.numberOfPosts) throw new Error(400, 'pageName or numberOfPosts is mandatory');
    }

    savePage(json, cb) {
        this.valid(json);
        new Pages(json.jwt, json.userBlockstackId, json.pageName, json.pageDescription, json.numberOfPosts, json.monthlyPrice, json.yearlyPrice, json.email).getPagesResult(cb);
    }

    updateNumberOfPosts(json, cb) {
        if (!json) throw new Error(400, 'no body in request');
        if (!json.userBlockstackId) throw new Error(400, 'userBlockstackId is mandatory');
        if (!json.numberOfPosts) throw new Error(400, 'numberOfPosts is mandatory');
        new Pages(json.userBlockstackId, json.numberOfPosts).getNumberOfPostsResult(cb);
    }

    listPages(cb) {
        new Pages().listPages(cb);
    }
}

module.exports = PagesController;