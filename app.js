var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('shortnr - yet another url shortening service');
});

app.post('/shorten', function(req, res) {
  res.send('shorten');
});

app.get('/:id', function(req, res) {
  res.send('got ' + req.params.id);
});

module.exports = app;
