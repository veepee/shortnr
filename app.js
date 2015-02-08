var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var validator = require('validator');
var url = require('url');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Our in-memory key-value store for saving the id => URL associations
var store = {};

function generateIdentifier(link) {
  /* Collisions really shouldn't happen but since we're not even using
     the full hash, better be safe than sorry */

  var i = 0;
  while (true) {
    var gen = crypto.createHash('sha256');
    var hash = gen.update(link + '#' + i).digest('base64');
    hash = hash.replace('/', '_');
    var id = hash.substring(0, 8);
    
    if (!(id in store)) {
      store[id] = link;
      return id;
    } else {
      // We can reuse the identifier if the URLs match
      if (store[id] === link) {
        return id;
      }
    }

    i++;
  }
}

function getUrl(id) {
  if (id in store) {
    return store[id];
  }
  
  return null;
}

function getCompleteUrl(link) {
  // url.parse fails on URLs without the http prefix,
  // obj = url.parse('testurl.com') returns null for obj.host,
  // should return testurl.com
  if(!(link.indexOf('http://') === 0 || link.indexOf('https://') === 0)) {
    link = 'http://' + link;
  }

  var obj = url.parse(link);
  var completeUrl = obj.protocol + '//' + obj.host;
  
  // If the path is empty (URL is of form *example.com), 
  // it needs to have a trailing slash or it is interpreted as relative
  if (obj.path == null) {
    completeUrl += '/';
  } else {
    completeUrl += obj.path;
  }  

  completeUrl += obj.hash ? obj.hash : '';
  return completeUrl;
}

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

app.post('/shorten', function(req, res, next) {
  if (typeof req.body.link === 'undefined') {
    return next(new Error('You need to provide an URL to shorten'));
  }

  var link = getCompleteUrl(req.body.link);
  if (!validator.isURL(link)) {
    return next(new Error('You provided an invalid URL'));
  }

  res.type('text/plain');
  res.send(generateIdentifier(link));
});

app.get('/:id', function(req, res, next) {
  if (typeof req.params.id === 'undefined') {
    return next(new Error('Undefined id'));
  }

  var link = getUrl(req.params.id);
  if (link === null) {
    return res.status(404).send('Not found');
  }

  res.redirect(301, link);
});

app.use(function(err, req, res, next) {
  res.status(500).send(err.message);
});

module.exports = app;
