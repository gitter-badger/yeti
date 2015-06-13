var assert = require('assert');
var db = require('../lib/db');
var proxyquire =  require("proxyquire").noPreserveCache();
var mongodbMock = require('./mocks/mongodb');

describe('DB Tests', function() {
    it('should connect to the database', function(done) {
        db.connect().then(function(result) {
            assert(result);
            done();
        }).catch(done);
    });

    it('should not connect to the database', function(done) {
        var Db = proxyquire('../lib/db', {
            'mongodb': mongodbMock
        });

        Db.connect().then(function() {
            assert.fail();
        }).catch(function(err) {
            assert.equal(err.message, 'connect ECONNREFUSED');
            done();
        }).catch(done);
    });
});