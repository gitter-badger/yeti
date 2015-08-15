'use strict';

var config = require('../config/index');
var mongoose = require('mongoose');
var PostSchema = require('./PostSchema');
var Post = mongoose.model(config.collections.posts, PostSchema);
var User = require('./User');
var cache = require('../lib/cache');
var Q = require('q');
var _ = require('lodash');

Post.getAllPosts = function() {
    var deferred = Q.defer();

    Post.find({}).lean().exec(function(err, posts) {
        if (err) return err;
        return posts;
    }).then(function(posts) {
        User.find().lean().exec(function(err, users) {
            if (err) return err;

            // Todo: Determine why lodash _.each does not contain users in scope (even when passing in this)
            for (var i=0; i<posts.length; i++) {
                posts[i].author = _.result(_.find(users, function(user) {
                    if (posts[i].author) {
                        return user._id.toString() === posts[i].author.toString();
                    }
                }), 'username');
            }

            deferred.resolve(posts);
        }, this);
    });

    return deferred.promise;
};

Post.getPost = function(post) {
    var deferred = Q.defer();
    var ObjectId = mongoose.Types.ObjectId;

    var cachedPost = cache.get(post);

    if (cachedPost) {
        deferred.resolve(cachedPost);
    } else {
        Post.findOne({'_id': ObjectId(post)}).lean().exec(function (err, result) {
            if (err) deferred.reject(err);

            var bodyContent = result || {body: {content: '<h3>Post ' + post + ' is missing.</h3>'}};
            bodyContent.postCategory = result.category;

            cache.set(post, bodyContent);
            deferred.resolve(bodyContent);
        });
    }

    return deferred.promise;
};

Post.getCategories = function() {
    return Post.find().distinct('category').lean().exec(function(err, posts) {
        if (err) return err;
        return posts;
    });
};

Post.postPost = function(postId, postContent, postCategory) {
    var deferred = Q.defer();

    Post.findOneAndUpdate({_id: postId},{
        $set: {
            content: postContent,
            category: postCategory
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

Post.addPost = function(postName, author) {
    var deferred = Q.defer();

    var post = new Post({
        title: postName,
        author: author,
        content: ''
    });
    post.save(function(err) {
        if (err) deferred.reject(err);
        deferred.resolve(post);
    });

    return deferred.promise;
};

Post.deletePost = function(postId) {
    var deferred = Q.defer();

    Post.find({_id:postId}).remove().then(function(result) {
        cache.flush();
        deferred.resolve(result);
    }).catch(function(err) {
        console.log(err);
    });

    return deferred.promise;
};

module.exports = Post;