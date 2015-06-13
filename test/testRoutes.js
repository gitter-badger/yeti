var request = require('supertest');
var app = require('../app');

describe('Route Tests', function() {
    it('should go to root', function(done) {
        request(app)
            .get('/')
            .expect(200)
            .expect({}, done);
    });

    it('should register a user', function(done) {
        var _testUsername = 'testUser';
        request(app)
            .post('/users')
            .send({
                username: _testUsername,
                email: 'user@google.com',
                password: 'pass'
            })
            .expect(function(result) {
                if (_testUsername === result.body.ops[0].username) {
                    return true;
                } else {
                    throw new Error('Username did not match.');
                }
            })
            .expect(200, done)
    });

    it('should not register a duplicate user', function(done) {
        var _testUsername = 'testUser';
        request(app)
            .post('/users')
            .send({
                username: _testUsername
            })
            .expect(function(result) {
                if (result.error) {
                    return true;
                } else {
                    throw new Error('Inserted duplicate user.');
                }
            })
            .expect(500, done)
    });

    it('should retrieve a user', function(done) {
        var _testUsername = 'thom';
        request(app)
            .get('/users/' + _testUsername)
            .expect(200)
            .expect(function(result) {
                if (_testUsername === result.body.username) {
                    return true;
                } else {
                    throw new Error('Username did not match.');
                }
            })
            .end(done)
    });

    it('should verify a user', function(done) {
        var _testUsername = 'testUser';
        request(app)
            .post('/users/verify')
            .send({
                username: _testUsername,
                password: 'pass'
            })
            .expect(200)
            .end(done)
    });

    it('should not verify a user (bad password)', function(done) {
        var _testUsername = 'testUser';
        request(app)
            .post('/users/verify')
            .send({
                username: _testUsername,
                password: 'pass2'
            })
            .expect(401)
            .end(done)
    });
});
