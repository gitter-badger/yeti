'use strict';

var config = require('../config/index');
var mongoose = require('mongoose');
var ScriptsSchema = require('./ScriptsSchema');
var Scripts = mongoose.model('Scripts', ScriptsSchema, config.collections.scripts);
var cache = require('../lib/cache');
var Q = require('q');
var _ = require('lodash');

Scripts.getAllScripts = function() {
    var deferred = Q.defer();

    var cachedScripts = cache.get('allScripts');

    if (cachedScripts) {
        deferred.resolve(cachedScripts);
    } else {
        Scripts.find().lean().exec(function (err, scripts) {
            if (err) return err;

            cache.set('allScripts', scripts);
            deferred.resolve(scripts);
        });
    }

    return deferred.promise;
};

Scripts.getScript = function(script) {
    var deferred = Q.defer();
    var ObjectId = mongoose.Types.ObjectId;

    var cachedScripts = cache.get(script);

    if (cachedScripts) {
        deferred.resolve(cachedScripts);
    } else {
        Scripts.findOne({"_id": ObjectId(script)}, function (err, result) {
            if (err) deferred.reject(err);

            var bodyContent = result || {body: {content: '<h3>Script ' + script + ' is missing.</h3>'}};
            var cachedScript = _.find(cache.get('allScripts'), {'_id': ObjectId(script)});
            bodyContent.scriptType = _.result(cachedScript, 'type');
            bodyContent.enabled = _.result(cachedScript, 'enabled');

            cache.set(script, bodyContent);
            deferred.resolve(bodyContent);
        });
    }

    return deferred.promise;
};

Scripts.postScript = function(enabled, scriptId, scriptContent, scriptType) {
    var deferred = Q.defer();

    Scripts.findOneAndUpdate({
        _id: scriptId
    },{
        $set: {
            enabled: enabled,
            type: scriptType,
            content: scriptContent
        }
    }, {
        safe: true,
        upsert: true,
        new: true
    }, function(err, result){
        if (err) deferred.reject(err);

        cache.flush();
        deferred.resolve(204);
    });
    return deferred.promise;
};

Scripts.addScript = function(scriptType, scriptName) {
    var deferred = Q.defer();

    var scripts = new Scripts({
        enabled: true,
        type: scriptType,
        title: scriptName,
        content: ''
    });
    scripts.save(function(err) {
        if (err) deferred.reject(err);

        cache.flush();
        deferred.resolve(scripts);
    });

    return deferred.promise;
};

Scripts.deleteScript = function(scriptId) {
    var deferred = Q.defer();

    Scripts.find({_id:scriptId}).remove().then(function(result) {
        cache.flush();
        deferred.resolve(result);
    }).catch(function(err) {
        console.log(err);
    });

    return deferred.promise;
};

module.exports = Scripts;