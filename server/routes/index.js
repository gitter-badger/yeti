var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var View = require('../models/View');
var Styles = require('../models/Style');
var Scripts = require('../models/Scripts');
var utils = require('../lib/utils');
var _ = require('lodash');

router.get('/', function(req, res, next) {
    var bodyContent;
    var defaultViewId;
    var styleContent = '';

    View.getDefaultViewId().then(function(result) {
        defaultViewId = result;
    }).then(function() {
        return Styles.getAllStyles().then(function(result) {
            var styleContent = '<style>';
            var linkContent = '';
            _.each(result, function(style) {
                if (style.enabled) {
                    var code = style.revisions[style.revisions.length - 1].body.content;

                    if (style.type === 'code') {
                        styleContent += code;
                    } else if (style.type === 'link') {
                        linkContent += '<link rel="stylesheet" href="' + code + '">';
                    }
                }
            });
            styleContent += '</style>';
            return linkContent + styleContent;
        });
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
                    var code = script.revisions[script.revisions.length - 1].body.content;

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
        return View.getView(defaultViewId).then(function(result) {
            bodyContent = result.body.content;
            res.render('index', {
                bodyContent: bodyContent,
                styleContent: content.styleContent.replace(/\n/g, ''),
                scriptsContent: content.scriptsContent
            });
        });
    });
});

module.exports = router;