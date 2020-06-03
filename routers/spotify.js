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
var serverToken = '';
var stateKey = 'spotify_auth_state';
const database = require("../Public/databaseIndex.js");
setServerToken();

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



let timerId = setInterval(() => setServerToken(), 60 * 60 * 1000);

function setServerToken(){
  var options = { //request options for getting sever token
    url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(spotifyApi.getClientId() + ':' + spotifyApi.getClientSecret()).toString('base64'))
      },
      form: {grant_type: 'client_credentials'},
      json: true
    };
  request.post(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // sever token to access the Spotify Web API without logging in.
      serverToken = body.access_token;
      console.log(serverToken);
    } else {
      console.log("ERROR getting server token");
    }
  });
}

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
    console.log("stateB");
    console.log(state);
    responce.redirect(spotifyApi.createAuthorizeURL(scopes, state, {secure: false}));
  });

router.get('/spotify/callback', function(req, responce) {
      // request refresh and access tokens
      // after checking the state parameter
      const { code, state } = req.query;
      // console.log("code");
      // console.log(code);
      // console.log("state");
      // console.log(state);
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
          refreshToken = refresh_token;
          //id = getCookie(); //get userid from cookie
          //dbUpdateSpotifyToken(id, access_token);
          // console.log(accessToken);
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
router.get('/spotify/user/:token', function(req, response){
  //dbGetUserTokens(req.params.id); //MAKE ASYNC
  options = { //set request options
    uri: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + req.params.token },
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
router.get('/spotify/playlists/:token', function(req, responce){
  if(req.params.token == null){
    console.log("error invalid token");
  } else {
    options = { //set request options
        uri: 'https://api.spotify.com/v1/me/playlists',
        headers: { 'Authorization': 'Bearer ' + req.params.token },
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
        // console.log(responce);

    });
  }
});


//Get the tracks of a playlist specified by the playlistid

router.get('/spotify/playlist/tracks/:playlistid', function(req, response){
  // if(req.params.token == null){
  //   console.log("error invalid token");
  // } else {
    options = { // set request options
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid,
        headers: { 'Authorization': 'Bearer ' + serverToken},
        json: true
      };
      // if (accessToken == ""){ // use sever token if user is not logged in
      //   options.headers = { 'Authorization': 'Bearer ' + serverToken }
      // }
      request.get(options, function(error, res, body) {
        if (error){ // if request fails
          console.log("ERROR getting user playlist")
        } else {
          //console.log(body);
          retval = { tracks: []};

          for(i = 0; i < body.tracks.limit; i++){
            if(body.tracks.items[i] != null && body.tracks.items[i].track != null){
              retval.tracks.push({
                title: body.tracks.items[i].track.name,
                artist: body.tracks.items[i].track.artists[0].name,
                id: body.tracks.items[i].track.id,
                artwork: body.tracks.items[i].track.album.images.length != 0 ?
                           body.tracks.items[i].track.album.images.length == 1 ?
                           body.tracks.items[i].track.album.images[1].url :
                           body.tracks.items[i].track.album.images[0].url : null,
                href: body.tracks.items[i].track.href,
                contentRating: body.tracks.items[i].track.explicit ? "explicit" : "clean",
                album: body.tracks.items[i].track.album.name
              });
            }
          }
          //response.send(body);
          response.send(retval);
        }
      });
    // }
});


//Get a playlist specified by the playlistid
router.get('/spotify/playlist/:playlistid', function(req, response){
  // if(req.params.token == null){
  //   console.log("error invalid token");
  // } else {
  options = { // set request options
      uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid,
      headers: { 'Authorization': 'Bearer ' + serverToken },
      json: true
    };
    // if (accessToken == ""){ // use sever token if user is not logged in
    //   options.headers = { 'Authorization': 'Bearer ' + serverToken }
    // }
    request.get(options, function(error, res, body) {
      if (error){ // if request fails
        console.log("ERROR getting user playlist")
      } else {
        retval = { playlists: []}
        retval.playlists.push({
          title: body.name,
          description: body.description,
          href: body.href,
          id: body.id,
          artwork: body.images.length != 0 ?
            body.images.length == 1 ?
            body.images[0].url :
            body.images[1].url : null
          });
      }
        response.send(retval);
        //response.send(body);
    });
  // }
});

//Delete the specified track from the specified playlist
router.delete('/spotify/playlist/delete/:playlistid/:trackURI/:token', function(req, response){
  if(req.params.token == null){
    console.log("error invalid token");
  } else {
    options = { // set request options
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks',
        headers: { 'Authorization': 'Bearer ' + req.params.token },
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
    }
});

//Add the specified track to the specifed playlist
router.post('/spotify/playlist/add/:playlistid/:trackURI/:token', function(req, response){
  if(req.params.token == null){
    console.log("error invalid token");
  } else {
    options = { // set request optinos
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks?uris=' + req.params.trackURI,
        headers: { 'Authorization': 'Bearer ' + req.params.token },
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
    }
});

//Changes the name of the playlist to the specifed name
router.put('/spotify/playlist/details/:playlistid/:name/:token', function(req, response){
  if(req.params.token == null){
    console.log("error invalid token");
  } else {
    options = { // set request options
        uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid,
        headers: { 'Authorization': 'Bearer ' + req.params.token },
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
    }
});

//Create a new empty spotify playlist
router.post('/spotify/playlist/create/:userID/:name/:public/:description/:collaborative/:token', function(req, response){
  if(req.params.token == null){
    console.log("error invalid token");
  } else {
    options = {
        uri: 'https://api.spotify.com/v1/users/' + req.params.userID + '/playlists',
        headers: { 'Authorization': 'Bearer ' + req.params.token },
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
  }
});

// reorder the songs in the specifed playlist
// move first length songs at start to index
router.put('/spotify/playlist/reorder/:playlistid/:start/:index/:length/:token', function(req, response){
  if(req.params.token == null){
    console.log("error invalid token");
  } else {
  options = { // set request options
    uri: 'https://api.spotify.com/v1/playlists/' + req.params.playlistid + '/tracks',
    headers: { 'Authorization': 'Bearer ' + req.params.token },
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
}
});

// search spotify for tracks containing the keyword
router.get('/spotify/search/:keyword', function(req, response){
  // if(req.params.token == null){
  //   console.log("error invalid token");
  // } else {
  var search_term  = req.params.keyword.split(' ').join('+'); // replace spaces in search term
  options = { // set request options
    uri: 'https://api.spotify.com/v1/search?' + search_term,
    headers: { 'Authorization': 'Bearer ' + serverToken},
    json: true
  };
  // if (accessToken == ""){ // use sever token if user is not logged in
  //   options.headers = { 'Authorization': 'Bearer ' + serverToken }
  // }
    request.get(options, function(error, res, body){
      if (error){
        console.log("ERROR searching Spotify " + error);
      } else {
        //console.log(body);
        retval = {} //json to but returned to multimusic

          if(body != null){
            if(body.hasOwnProperty("tracks")){
            retval.songs = {data:[]};
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
            retval.albums = {data:[]};
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
            retval.playlists = {data:[]};
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
          }

        //response.send(body);
        response.send(retval);
    }
  });
// }
});

module.exports = router;
