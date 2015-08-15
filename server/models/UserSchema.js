var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
    username: String,
    email: String,
    hash: String
});

module.exports = UserSchema;