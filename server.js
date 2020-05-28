#!/usr/bin/env node
const express = require('express');
const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 8080;
const publicDir =  __dirname + '/public';
const path = require('path');
const https = require('https');

const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');

//var port = 3306;

// configure app to use bodyParser()
// This allows us to read body of post request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// respond with displaying homepage (index.html) when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, '/login.html'));
});

// library for signing tokens

app.use(express.static(__dirname + '/Public'))
   .use(cors())
   .use(cookieParser());

app.use(express.static(publicDir));

var apple_music_router = require('./routers/apple_music.js');
app.use(apple_music_router);

var spotify_router = require('./routers/spotify.js');
app.use(spotify_router);

// var db = require('./routers/database.js');

// db.connect(function connectionHandler(err){
//   if (err){
//     console.log('Unable to connect to MySQL')
//   } else {
//     console.log("Connection to MySQL successfull");
//   }
// });

console.log('Listening at', publicDir, hostname, port);
app.listen(port, hostname);
