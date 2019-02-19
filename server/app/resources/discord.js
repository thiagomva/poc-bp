var DiscordController = require('../controllers/discordController.js');

var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';
  
    router.route('/')
    .post(function(req, res, next) {
        new DiscordController().getAccessToken(req.body, baseResponse(res, next));
    });
}