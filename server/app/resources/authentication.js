var AuthenticationController = require('../controllers/authenticationController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
  'use strict';

  router.route('/:username')
    .get(function (req, res, next) {
      new AuthenticationController().storeJwt(req.params.username, req.query["jwt"], baseResponse(res, next));
    });
};
