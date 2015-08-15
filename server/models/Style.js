'use strict';

var config = require('../config/index');
var mongoose = require('mongoose');
var StyleSchema = require('./StyleSchema');
var Style = mongoose.model('Style', StyleSchema, config.collections.styles);
var cache = require('../lib/cache');
var Q = require('q');
var _ = require('lodash');

Style.getAllStyles = function() {
    var deferred = Q.defer();

    var cachedStyle = cache.get('allStyle');

    if (cachedStyle) {
        deferred.resolve(cachedStyle);
    } else {
        Style.find().lean().exec(function (err, style) {
            if (err) return err;

            cache.set('allStyle', style);
            deferred.resolve(style);
        });
    }

    return deferred.promise;
};

Style.getStyle = function(style) {
    var deferred = Q.defer();
    var ObjectId = mongoose.Types.ObjectId;

    var cachedStyle = cache.get(style);

    if (cachedStyle) {
        deferred.resolve(cachedStyle);
    } else {
        Style.findOne({"_id": ObjectId(style)}, function (err, result) {
            if (err) deferred.reject(err);

            var bodyContent = result || {body: {content: '<h3>Style ' + style + ' is missing.</h3>'}};
            var cachedStyle = _.find(cache.get('allStyle'), {'_id': ObjectId(style)});
            bodyContent.styleType = _.result(cachedStyle, 'type');
            bodyContent.enabled = _.result(cachedStyle, 'enabled');

            cache.set(style, bodyContent);
            deferred.resolve(bodyContent);
        });
    }

    return deferred.promise;
};

Style.postStyle = function(enabled, styleId, styleContent, styleType) {
    var deferred = Q.defer();

    Style.findOneAndUpdate({_id: styleId},{
        $set: {
            enabled: enabled,
            type: styleType,
            content: styleContent
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

Style.addStyle = function(styleType, styleName) {
    var deferred = Q.defer();

    var style = new Style({
        enabled: true,
        type: styleType,
        title: styleName,
        content: ''
    });
    style.save(function(err) {
        if (err) deferred.reject(err);

        cache.flush();
        deferred.resolve(style);
    });

    return deferred.promise;
};

Style.deleteStyle = function(styleId) {
    var deferred = Q.defer();

    Style.find({_id:styleId}).remove().then(function(result) {
        cache.flush();
        deferred.resolve(result);
    }).catch(function(err) {
        console.log(err);
    });

    return deferred.promise;
};

module.exports = Style;