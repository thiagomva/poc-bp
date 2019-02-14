var config = require('nconf');
var Error = require('../util/error.js');
var PostData = require('../data/postData.js');
var PageInfoData = require('../data/pageInfoData.js');
var Subscribers = require('./subscribers.js');

class Posts {
    constructor() {
    }

    listPosts(pageSize, lastPostTime, cb) {
        new PostData().list(parseInt(pageSize), lastPostTime).then(result => {
            cb(null, result);
        }).catch(err => cb(err));
    }

    savePost(json, cb) {
        var postData = new PostData();
        postData.get(json.name, json.username).then(post => {
            var shouldCreate = !post;
            if(shouldCreate){
                post = {};
            }

            post.name = json.name;
            post.username = json.username;
            post.title = json.title;
            post.description = json.description;
            post.isPublic = json.isPublic;
            post.postTime = json.postTime;

            if(shouldCreate){
                postData.insert(post).then(result => cb(null, null)).catch(err => cb(err));
            }
            else{
                postData.update(post).then(result => cb(null, null)).catch(err => cb(err));
            }
        }).catch(err => cb(err));
    }

    loadAll(cb) {
        var self = this;
        new PageInfoData().list().then(result => {
            result.forEach(pageInfo => {
                new Subscribers().savePosts(pageInfo.username, pageInfo.jwt, self);
            });
        }).catch(err => cb(err));
    }
}

module.exports = Posts;