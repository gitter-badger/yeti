var util = require('util');
var config = require('../config/index');
var Styles = require('../models/Style');
var Scripts = require('../models/Scripts');
var View = require('../models/View');
var Uglify = require("uglify-js");
var _ = require('lodash');

var utils = {};

utils.buildDbPath = function() {
    return util.format('%s:%s/%s', config.dbServer, config.dbPort, config.dbDatabase);
};

utils.obfuscateJs = function(code) {
    var ast = Uglify.parse(code);
    var compress = Uglify.Compressor();
    ast.figure_out_scope();
    ast = ast.transform(compress);
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names();
    return Uglify.minify(ast.print_to_string(), {fromString: true}).code;
};

utils.buildPage = function(viewId) {
    var bodyContent;

    return Styles.getAllStyles().then(function(result) {
        var styleContent = '<style>';
        var linkContent = '';
        _.each(result, function(style) {
            if (style.enabled) {
                var code = style.content;

                if (style.type === 'code') {
                    styleContent += code;
                } else if (style.type === 'link') {
                    linkContent += '<link rel="stylesheet" href="' + code + '">';
                }
            }
        });
        styleContent += '</style>';
        return linkContent + styleContent;
    }).then(function(styleContent) {
        var content = {
            styleContent: styleContent,
            scriptsContent: ''
        };
        return Scripts.getAllScripts().then(function (result) {
            var codeContent = '<script>';
            var linkContent = '';
            _.each(result, function (script) {
                if (script.enabled) {
                    var code = script.content;

                    if (script.type === 'code') {
                        codeContent += utils.obfuscateJs(code);
                    } else if (script.type === 'link') {
                        linkContent += '<script src="' + code + '"></script>';
                    }
                }
            });

            codeContent += '</script>';
            content.scriptsContent = linkContent + codeContent;

            return content;
        });
    }).then(function(content) {
        return View.getView(viewId).then(function(result) {
            bodyContent = result.body.content;
            return {
                bodyContent: bodyContent,
                styleContent: content.styleContent.replace(/\n/g, ''),
                scriptsContent: content.scriptsContent
            };
        });
    });
};

module.exports = utils;