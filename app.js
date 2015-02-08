var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Our in-memory key-value store for saving the id => URL associations
var store = {};

function generateIdentifier(url) {
  /* Collisions really shouldn't happen but since we're not even using
     the full hash, better be safe than sorry */

  var i = 0;
  while (true) {
    var gen = crypto.createHash('sha256');
    var hash = gen.update(url + '#' + i).digest('base64');
    var id = hash.substring(0, 8);
    
    if (!(id in store)) {
      store[id] = url;
      return id;
    } else {
      // We can reuse the identifier if the URLs match
      if (store[id] === url) {
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

app.get('/', function(req, res) {
  res.send('shortnr - yet another url shortening service');
});

app.post('/shorten', function(req, res) {
  if (typeof req.body.link === 'undefined') {
    return next(new Error('You need to provide an URL to shorten'));
  }

  res.type('text/plain');
  res.send(generateIdentifier(req.body.link));
});

app.get('/:id', function(req, res) {
  if (typeof req.params.id === 'undefined') {
    return next(new Error('Undefined id'));
  }

  var url = getUrl(req.params.id);
  if (url === null) {
    return res.status(404).send('Not found');
  }
  
  res.redirect(301, url);
});

module.exports = app;
