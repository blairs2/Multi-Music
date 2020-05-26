var express = require('express');       // imports the express library
var router = express.Router();          // Router object for routes
const request = require('request'); // "Request" library
const Spotify = require('spotify-web-api-node');
//const cors = require('cors');
const spotifyApi = new Spotify({
  clientId: '832b12a20fb943ed9ef4b49ceca24b65', // Spotify client id
  clientSecret: '191f46cbc6e04274bff4214a782e13b2', // Spotify secret
  redirectUri: 'http://localhost:8080/spotify/callback' // Spotify redirect uri
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

router.get('/spotify/login', function(req, responce) {
    const state = generateRandomString(16);
    responce.cookie(stateKey, state);
    responce.redirect(spotifyApi.createAuthorizeURL(scopes, state, {secure: false}));
  });
  
router.get('/spotify/callback', function(req, responce) {
      // request refresh and access tokens
      // after checking the state parameter
      const { code, state } = req.query;
      const storedState = req.cookies ? req.cookies[stateKey] : null;
      if (state === null || state !== storedState) { // if the state is vailid
        responce.redirect('/#' +
          querystring.stringify({
            error: 'state_mismatch'
          }));
      } else {
        spotifyApi.authorizationCodeGrant(code).then(data => {
          const { expires_in, access_token, refresh_token } = data.body;
          accessToken = access_token;
          console.log(accessToken);
          refreshToken = refresh_token;
          responce.redirect(`/#/user/${access_token}/${refresh_token}`);
        }).catch(err => {
          responce.redirect('/#/error/invalid token');
        });
      };
      
      
});

router.get('/spotify/refresh', function(req, responce) {
  spotifyApi.refreshAccessToken().then(
    function(data) {
      console.log('The access token has been refreshed!');
  
      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
      console.log('Could not refresh access token', err);
    }
  );
})

//Get user data for the current user
router.get('/spotify/user', function(req, response){
  options = { //set request options
    uri: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true
  };
  request.get(options, function(error, res, body) {
    if (error){ // if request fails
      console.log("ERROR getting user data")
    } else {
      //console.log(body);
      response.send(body);
    }
  });
})

//Get a list of all the user playlists    
router.get('/spotify/playlists', function(req, responce){
    options = { //set request options
        uri: 'https://api.spotify.com/v1/me/playlists',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };
    request.get(options, function(error, res, body) {
        if (error) { //if request fails
            console.log("ERROR getting list of user playlist" + error);
        } else {
            //console.log(body);
            retval = { playlists: []}
            for(i = 0; i < body.items.length; i++){
                retval.playlists.push({
                  name: body.items[i].name,
                  description: body.items[i].description,
                  href: body.items[i].href,
                  id: body.items[i].id,
                  artwork: body.items[i].images.length != 0 ?
                           body.items[i].images.length == 1 ? 
                           body.items[i].images[0].url : 
                           body.items[i].images[1].url : null 
                });
            }
            responce.send(retval);
        }
        console.log(responce);

    });
});

//Get a playlist specified by the playlistid 
router.get('/spotify/playlist/:playlistid', function(req, response){
    options = { // set request options
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };
      request.get(options, function(error, res, body) {
        if (error){ // if request fails
          console.log("ERROR getting user playlist")
        } else {
          //console.log(body);
          retval = { tracks: []};
          
          for(i = 0; i < body.tracks.limit; i++){
            if(body.tracks.items[i] != null){
              retval.tracks.push({
                title: body.tracks.items[i].track.name,
                artist: body.tracks.items[i].track.artists[0].name,
                id: body.tracks.items[i].track.uri,
                artwork: body.tracks.items[i].track.album.images.length != 0 ?
                           body.tracks.items[i].track.album.images.length == 1 ?
                           body.tracks.items[i].track.album.images[1].url :
                           body.tracks.items[i].track.album.images[0].url : null,
                href: body.tracks.items[i].track.href
              });
            }
          }

          response.send(retval);
        }
      });
});

//Delete the specified track from the specified playlist
router.delete('/spotify/playlist/delete/:playlistid/:trackURI', function(req, response){
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
          //console.log(body);
          response.send(body);
        }
      });
});

//Add the specified track to the specifed playlist
router.post('/spotify/playlist/add/:playlistid/:trackURI', function(req, response){
    options = { // set request optinos
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks?uris=' + req.params.trackURI,
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };
      request.post(options, function(error, res, body){
        if (error){ // if request fails
          console.log("ERROR adding track to playlist " + error)
        } else{
          //console.log(body);
          response.send(body);
        }
      });
});

//Changes the name of the playlist to the specifed name
router.put('/spotify/playlist/details/:playlistid/:name', function(req, response){
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
          //console.log(body);
          response.send(body);
        }
      });
});

//Create a new empty spotify playlist
router.post('/spotify/playlist/create/:userID/:name/:public/:description/:collaborative', function(req, response){
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
        //console.log(body);
        response.send(body);
      }
    })
  });

// reorder the songs in the specifed playlist
// move first length songs at start to index
router.put('/spotify/playlist/reorder/:playlistid/:start/:index/:length', function(req, response){
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
      //console.log(body);
      response.send(body);
    }
  });
});

// search spotify for tracks containing the keyword
router.get('/spotify/search/:keyword', function(req, response){
  var search_term  = req.params.keyword.split(' ').join('+'); // replace spaces in search term
    options = { // set request options
      uri: 'https://api.spotify.com/v1/search?' + search_term,
      headers: { 'Authorization': 'Bearer ' + accessToken },
      json: true
    };
    request.get(options, function(error, res, body){
      if (error){
        console.log("ERROR searching Spotify " + error);
      } else {
        //console.log(body);
        retval = { //json to but returned to multimusic
          songs: {
            data: []
          },
          albums: {
            data: []
          },
          playlists: {
            data: []
          },
        }
        if(body.hasOwnProperty("tracks")){
          for (i = 0; i < body.tracks.limit; i++){
            if(body.tracks.items[i] != null){
              retval.songs.data.push({ //append songs to retval.songs
                title: body.tracks.items[i].name,
                artist: body.tracks.items[i].artists[0].name,
                artwork: body.tracks.items[i].album.images[1].url,
                id: body.tracks.items[i].id,
                href: body.tracks.items[i].href});
              }
            }
        }
        if(body.hasOwnProperty("albums")){
          for (i = 0; i < body.albums.limit; i++){
            if(body.albums.items[i] != null){
              retval.albums.data.push({ //append albums to retval.albums
                title: body.albums.items[i].name,
                artist: body.albums.items[i].artists[0].name,
                artwork: body.albums.items[i].images[1].url,
                id: body.albums.items[i].id,
                href: body.albums.items[i].href});
              }
            }
          }
        if(body.hasOwnProperty("playlists")){
          for (i = 0; i < body.playlists.limit; i++){
            if(body.playlists.items[i] != null){
                retval.playlists.data.push({ //append playlists to retval.playlists
                  title: body.playlists.items[i].name,
                  artwork: body.playlists.items[i].images.length != 0 ?
                           body.playlists.items[i].length == 1 ?
                           body.playlists.items[i].images[1].url :
                           body.playlists.items[i].images[0].url : null,
                  id: body.playlists.items[i].id,
                  href: body.playlists.items[i].href
                });
              }
            }
          }

        //response.send(body);
        response.send(retval);
      }
    });
});

module.exports = router;
