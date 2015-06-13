var assert = require('assert');
var Joi = require('joi');

Joi.objectId = require('../model').joiObjectIdValidator;

describe('Model tests', function() {
    it('should create new schema with a valid objectId', function(done) {
        var TestSchema = Joi.object().keys({
            testObjectId: Joi.objectId()
        });
        assert(TestSchema);
        done();
    });
});