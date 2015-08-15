var express = require('express');
var router = express.Router();
var config = require('../config/index');
var Settings = require('../models/Settings');

router.get('/', function(req, res, next) {
    Settings.getSettings().then(function(result) {
        res.json(result);
    });
});

router.post('/defaultHome', function(req, res, next) {
    Settings.setDefaultView(req.body.viewId).then(function(result) {
        if (result._id) {
            res.json(204);
        } else {
            res.json(500);
        }
    });
});

router.get('/css', function(req, res, next) {
    Settings.getSettings().then(function(result) {
        res.json(result.user_stylesheet);
    });
});

router.post('/css', function(req, res, next) {
    Settings.setCss(req.body.user_stylesheet).then(function(result) {
        if (result._id) {
            res.json(204);
        } else {
            res.json(500);
        }
    });
});

module.exports = router;