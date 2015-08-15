var mongoose = require('mongoose');

var ScriptsSchema = mongoose.Schema({
    enabled: Boolean,
    title: String,
    type: String,
    content: String
});

module.exports = ScriptsSchema;