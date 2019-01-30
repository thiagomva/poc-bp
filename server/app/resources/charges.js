var ChargesController = require('../controllers/chargesController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
  'use strict';

  router.route('/callback')
    .post(function (req, res, next) {
      new ChargesController().callback(req.body, baseResponse(res, next));
    });

  router.route('/')
    .post(function (req, res, next) {
      new ChargesController().create(req.body, baseResponse(res, next));
    });

  router.route('/check')
    .post(function (req, res, next) {
      new ChargesController().check(req.body, baseResponse(res, next));
    });
};
