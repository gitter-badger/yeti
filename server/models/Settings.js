'use strict';

var config = require('../config/index');
var mongoose = require('mongoose');
var SettingsSchema = require('./SettingsSchema');
var Settings = mongoose.model(config.collections.settings, SettingsSchema);
var Q = require('q');
var cache = require('../lib/cache');
var ObjectId = require('mongodb').ObjectId;

Settings.getSettings = function() {
    var deferred = Q.defer();

    var cachedSetting = cache.get('settings');

    if (cachedSetting) {
        deferred.resolve(cachedSetting);
    } else {
        Settings.findOne({
            _id: config.settingsId
        }, function(err, result) {
            if (err) deferred.reject(err);

            cache.set('settings', result._doc);
            deferred.resolve(result);
        });
    }
    return deferred.promise;
};

Settings.setDefaultView = function(viewId) {
    return Settings.findOneAndUpdate({
        _id: config.settingsId
    }, {
        default_home: new ObjectId(viewId)
    }).exec();
};

Settings.setCss = function(css) {
    var deferred = Q.defer();

    Settings.findOneAndUpdate({
        _id: config.settingsId
    }, {
        user_stylesheet: css
    }, function(err, result) {
        if (err) deferred.reject(err);

        cache.flush();
        deferred.resolve(result);
    });

    return deferred.promise;
};

module.exports = Settings;