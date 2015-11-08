var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var View = require('../models/View');
var Styles = require('../models/Style');
var Scripts = require('../models/Scripts');
var utils = require('../lib/utils');
var _ = require('lodash');

// Default view for root index page
router.get('/', function(req, res, next) {
    var defaultViewId;

    View.getDefaultViewId().then(function(result) {
        defaultViewId = result;
        utils.buildPage(defaultViewId).then(function(result){
            res.render('index', result);
        });
    });
});

// All custom defined routes by the user
router.get('/*', function(req, res) {
    View.getRoutes().then(function(result) {
        var reqRoute = _.find(result, { 'route': req.url });
        if (reqRoute) {
            utils.buildPage(reqRoute._id).then(function(result){
                res.render('index', result);
            });
        } else {
            res.render('index', {
                bodyContent: '404 Route Not Found.'
            });
        }
    });
});

module.exports = router;