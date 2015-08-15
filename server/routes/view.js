var express = require('express');
var router = express.Router();
var config = require('../config/index');
var View = require('../models/View');

router.get('/edit', function(req, res, next) {
    View.getViewsForEdit().then(function(result) {
        res.json(result);
    });
});

router.get('/:viewId', function(req, res, next) {
    View.getView(req.params.viewId).then(function(result) {
        res.json(result);
    });
});

router.get('/edit/:viewId', function(req, res, next) {
    View.getViewForEdit(req.params.viewId).then(function(result) {
        res.json(result);
    });
});

router.post('/', function(req, res, next) {
    View.postView(req.body.viewId, req.body.viewContent, req.body.viewRoute, req.body.viewIsDefault).then(function(result) {
        res.json(result);
    });
});

router.post('/addView', function(req, res, next) {
    View.addView(req.body.viewName).then(function(result) {
        res.json(result);
    });
});

router.post('/deleteView', function(req, res, next) {
    View.deleteView(req.body.viewId).then(function (result) {
        res.json(result);
    });
});

module.exports = router;