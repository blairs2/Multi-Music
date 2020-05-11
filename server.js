#!/usr/bin/env node
const express = require('express');
const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 8080;
const publicDir =  __dirname + '/public';
const path = require('path');
const https = require('https');
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// This allows us to read body of post request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// respond with displaying homepage (index.html) when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, '/index.html'));
});

// library for signing tokens

var apple_music_router = require('./routers/apple_music.js');


app.use(apple_music_router);
app.use(express.static(publicDir));


console.log('Listening at', publicDir, hostname, port);
app.listen(port, hostname);
