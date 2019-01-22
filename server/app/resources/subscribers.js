var SubscribersController = require('../controllers/subscribersController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
  'use strict';

  router.route('/')
    .post(function (req, res, next) {
      new SubscribersController().subscribe(req.body, baseResponse(res, next));
    });
};
