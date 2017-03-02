#!/usr/bin/env node

if (typeof Object.assign != 'function') {
  Object.assign = function(target) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

'use strict';

const express = require('express');
const MONGO_URL = 'mongodb://db:27017/rapid';

var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var crypto = require('crypto');
var passport = require('passport');
var request = require('request');
var compression = require('compression');

require('./models/User');
require('./models/NameAge');
require('./models/Pricing');
require('./config/passport');

var jwt = require('express-jwt');

// load the super secret key from file
var fs = require('fs');
var SUPERSECRETKEY = fs.readFileSync(__dirname + '/config/secret');
SUPERSECRETKEY = SUPERSECRETKEY.slice(0, SUPERSECRETKEY.length - 1);
var auth = jwt({secret: SUPERSECRETKEY, userProperty: 'payload'});

var db = mongoose.connection;
var User = mongoose.model('User');
var NameAge = mongoose.model('NameAge');
var Pricing = mongoose.model('Pricing');

const PORT = 8080;
const app = express();
app.enable('trust proxy');
app.use(compression());

app.use('/js', express.static( path.join(__dirname, 'static/js')));
app.use('/css', express.static( path.join(__dirname, 'static/css')));
app.use('/view', express.static( path.join(__dirname, 'static/view')));

app.use(passport.initialize());
app.use(bodyparser.json());

app.param('name', function(req, res, next, name) {
  req.name = name;
  return next();
});

app.post('/api/login', function(req, res, next) {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({message: 'you must fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (user) {
      return res.json({token: user.generateJWT()});
    }else{
      return res.status(401).json(info);
    }
  })(req, res, next);
});

// PRICING FUNCTIONS

// create a new Pricing object and put it in mongo
app.post('/api/pricing', auth, function(req, res, next) {
  if (typeof req.body.vendor != 'string' || 
    typeof req.body.priceType != 'string' || 
    typeof req.body.instanceType != 'string' || 
    typeof req.body.productDescription != 'string' || 
    typeof req.body.price != 'number' || 
    typeof req.body.timestamp != 'string') {

      return res.status(402).json({message: `type mismatch! vendor (String), 
        priceType (String), instanceType (String), productDescription (String), 
        price (Number), timestamp (String)`});
  }

  var p = new Pricing();
  // var d = new Date(req.body.timestamp);
  p.vendor = req.body.vendor;
  p.priceType = req.body.priceType;
  p.instanceType = req.body.instanceType;
  p.productDescription = req.body.productDescription;
  p.price = req.body.price;
  p.timestamp = req.body.timestamp;

  p.save(function(err, _na) {
    if (err) {
      return res.status(501).json({message:`internal server error while trying 
        to store pricing doc`});
    }
    return res.json(_p);
  });
});

// NAMEAGE FUNCTIONS

// create a new NameAge object and put it in mongo
app.post('/api/nameage', auth, function(req, res, next) {
  if (typeof req.body.name != 'string' || typeof req.body.age != 'number') {
    return res.status(402).json({message: "you must pass the name and age in the body, and they must be a string and number, respectively"});
  }

  var na = new NameAge();
  na.name = req.body.name;
  na.age = req.body.age;

  na.save(function(err, _na) {
    if (err) {
      return res.status(501).json({message:`internal server error while trying 
        to store new nameage doc`});
    }
    return res.json(_na);
  });
});

// get *all* of the docs in the NameAge collection
app.get('/api/nameage', auth, function(req, res, next) {
  NameAge.find({}, function(err, name_ages) {
    if (err) {
      return next(err);
    }
    return res.json(name_ages);
  });
});

app.get('/api/nameage/by-name/:name', auth, function(req, res, next) {
  NameAge.find({name:req.name}, function(err, nameage) {
    if (err) {
      return next(err);
    }
    return res.json(nameage);
  });
});

app.all('/*', function(req, res, next) {
  res.sendFile( path.join(__dirname, 'static/index.html'));
});

function entrypoint() {
  mongoose.connect(MONGO_URL);
}

var shutdown_exit_code = 0;
function shutdown(signal, value) {
  if (server != null) {
    console.log('server stopped by ' + signal);
    shutdown_exit_code = value;
    server.close(function() {
      mongoose.disconnect();
    });
  }
}

var signals = {
  'SIGINT': 2,
  'SIGTERM': 15
};

var server = null;
db.once('open', function() {
  // we're connected!
  server = app.listen(PORT);
  console.log('Running on http://localhost:' + PORT);

  Object.keys(signals).forEach(function (signal) {
    process.on(signal, function () {
      shutdown(signal, signals[signal]);
    });
  });
});
db.on('error', function() {
  console.error.bind(console, 'connection error:');
  console.log('will try to connect again in 1 second...');
  setTimeout(entryPoint, 1000);
});
db.once('close', function() {
   console.log("db is closed");
   process.exit(128 + shutdown_exit_code);
});

entrypoint();

