var express = require('express');
var router = express.Router();
var config = require('../config/index');
var Post = require('../models/Post');

router.get('/categories', function(req, res, next) {
    Post.getCategories().then(function(result) {
        res.json(result);
    });
});

router.get('/', function(req, res, next) {
    Post.getAllPosts().then(function(result) {
        res.json(result);
    });
});

router.get('/:postId', function(req, res, next) {
    Post.getPost(req.params.postId).then(function(result) {
        res.json(result);
    });
});

router.post('/', function(req, res, next) {
    Post.postPost(req.body.postId, req.body.postContent, req.body.postCategory).then(function (result) {
        res.json(result);
    });
});

router.post('/addPost', function(req, res, next) {
    Post.addPost(req.body.postName, req.body.author).then(function (result) {
        res.json(result);
    });
});

router.post('/deletePost', function(req, res, next) {
    Post.deletePost(req.body.postId).then(function (result) {
        res.json(result);
    });
});

module.exports = router;