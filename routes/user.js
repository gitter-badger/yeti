var express = require('express');
var router = express.Router();
var config = require('../config');
var User = require('../models/User');
var crypt = require('../lib/crypt');
var jwt = require('jsonwebtoken');

router.get('/:userName', function(req, res, next) {
    User.findUser(req.params.userName).then(function(result) {
        res.sendStatus(result);
    });
});

router.post('/', function(req, res, next) {
    User.findUser(req.body.username).then(function(result) {
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

router.post('/verify', function(req, res, next) {
    User.findUser(req.body.username).then(function(result) {
        if (User.verify(req.body.password, result.hash)) {
            var token = jwt.sign({
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
    }).catch(function(err) {
        res.sendStatus(401);
    });
});

router.post('/verifyToken', function(req, res, next) {
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

router.post('/changepass', function(req, res, next) {
    User.findUser(req.body.username).then(function(result) {
        if (User.verify(req.body.oldpassword, result.hash)) {
            User.updateOne(result._id, { hash: crypt.crypt(req.body.newpassword) }).then(function() {
                res.sendStatus(200);
            });
        } else {
            res.sendStatus(401);
        }
    }).catch(function(err) {
        res.sendStatus(401);
    });
});

module.exports = router;