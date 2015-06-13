'use strict';

var config = require('../config');
var mongoose = require('mongoose');
var UserSchema = require('./UserSchema');
var User = mongoose.model(config.collections.users, UserSchema);
var Q = require('q');
var _ = require('lodash');
var crypt = require('../lib/crypt');

User.findUser = function(userName) {
    var deferred = Q.defer();
    User.findOne({
        'username': userName
    }, function(err, result) {
        if (err) deferred.reject(err);
        deferred.resolve(result);
    });
    return deferred.promise;
};

User.updateOne = function(id, data) {
    var deferred = Q.defer();
    User.findOneAndUpdate({_id: id}, data, function(err, result) {
        if (err) deferred.reject(err);
        deferred.resolve(result);
    });
    return deferred.promise;
};

User.prototype.save = function() {
    var deferred = Q.defer();
    if(!this.data){
        deferred.reject(new Error('Must provide data.'));
        return deferred.promise;
    }
    return BaseModel.prototype.save.call(this);
};

User.prototype.patch = function(id, patch, options) {
    var deferred = Q.defer();
    if(!this.id || !this.patch){
        deferred.reject(new Error('Must provide data.'));
        return deferred.promise;
    }
    return BaseModel.prototype.patch.call(this);
};

User.verify = function(passWord, hash) {
    return crypt.decrypt(passWord, hash);
};

module.exports = User;