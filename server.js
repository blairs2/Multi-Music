var express = require('express');
var http = require('http');
var app = express();
var server = http.Server(app);
var db = require('./db');
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 5000;

const publicDir = __dirname + '/public';
const path = require('path');

// library for signing tokens (apple music)
const jwt = require('jsonwebtoken');
const fs = require('fs');

// respond with displaying homepage (index.html) when a GET request is made to the homepage
db.connect(function ConnectionHandler(err){
    if (err){
        console.log('Unable to connect to MySQL');
        process.exit(1);
    }
    console.log("Connection to MySQL Successfull");
});

app.get('/', function (request, response) {
  response.sendFile(path.join(publicDir, '/index.html'));
});

const private_key = fs.readFileSync('apple_private_key.p8').toString(); // read private key
const team_id = 'J3P2DY3RZZ'; // 10 character apple team id, found in https://developer.apple.com/account/#/membership/
const key_id = '968VB2ATHG'; // 10 character generated music key id. more info https://help.apple.com/developer-account/#/dev646934554
const token = jwt.sign({}, private_key, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: team_id,
  header: {
    alg: 'ES256',
    kid: key_id
  }
});

app.get('/token', function (request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.send(JSON.stringify({token: token}));
});

// Set static content
app.use(express.static(publicDir));

console.log('Listening at', publicDir, hostname, port);
app.listen(port, hostname);



// var bodyParser = require('body-parser');
// // configure app to use bodyParser()
// // this will let us get the data from a POST
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.all('/api', function HandleAll(request, response, next){
//     console.log(request.connection.remoteAddress);
//     next();
// });

// more routes for our API will happen here
var spotifyRouter = require('./routers/spotify.js');         // get an instance of the express Router
var appleMusicRouter = require('./routers/apple_music.js');
var multiMusicRouter  = require('./routers/multi_music.js');

app.use(express.static('public'));


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api

app.use('/api', multiMusicRouter);
app.use('/api', appleMusicRouter);
app.use('/api', spotifyRouter);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Multi-Music Application ' + port);
