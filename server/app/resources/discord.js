var DiscordController = require('../controllers/discordController.js');

var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';
  
    router.route('/')
    .post(function(req, res, next) {
        new DiscordController().getAccessToken(req.body, req.headers["blockstack-auth-token"], baseResponse(res, next));
    });

    router.route('/join')
    .post(function(req, res, next) {
        new DiscordController().joinServer(req.body, req.headers["blockstack-auth-token"], baseResponse(res, next));
    });

    router.route('/roles')
    .get(function(req, res, next) {
        new DiscordController().listRoles(req.headers["blockstack-auth-token"], baseResponse(res, next));
    });
}