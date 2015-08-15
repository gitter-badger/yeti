var Q = require('q');
var utils = require('./utils');
var mongoose = require('mongoose');

module.exports = {
    connect: function() {
        var deferred = Q.defer();

        mongoose.connect(utils.buildDbPath(), function(err, db) {
            if (err) {
                deferred.reject(err);
            }
            deferred.resolve(db);
        });
        return deferred.promise;
    }
};
