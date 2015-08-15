'use strict';

var config = require('../config/index');
var cache = require('../lib/cache');
var mongoose = require('mongoose');
var ViewSchema = require('./ViewSchema');
var View = mongoose.model(config.collections.views, ViewSchema);
var blocks = require('./Block');
var Q = require('q');
var _ = require('lodash');

View.getView = function(view) {
    var deferred = Q.defer();
    var ObjectId = mongoose.Types.ObjectId;

    if (view) {
        var cachedView = cache.get(view);

        if (cachedView) {
            deferred.resolve(cachedView);
        } else {
            View.findOne({"_id": ObjectId(view)}).lean().exec(function (err, result) {
                if (err) console.log(err);

                var bodyContent = {
                    body: {
                        content: ''
                    }
                };
                parseView(result.content).then(function (result) {
                    bodyContent.body.content = viewify(view, result);
                    bodyContent.id = view;

                    cache.set(view, bodyContent);
                    deferred.resolve(bodyContent);
                });
            });
        }
    } else {
        deferred.resolve({body:{content:'No default view or view does not exist.'}});
    }

    return deferred.promise;
};

View.getDefaultViewId = function() {
    var deferred = Q.defer();

    var cachedViewId = cache.get('defaultViewId');

    if (cachedViewId) {
        deferred.resolve(cachedViewId);
    } else {
        View.findOne({
            default: true
        }).lean().exec(function (err, result) {
            if (err) console.log(err);


            if (result) {
                cache.set('defaultViewId', result._id);
                deferred.resolve(result._id);
            } else {
                deferred.resolve();
            }
        });
    }

    return deferred.promise;
};

View.getViewForEdit = function(view) {
    var deferred = Q.defer();
    var ObjectId = mongoose.Types.ObjectId;
    View.findOne({_id:ObjectId(view)}, function(err, result) {
        var bodyContent = result[0].content;
        if (err) console.log(err);

        deferred.resolve(bodyContent);
    });

    return deferred.promise;
};

View.getViewsForEdit = function() {
    var deferred = Q.defer();

        View.find({}, function(err, result) {
            if (err) console.log(err);

            deferred.resolve(_.map(result, function(view) {
                return {
                    id: view._id,
                    content: view.content || '<h1>Please add a block to get started with this view.</h1>',
                    defaultView: view.default,
                    title: view.title,
                    route: view.route
                };
            }));
        });

    return deferred.promise;
};

View.postView = function(viewId, viewContent, viewRoute, viewIsDefault) {
    var deferred = Q.defer();

    clearAllDefaultViews(viewIsDefault).then(function() {
        updateView(viewId, viewContent, viewRoute, viewIsDefault).then(function() {
            cache.flush();
            deferred.resolve(204);

            Q.resolve();
        });
    });

    return deferred.promise;
};

View.addView = function(viewName) {
    var deferred = Q.defer();

    var view = new View({
        title: viewName,
        route: '/' + viewName,
        content: ''
    });
    view.save(function(err) {
        if (err) deferred.reject(err);
        deferred.resolve(view);
    });

    return deferred.promise;
};

View.deleteView = function(viewId) {
    var deferred = Q.defer();

    View.find({_id:viewId}).remove().then(function(result) {
        cache.flush();
        deferred.resolve(result);
    }).catch(function(err) {
        console.log(err);
    });

    return deferred.promise;
};

View.getRoutes = function() {
    var deferred = Q.defer();
    View.find({}, function(err, views) {
        if (err) return err;

        deferred.resolve(_.map(views, function(view) {
            return {
                _id: view._id,
                route: view.route
            }
        }));
    });
    return deferred.promise;
};

function clearAllDefaultViews(viewIsDefault) {
    if (viewIsDefault) {
        return View.update({}, {
            default: false
        }, {
            multi: true
        }).exec();
    } else {
        return new Q.resolve();
    }
}

function updateView(viewId, viewContent, viewRoute, viewIsDefault) {
    return View.findOneAndUpdate({
        _id: viewId
    },{
        $set: {
            default: viewIsDefault,
            route: viewRoute,
            content: viewContent
        }
    }).exec();
}

function parseView(content) {
    var deferred = Q.defer();
    var promises = [];

    var reg = /\{\{\-([\s\S]*?)\}\}/gm;

    var matches = content.match(reg);

    if(matches) {
        matches.forEach(function (match) {
            var innerDeferred = Q.defer();
            var blockId = match.replace(/\{\{\-|\}\}/g, '');
            blocks.getBlock(blockId).then(function (result) {
                content = content.replace(match, blockify(blockId, result.content));
                innerDeferred.resolve(content);
            });
            promises.push(innerDeferred.promise);
        });

        Q.all(promises).then(function (promise) {
            deferred.resolve(content);
        });
    } else {
        deferred.resolve(content);
    }
    return deferred.promise;
}

function blockify(id, content) {
    return '<div id="' + id + '" class="dash-block">' + content + '</div>';
}

function viewify(id, content) {
    return '<div id="' + id + '" class="dash-view">' +  content + '</div>';
}

module.exports = View;