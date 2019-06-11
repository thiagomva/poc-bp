var PagesController = require('../controllers/pagesController.js');

var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';
  
    router.route('/')
      .post(function (req, res, next) {
        new PagesController().savePage(req.body, baseResponse(res, next));
      })
      .get(function (req, res, next) {
        new PagesController().listPages(baseResponse(res, next));
      });
    
    router.route('/numberOfPosts')
      .post(function (req, res, next) {
        new PagesController().updateNumberOfPosts(req.body, baseResponse(res, next));
      })

    router.route('/:username/discord')
      .get(function (req, res, next) {
        new PagesController().getPageDiscordInfo(req.params.username, req.headers["blockstack-auth-token"], baseResponse(res, next));
      })
      
    router.route('/:username/wallet')
      .get(function (req, res, next) {
        new PagesController().getWallet(req.params.username, req.headers["authorization"], baseResponse(res, next));
      })
  };