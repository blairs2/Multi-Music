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

/*
Function converts Apple Music search reqponse json to the standard Multi Music search result json
*/
function AM_to_MM_search(am_response){
  //am_response - apple music search response json
  const multi_music_obj = {};
  //This is an array of all the types that were returned in the search
  // ex songs, playlists, albums, etc
  var result_types = am_response.meta.results.order;
  var type_data, data_obj;
  for(var type in result_types){ //for every type of object in response
    var data = [];
    type_data = am_response.results[result_types[type]].data;//This is a list of objects corresponding to the type
    for(var data_index = 0; data_index < type_data.length; data_index++){
      data_obj = type_data[data_index];
      var url = data_obj.attributes.artwork.url.replace('{w}', 300).replace('{h}',300);
      //creates a lists of all the data objects
      data.push({id:data_obj.id, href:data_obj.href, artwork:url, title:data_obj.attributes.name, artist:data_obj.attributes.artistName});
    }
    multi_music_obj[result_types[type]] = {data};
  }
  return JSON.stringify(multi_music_obj);
}

/*
Converts the apple music json repsonse containing tracks of a specific playlist to the multi music equal
*/
function AM_to_MM_playlist_tracks(am_response){

}
/*
Converts the apple music json repsonse contianing attributes of specific playlist to the multi music equal
*/
function AM_to_MM_playlist_attributes(am_response){

}


router.get('/apple-music/catalog/search/:search_term', function(request, response){
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
            response.send(AM_to_MM_search(JSON.parse(data))); //Convert apple music json to multi music json
          });
    });
});


//Retrieve a user's playlists by id
//NOTE this only returns information about the playlist, not any tracks associated to it
router.get('/apple-music/library/playlists/:playlist_id', function(request, response){
    var playlist = request.params.playlist_id //ALl the spaces in the search must be replaced with '+'
    //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
    var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
    console.log(music_user_token);
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/me/library/playlists/${playlist}?include=relationships`,
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

//Get the tracks that are inside of a playlist
router.get('/apple-music/library/playlists/:playlist_id/relationships', function(request, response){
    var playlist = request.params.playlist_id //ALl the spaces in the search must be replaced with '+'
    //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
    var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
    console.log(music_user_token);
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/me/library/playlists/${playlist}/tracks`,
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

/*
Gets attributes of a playlists on apples catalog. NOT USER'S
Also includes tracks of in the playlist
User doesn't need to be signed into their apple music account
*/
router.get('/apple-music/catalog/playlists/:playlist_id', function(request, response){
  var playlist = request.params.playlist_id //ALl the spaces in the search must be replaced with '+'
  const options = {
    hostname: 'api.music.apple.com',
    path: `/v1/catalog/us/playlists/${playlist}`,
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

// /*
// Gets attributes of a playlists on apples catalog. NOT USER'S
// */
// router.get('/apple-music/catalog/playlists/:playlist_id/relationships', function(request, response){
//   var playlist = request.params.playlist_id //ALl the spaces in the search must be replaced with '+'
//   /* Apple API GET https://api.music.apple.com/v1/catalog/{storefront}/playlists/{id}/{relationship}*/
//   const options = {
//     hostname: 'api.music.apple.com',
//     path: `/v1/catalog/us/playlists/${playlist}/tracks`,
//     method: 'GET',
//     headers: {
//           'Accept': 'application/a-gzip, application/json',
//           'Authorization' : 'Bearer ' + token
//     }
//   }
//   https.get(options, function (res, body) {
//         let data = '';
//         console.log('statusCode:',res.statusCode); // Print the response status code if a response was received
//         res.setEncoding('utf8');
//         //Collect  all the response
//         res.on('data', (chunk) => {
//           data += chunk;
//         });
//         // The whole response has been received. send the result.
//         res.on('end', () => {
//           response.send(data);
//         });
//   });
// });

/*
Get search hints from the apple's search catalog
User doesn't need to be signed into their apple music account
*/
router.get('/apple-music/catalog/search/hints/:search_term', function(request, response){
    var search_term = request.params.search_term //ALl the spaces in the search must be replaced with '+'
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/catalog/us/search/hints?${search_term}`,
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
router.get('/apple-music/library/playlists', function(request, response){
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
router.get('/apple-music/library/albums', function(request, response){
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
router.get('/apple-music/library/songs', function(request, response){
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
router.get('/apple-music/library/artists', function(request, response){
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

//Add a new playlist to the users library
router.post('/apple-music/library/playlist', function(request, response){
  var post_obj = JSON.stringify(request.body); //Need to include bodyParser in server.js
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
    var data = '';
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. send the result.
    res.on('end', () => {
      response.send(data);
    });
  });

req.on('error', error => {
  console.error(error)
});

  req.write(post_obj);
  req.end();


});

//adds tracks to playlist
router.post('/apple-music/library/playlists/:playlist_id/tracks', function(request, response){
  var post_obj = JSON.stringify(request.body); //Need to include bodyParser in server.js
  var playlist_id = request.params.playlist_id;
    //var music_user_token = retrieveMusicUserToken(); //retrieve from user in db
    var music_user_token = fs.readFileSync('music_user_token_test.txt', 'utf8').trim(); //Replace with function to call db query
    const options = {
      hostname: 'api.music.apple.com',
      path: `/v1/me/library/playlists/${playlist_id}/tracks`,
      method: 'POST',
      headers: {
            'Music-User-Token': music_user_token,
            'Accept': 'application/a-gzip, application/json',
            'Authorization' : 'Bearer ' + token,
            'Content-Length': Buffer.byteLength(post_obj)
      }
    }
    const req = https.request(options, res => {
      var data = '';
      console.log(`statusCode: ${res.statusCode}`)

      res.on('data', (chunk) => {
        data += chunk;
      });
      // The whole response has been received. send the result.
      res.on('end', () => {
        response.send(data);
      });
    });

req.on('error', error => {
  console.error(error)
});

  req.write(post_obj);
  req.end();


});


module.exports = router;
