var util = require('util');

module.exports = config = require(buildConfigPath());

function buildConfigPath() {
    var env = process.env.NODE_ENV || 'dev';
    return util.format('./%s.json', env);
}
