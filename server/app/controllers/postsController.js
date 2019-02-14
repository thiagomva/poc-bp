var Posts = require('../models/posts.js');
var Error = require('../util/error.js');

class PostsController {
    constructor() {}

    valid(json){
        if (!json) throw new Error(400, 'no body in request');
        if (!json.name) throw new Error(400, 'name is mandatory');
        if (!json.username) throw new Error(400, 'username is mandatory');
        if (!json.title) throw new Error(400, 'title is mandatory');
    }

    savePost(json, cb) {
        this.valid(json);
        new Posts().savePost(json, cb);
    }

    listPosts(pageSize, lastPostTime, cb) {
        new Posts().listPosts(pageSize, lastPostTime, cb);
    }

    loadAll(cb) {
        new Posts().loadAll(cb);
    }
}

module.exports = PostsController;