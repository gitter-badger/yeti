'use strict';

var config = require('../config/index');
var mongoose = require('mongoose');
var UserSchema = require('./UserSchema');
var User = mongoose.model(config.collections.users, UserSchema);
var Q = require('q');
var _ = require('lodash');
var crypt = require('../lib/crypt');

User.verify = function(passWord, hash) {
    return crypt.decrypt(passWord, hash);
};

User.getAllUsers = function() {
    var deferred = Q.defer();
    User.find({}, function(err, users) {
        if (err) return err;
        deferred.resolve(_.map(users, function(result) {
            return {
                _id: result._id,
                username: result.username,
                email: result.email
            }
        }));
    });

    return deferred.promise;
};

module.exports = User;