var express = require('express');
var router = express.Router();
var config = require('../config/index');
var Block = require('../models/Block');

router.get('/', function(req, res, next) {
    Block.getAllBlocks().then(function(result) {
        res.json(result);
    });
});

router.get('/:blockId', function(req, res, next) {
    Block.getBlock(req.params.blockId).then(function(result) {
        res.json(result);
    });
});

router.post('/', function(req, res, next) {
    var postArgs = {};
    if (req.body.numPosts) {
        postArgs = {
            blockId: req.body.blockId,
            numPosts: req.body.numPosts,
            displayTitles: req.body.displayTitles,
            displayedCategories: req.body.displayedCategories
        };
    } else {
        postArgs = {
            blockId: req.body.blockId,
            blockContent: req.body.blockContent,
            blockRevision: req.body.blockRevision
        }
    }

    Block.postBlock(postArgs).then(function (result) {
        res.json(result);
    });
});

router.post('/addBlock', function(req, res, next) {
    Block.addBlock(req.body.blockName, req.body.blockType).then(function (result) {
        res.json(result);
    });
});

router.post('/deleteBlock', function(req, res, next) {
    Block.deleteBlock(req.body.blockId).then(function (result) {
        res.json(result);
    });
});

module.exports = router;