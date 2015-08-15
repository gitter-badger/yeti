var mongoose = require('mongoose');

var MediaSchema = mongoose.Schema({
    file_name: String,
    media_data: Buffer,
    thumbnail_data: Buffer
});

module.exports = MediaSchema;