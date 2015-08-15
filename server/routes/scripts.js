var express = require('express');
var router = express.Router();
var config = require('../config/index');
var Scripts = require('../models/Scripts');

router.get('/', function(req, res, next) {
    Scripts.getAllScripts().then(function(result) {
        res.json(result);
    });
});

router.get('/:scriptId', function(req, res, next) {
    Scripts.getScript(req.params.scriptId).then(function(result) {
        res.json(result);
    });
});

router.post('/', function(req, res, next) {
    Scripts.postScript(req.body.enabled, req.body.scriptId, req.body.scriptContent, req.body.scriptType).then(function (result) {
        res.json(result);
    });
});

router.post('/addScript', function(req, res, next) {
    Scripts.addScript(req.body.scriptType, req.body.scriptName).then(function (result) {
        res.json(result);
    });
});

router.post('/deleteScript', function(req, res, next) {
    Scripts.deleteScript(req.body.scriptId).then(function (result) {
        res.json(result);
    });
});

module.exports = router;