var config = require('nconf');
var Error = require('../util/error.js');
var Blockstack = require('blockstack');

module.exports = function (app) {
  'use strict';

  var authentication = function (req, res, next) {
    var _ = require('underscore')
      , apiPrefix = '/api/v' + config.get('API_VERSION')
      , securePaths = [apiPrefix + '/discord', apiPrefix + '/discord/join'];

    if ( _.contains(securePaths, req.path) ){
      var token = req.headers["blockstack-auth-token"];
      Blockstack.verifyAuthResponse(token,"https://core.blockstack.org/v1/names/").then(
        response => {
          if(response){
            next();
          }
          else{
            throw new Error(401, 'request unauthorized');    
          }
        }
      ).catch(e => {
        throw new Error(401, 'request unauthorized');
      })
    }
    else{
      next();
    }
  }

  app.use(authentication);
};

