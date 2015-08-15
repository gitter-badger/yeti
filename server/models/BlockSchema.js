var mongoose = require('mongoose');

var BlockSchema = mongoose.Schema({
    type: String,
    title: String,
    content: String,
    numPosts: Number,
    displayTitles: Boolean,
    displayedCategories: [String]
});

module.exports = BlockSchema;