var util = require('util');
var config = require('../config');

module.exports = {
    buildDbPath: function() {
        return util.format('%s:%s/%s', config.dbServer, config.dbPort, config.dbDatabase);
    }
};