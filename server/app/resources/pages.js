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
  };