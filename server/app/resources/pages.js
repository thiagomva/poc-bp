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

    router.route('/bitcoinWallet/:username')
      .post(function (req, res, next) {
        new PagesController().updateBitcoinWallet(req.params.username, req.body, baseResponse(res, next));
      })
      .get(function (req, res, next) {
        new PagesController().getBitcoinWallet(req.params.username, baseResponse(res, next));
      })
  };