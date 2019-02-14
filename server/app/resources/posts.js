var PostsController = require('../controllers/postsController.js');

var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';
  
    router.route('/')
      .post(function (req, res, next) {
        new PostsController().savePost(req.body, baseResponse(res, next));
      })
      .get(function (req, res, next) {
        new PostsController().listPosts(req.query["pageSize"],req.query["lastPostTime"], baseResponse(res, next));
      });
  };