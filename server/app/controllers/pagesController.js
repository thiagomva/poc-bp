var Pages = require('../models/pages.js');
var Error = require('../util/error.js');

class PagesController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.userBlockstackId) throw new Error(400, 'userBlockstackId is mandatory');
        if (!json.pageName && !json.numberOfPosts) throw new Error(400, 'pageName or numberOfPosts is mandatory');
    }

    savePage(json, cb) {
        this.valid(json);
        new Pages(json.userBlockstackId, json.pageName, json.pageDescription, json.numberOfPosts).getPagesResult(cb);
    }

    listPages(cb) {
        new Pages().getPagesResult(cb);
    }
}

module.exports = PagesController;