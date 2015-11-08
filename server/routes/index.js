var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var View = require('../models/View');
var Styles = require('../models/Style');
var Scripts = require('../models/Scripts');
var utils = require('../lib/utils');
var _ = require('lodash');

// Default view for root index page
router.get('/', function(req, res, next) {
    var defaultViewId;

    View.getDefaultViewId().then(function(result) {
        defaultViewId = result;
        buildPage(defaultViewId).then(function(result){
            res.render('index', result);
        });
    });
});

// All custom defined routes by the user
router.get('/*', function(req, res) {
    View.getRoutes().then(function(result) {
        var reqRoute = _.find(result, { 'route': req.url });
        if (reqRoute) {
            buildPage(reqRoute._id).then(function(result){
                res.render('index', result);
            });
        } else {
            res.render('index', {
                bodyContent: '404 Route Not Found.'
            });
        }
    });
});

function buildPage(viewId) {
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
}

module.exports = router;