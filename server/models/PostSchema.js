var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var PostSchema = mongoose.Schema({
    category: String,
    title: String,
    author: ObjectId,
    content: String
});

module.exports = PostSchema;