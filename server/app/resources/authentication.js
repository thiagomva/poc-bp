var AuthenticationController = require('../controllers/authenticationController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
  'use strict';

  router.route('/')
    .post(function (req, res, next) {
      new AuthenticationController().storeJwt(req.body, baseResponse(res, next));
    });
};
