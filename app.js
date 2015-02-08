var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.send('shortnr - yet another url shortening service');
});

app.post('/shorten', function(req, res) {
  res.send('got ' + req.body.link);
});

app.get('/:id', function(req, res) {
  res.send('got ' + req.params.id);
});

module.exports = app;
