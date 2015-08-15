'use strict';

var config = require('../config/index');
var mongoose = require('mongoose');
var BlockSchema = require('./BlockSchema');
var Block = mongoose.model(config.collections.blocks, BlockSchema);
var posts = require('./Post');
var cache = require('../lib/cache');
var Q = require('q');
var _ = require('lodash');
var moment = require('moment');

Block.getAllBlocks = function() {
    return Block.find({}, function(err, views) {
        if (err) return err;
        return views;
    });
};

Block.getBlock = function(block) {
    var deferred = Q.defer();
    var ObjectId = mongoose.Types.ObjectId;

    var cachedBlock = cache.get(block);

    if (cachedBlock) {
        deferred.resolve(cachedBlock);
    } else {
        Block.findOne({'_id': ObjectId(block)}).lean().exec(function (err, result) {
            if (err) deferred.reject(err);

            if (result.type === 'blog') {
                posts.getAllPosts().then(function (posts) {
                    var postCount = 0;
                    var newContent = '<div class="posts">';
                    _.each(posts, function(post) {
                        if (_.includes(result.displayedCategories, post.category) && postCount < result.numPosts) {
                            if (result.displayTitles) {
                                newContent += '<div id="' + post._id + '" class="title">';
                                newContent += post.title;
                                newContent += '</div><div class="time">Posted on ' + moment(post._id.getTimestamp().toISOString()).format('MM-DD-YYYY') + ' in <i>' + post.category + '</i> by ' + post.author + '</div>';
                            }
                            newContent += '<div class="body">' + post.content + '</div>';
                            postCount++;
                        }
                    });
                    newContent += '</div>';
                    newContent = {
                        type: result.type,
                        title: result.title,
                        content: newContent,
                        numPosts: result.numPosts,
                        displayTitles: result.displayTitles,
                        displayedCategories: result.displayedCategories
                    };
                    cache.set(block, newContent);
                    deferred.resolve(newContent);
                });
            } else {
                var bodyContent = result || {body: {content: '<h3>Block ' + block + ' is missing.</h3>'}};

                cache.set(block, bodyContent);
                deferred.resolve(bodyContent);
            }
        });
    }

    return deferred.promise;
};

Block.postBlock = function(args) {
    var deferred = Q.defer();
    var updateInstructions = {};

    if (args.blockContent) {
        updateInstructions = {
                $set: {
                    content: args.blockContent
                }
            };
    }
    if (args.numPosts) {
        updateInstructions = {
                $set: {
                    numPosts: args.numPosts,
                    displayTitles: args.displayTitles,
                    displayedCategories: args.displayedCategories
                }
            };
    }

    Block.findOneAndUpdate({
        _id: args.blockId
    },updateInstructions, {
        safe: true,
        upsert: true,
        new: true
    }, function(err){
        if (err) deferred.reject(err);

        cache.flush();
        deferred.resolve(204);
    });
    return deferred.promise;
};

Block.addBlock = function(blockName, blockType) {
    var deferred = Q.defer();
    var blockObj = {
        title: blockName,
        type: blockType
    };

    if (blockType === 'content') {
        blockObj.content = '';
    }

    var block = new Block(blockObj);
    block.save(function(err) {
        if (err) deferred.reject(err);
        deferred.resolve(block);
    });

    return deferred.promise;
};

Block.deleteBlock = function(blockId) {
    var deferred = Q.defer();

    Block.find({_id:blockId}).remove().then(function(result) {
        cache.flush();
        deferred.resolve(result);
    }).catch(function(err) {
        console.log(err);
    });

    return deferred.promise;
};

module.exports = Block;