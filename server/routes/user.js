var express = require('express');
var router = express.Router();
var config = require('../config/index');
var User = require('../models/User');
var crypt = require('../lib/crypt');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');

router.get('/', function(req, res) {
    User.getAllUsers().then(function(result) {
        res.json(result);
    });
});

router.get('/:userName', function(req, res) {
    User.findOne({ username: req.body.username }).then(function(result) {
        res.sendStatus(result);
    });
});

router.post('/', function(req, res, next) {
    User.findOne({ username: req.body.username }).then(function(result) {
        if (result) {
            return next(new Error('User already exists'));
        }
        req.body.hash = crypt.crypt(req.body.password);
        delete req.body.password;
        return (new User(req.body)).save().then(function(user) {
            res.sendStatus(user);
        });
    }).catch(next);
});

router.post('/verify', function(req, res) {
    User.findOne({ username: req.body.username }).then(function(result) {
        if (User.verify(req.body.password, result.hash)) {
            var token = jwt.sign({
                userId: result._id,
                userName: req.body.username
            }, config.secretPhrase, {
                expiresInMinutes: config.tokenTimeout
            });
            res.json({
                success: true,
                token: token
            });
        } else {
            res.sendStatus(401);
        }
    });
});

router.post('/verifyToken', function(req, res) {
    jwt.verify(req.body.token, config.secretPhrase, function(err, decoded) {
        if (err) {
            res.sendStatus(401);
        } else {
            res.json({
                status: 'OK',
                decoded: decoded
            });
        }
    });
});

router.post('/changepass', function(req, res) {
    User.findOne({ username: req.body.username }).then(function(result) {
        if (User.verify(req.body.oldpassword, result.hash)) {
            User.update({ _id: result._id }, { hash: crypt.crypt(req.body.newpassword) }).then(function() {
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(401);
        }
    }).catch(function() {
        res.sendStatus(401);
    });
});

router.post('/register/', function(req, res) {
    User.create({
        username: req.body.username,
        email: req.body.email,
        hash: crypt.crypt(req.body.password)
    }, function (err) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

router.post('/delete/:id', function(req, res) {
    User.find({
        _id: req.params.id
    }).remove().exec(function (err) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = router;