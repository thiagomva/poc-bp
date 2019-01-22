var SubscribersController = require('../controllers/subscribersController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
  'use strict';

  router.route('/:username')
    .get(function (req, res, next) {
      new SubscribersController().subscribe(req.params.username, req.query["appPublicKey"], baseResponse(res, next));
    });
};
