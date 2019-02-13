var config = require('nconf');
var Error = require('../util/error.js');
var PostData = require('../data/postData.js');

class Posts {
    constructor() {
    }

    listPosts(cb) {
        new PostData().list().then(result => {
            var mappedPosts = {};
            result.map(function(item) { 
                mappedPosts[item.name] = item;
            });
            cb(null, mappedPosts);
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
}

module.exports = Posts;