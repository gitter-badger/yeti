var util = require('util');
var config = require('../config/index');
var Uglify = require("uglify-js");

module.exports = {
    buildDbPath: function() {
        return util.format('%s:%s/%s', config.dbServer, config.dbPort, config.dbDatabase);
    },
    obfuscateJs: function(code) {
        var ast = Uglify.parse(code);
        var compress = Uglify.Compressor();
        ast.figure_out_scope();
        ast = ast.transform(compress);
        ast.figure_out_scope();
        ast.compute_char_frequency();
        ast.mangle_names();
        return Uglify.minify(ast.print_to_string(), {fromString: true}).code
    }
};