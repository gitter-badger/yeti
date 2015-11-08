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

module.exports = router;