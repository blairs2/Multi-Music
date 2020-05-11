var express = require('express');       // imports the express library
var router = express.Router();          // Router object for routes
const request = require('request'); // "Request" library
const Spotify = require('spotify-web-api-node');
//const cors = require('cors');
const spotifyApi = new Spotify({
  clientId: '832b12a20fb943ed9ef4b49ceca24b65', // Spotify client id
  clientSecret: 'CLIENT-SECRET-HERE', // Spotify secret
  redirectUri: 'http://localhost:8080/callback' // Spotify redirect uri
});
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

var accessToken = '';
var refreshToken = '';
var stateKey = 'spotify_auth_state';

 // your application requests authorization
 var scopes = [
  'user-read-playback-state', //used to get currently playing track
  'user-modify-playback-state', //used to pause shuffle skip users current song and add songs to queue 
  'playlist-read-collaborative', //used to get users collaborative playlists
  'playlist-read-private', //used to get users private playlists
  'streaming', //used for web playback
  'playlist-modify-private', //used to modify private playlists
  'playlist-modify-public', //used to mofify public playlists
  'user-read-email', //used to get users email address *we may not need this?
  'user-read-private']; //used to read the users account details to so if they have premium

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get('/login', function(req, res) {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    res.redirect(spotifyApi.createAuthorizeURL(scopes, state, {secure: false}));
  });
  
router.get('/callback', function(req, res) {
      // request refresh and access tokens
      // after checking the state parameter
      const { code, state } = req.query;
      const storedState = req.cookies ? req.cookies[stateKey] : null;
      if (state === null || state !== storedState) { // if the state is vailid
        res.redirect('/#' +
          querystring.stringify({
            error: 'state_mismatch'
          }));
      } else {
        spotifyApi.authorizationCodeGrant(code).then(data => {
          const { expires_in, access_token, refresh_token } = data.body;
          accessToken = access_token;
          refreshToken = refresh_token;
          res.redirect(`/#/user/${access_token}/${refresh_token}`);
        }).catch(err => {
          res.redirect('/#/error/invalid token');
        });
      };
});
//Get user data for the current user
router.get('/user', function(req, res){
  options = { //set request options
    uri: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };
  request.get(options, function(error, response, body) {
    if (error){ // if request fails
      console.log("ERROR getting user data")
    } else {
      console.log(body);
    }
  });
})


//Get a list of all the user playlists    
router.get('/playlists', function(req, res){
    options = { //set request options
        uri: 'https://api.spotify.com/v1/me/playlists',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };
    request.get(options, function(error, res, body) {
        if (error) { //if request fails
            console.log("ERROR getting list of user playlist" + error);
        } else {
            console.log(body);
            for(var i = 0; i < body.items.length; i++) { // get track lists for all playlists
                var obj = body.items[i].href; 
                options = { // set request options
                    uri: obj,
                    headers: { 'Authorization': 'Bearer ' + accessToken },
                    json: true
                };
                request.get(options, function(error, res, body){
                    if (error){ // if request fails
                        console.log("ERROR retreving track lists in getUserPlaylist");
                    } else{ 
                        console.log(body);
                    }
                });
            }
        }
    });
});

//Get a playlist specified by the playlistid 
router.get('/playlist/:playlistid', function(req, res){
    options = { // set request options
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };
      request.get(options, function(error, response, body) {
        if (error){ // if request fails
          console.log("ERROR getting user playlist")
        } else {
          console.log(body);
          var obj = body.tracks.href; 
          options = { // set request options
            uri: obj,
            headers: { 'Authorization': 'Bearer ' + accessToken },
            json: true
          };
          request.get(options, function(error, res, body){
            if (error){ // if request fails
              console.log("ERROR retreving track lists in getUserPlaylist");
            } else{ 
              console.log(body);
            }
          });
        }
      });
});

//Delete the specified track from the specified playlist
router.get('/playlist/delete/:playlistid/:trackURI', function(req, res){
    options = { // set request options
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        body: { tracks: [{uri: req.params.trackURI}]},
        json: true
      };
      request.del(options, function(error, res, body){
        if (error){ // if request fails
          console.log("ERROR deleteing track from playlist" + error);
        } else {
          console.log(body);
        }
      });
});

//Add the specified track to the specifed playlist
router.get('/playlist/add/:playlistid/:trackURI', function(req, res){
    options = { // set request optinos
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks?uris=' + req.params.trackURI,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };
      request.post(options, function(error, res, body){
        if (error){ // if request fails
          console.log("ERROR adding track to playlist " + error)
        } else{
          console.log(body);
        }
      });
});

//Changes the name of the playlist to the specifed name
router.get('/playlist/details/:playlistid/:name/', function(req, res){
    options = { // set request options
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        body: {name: req.params.name},
        json: true
    };
      request.put(options, function(error, res, body){
        if (error){ // if request fails
          console.log("ERROR changing playlist details " + error);
        } else {
          console.log(body);
        }
      });
});
    
//Create a new empty spotify playlist
router.get('/playlist/create/:userID/:name/:public/:description/:collaborative', function(req, respresonce){
    options = {
        uri: 'https://api.spotify.com/v1/users/' + req.params.userID + '/playlists',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        body: {
            name: req.params.name, 
            public: req.params.public, 
            description: req.params.description, 
            collaborative: req.params.collaborative},
        json: true
      };
    request.post(options, function(error, res, body){
      if (error){ // if request fails
        console.log("ERROR creating playlist" + error);
      } else {
        console.log(body);
      }
    })
  });
  

router.get('/playlist/reorder/:playlistid/:start/:index/:length', function(req, resresonce){
  options = { // set request options
    uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    body: {
      range_start: req.params.start, 
      range_length: req.params.length, 
      insert_before: req.params.index},
    json: true
  };
  request.put(options, function(error, res, body){
    if (error) { // if request fails
      console.log("ERROR reordering playlist " + error);
    } else {
      console.log(body);
    }
  });
});

router.get('/search/spotify/:keyword', function(req, res){
  var search_term  = req.params.keyword.split(' ').join('+'); // replace spaces in search term
    options = { // set request options
      uri: 'https://api.spotify.com/v1/search?q=' + search_term + '&type=track',
      headers: { 'Authorization': 'Bearer ' + accessToken },
      json: true
    };
    request.get(options, function(error, res, body){
      if (error){
        console.log("ERROR searching Spotify " + error);
      } else {
        console.log(body);
      }
    });
});

module.exports = router;