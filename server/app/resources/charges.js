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

  router.route('/updateAll')
    .post(function (req, res, next) {
      new ChargesController().updateAll(baseResponse(res, next));
    });

  router.route('/updateAllPaymentDates')
    .post(function (req, res, next) {
      new ChargesController().updateAllPaymentDates(baseResponse(res, next));
    });


  router.route('/totalAmount/:username')
    .get(function (req, res, next) {
      new ChargesController().getTotalAmount(req.params.username, baseResponse(res, next));
    });
};
