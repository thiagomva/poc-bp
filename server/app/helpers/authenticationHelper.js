var express = require('express');
var config = require('nconf');
var Error = require('../util/error.js');

module.exports = function (app) {
  'use strict';

  var authentication = function (req, res, next) {
    next();
  }

  app.use(authentication);
};

