var mongoose = require('mongoose');

var SettingsSchema = mongoose.Schema({
    default_home: mongoose.Schema.Types.ObjectId,
    user_stylesheet: String
});

module.exports = SettingsSchema;