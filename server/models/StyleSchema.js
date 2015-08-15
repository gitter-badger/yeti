var mongoose = require('mongoose');

var CssSchema = mongoose.Schema({
    enabled: Boolean,
    type: String,
    title: String,
    content: String
});

module.exports = CssSchema;