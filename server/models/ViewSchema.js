var mongoose = require('mongoose');

var ViewSchema = mongoose.Schema({
    default: Boolean,
    title: String,
    route: String,
    content: String
});

module.exports = ViewSchema;