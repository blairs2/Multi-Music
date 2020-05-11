var express = require('express');       // imports the express library
var router = express.Router();          // Router object for routes
const https = require('https');
const jwt = require('jsonwebtoken');
const fs = require('fs');
// const mm_module = require('./modules/multi_music.js');

const private_key = fs.readFileSync('apple_private_key.p8').toString(); // read your private key from your file system
const team_id = 'J3P2DY3RZZ'; // your 10 character apple team id, found in https://developer.apple.com/account/#/membership/
const key_id = '968VB2ATHG'; // your 10 character generated music key id. more info https://help.apple.com/developer-account/#/dev646934554
const token = jwt.sign({}, private_key, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: team_id,
  header: {
    alg: 'ES256',
    kid: key_id
  }
});

router.get('/token', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({token: token}));
});

function saveJSON(name,data){
    fs.writeFileSync(`${name}.json`, JSON.stringify(data));

}



router.get('/search/apple-music/:search_term', function(request, response){
    var term = request.params.search_term //ALl the spaces in the search must be replaced with '+'
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/catalog/us/search?${term}`,
      method: 'GET',
      headers: {
            'Authorization' : 'Bearer ' + token
      }
    }
    https.get(options, function (res, body) {
          let data = '';
          console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
          res.setEncoding('utf8');
          //Collect  all the response
          res.on('data', (chunk) => {
            data += chunk;
          });
          // The whole response has been received. send the result.
          res.on('end', () => {
            response.send(data);
          });
    });
});



router.get('/library/playlists/:playlist_id', function(request, response){
    var playlist = request.params.playlist_id //ALl the spaces in the search must be replaced with '+'
    //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
    var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
    console.log(music_user_token);
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/me/library/playlists/${playlist}`,
      method: 'GET',
      headers: {
            'Music-User-Token': music_user_token,
            'Accept': 'application/a-gzip, application/json',
            'Authorization' : 'Bearer ' + token
      }
    }
    https.get(options, function (res, body) {
          let data = '';
          console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
          res.setEncoding('utf8');
          //Collect  all the response
          res.on('data', (chunk) => {
            data += chunk;
          });
          // The whole response has been received. send the result.
          res.on('end', () => {
            response.send(data);
          });
    });
});



router.get('/search/apple-music/hints/:search_term', function(request, response){
    var search_term = request.params.search_term //ALl the spaces in the search must be replaced with '+'

    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/catalog/us/search/hints?term=${search_term}`,
      method: 'GET',
      headers: {
            'Accept': 'application/a-gzip, application/json',
            'Authorization' : 'Bearer ' + token
      }
    }
    https.get(options, function (res, body) {
          let data = '';
          console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
          res.setEncoding('utf8');
          //Collect  all the response
          res.on('data', (chunk) => {
            data += chunk;
          });
          // The whole response has been received. send the result.
          res.on('end', () => {
            response.send(data);
          });
    });
});

//gets all the users playlists in alphebetical order
router.get('/library/playlists', function(request, response){
    var search_term = request.params.search_term //ALl the spaces in the search must be replaced with '+'
    //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
    var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/me/library/playlists`,
      method: 'GET',
      headers: {
            'Music-User-Token': music_user_token,
            'Accept': 'application/a-gzip, application/json',
            'Authorization' : 'Bearer ' + token
      }
    }
    https.get(options, function (res, body) {
          let data = '';
          console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
          res.setEncoding('utf8');
          //Collect  all the response
          res.on('data', (chunk) => {
            data += chunk;
          });
          // The whole response has been received. send the result.
          res.on('end', () => {
            response.send(data);
          });
    });
});

//Fetch the complete library of the users albums
router.get('/library/albums', function(request, response){
  //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
  var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
  const options = {
    hostname: 'api.music.apple.com',
    path: '/v1/me/library/albums',
    method: 'GET',
    headers: {
          'Music-User-Token': music_user_token,
          'Accept': 'application/a-gzip, application/json',
          'Authorization' : 'Bearer ' + token
    }
  }
  https.get(options, function (res, body) {
        let data = '';
        console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
        res.setEncoding('utf8');
        //Collect  all the response
        res.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. send the result.
        res.on('end', () => {
          response.send(data);
        });
  });
});

//Fetch the library of the users songs (default 25)
router.get('/library/songs', function(request, response){
  //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
  var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
  const options = {
    hostname: 'api.music.apple.com',
    path: '/v1/me/library/songs',
    method: 'GET',
    headers: {
          'Music-User-Token': music_user_token,
          'Accept': 'application/a-gzip, application/json',
          'Authorization' : 'Bearer ' + token
    }
  }
  https.get(options, function (res, body) {
        let data = '';
        console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
        res.setEncoding('utf8');
        //Collect  all the response
        res.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. send the result.
        res.on('end', () => {
          response.send(data);
        });
  });
});

//Fetch the library of the users artists (default 25)
router.get('/library/artists', function(request, response){
  //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
  var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
  const options = {
    hostname: 'api.music.apple.com',
    path: '/v1/me/library/artists',
    method: 'GET',
    headers: {
          'Music-User-Token': music_user_token,
          'Accept': 'application/a-gzip, application/json',
          'Authorization' : 'Bearer ' + token
    }
  }
  https.get(options, function (res, body) {
        let data = '';
        console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
        res.setEncoding('utf8');
        //Collect  all the response
        res.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. send the result.
        res.on('end', () => {
          response.send(data);
        });
  });
});




//gets all the users playlists in alphebetical order
router.post('/library/playlist', function(request, response){
  var post_obj = JSON.stringify(request.body); //Need to include bodyParser in server.js
  console.log(post_obj);
    //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
    var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/me/library/playlists`,
      method: 'POST',
      headers: {
            'Music-User-Token': music_user_token,
            'Accept': 'application/a-gzip, application/json',
            'Authorization' : 'Bearer ' + token,
            'Content-Length': Buffer.byteLength(post_obj)
      }
    }
  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
      process.stdout.write(d)
    });
  });

req.on('error', error => {
  console.error(error)
});

  req.write(post_obj);
  req.end();


});



module.exports = router;
