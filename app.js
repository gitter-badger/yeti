#!/usr/bin/env node
var util = require('util');
var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var config = require('./config');
var routes = require('./routes/index');
var users = require('./routes/user');
var db = require('./lib/db');

var app = express();
var server = http.createServer(app);

db.connect();

server.listen(config.port);
server.on('error', function (err) {
    console.error(err);
});
server.on('listening', function() {
    console.log(util.format('Listening on port %s in environment \'%s\'.', config.port, process.env.NODE_ENV));
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/users', users);

app.locals.pretty = true;

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;