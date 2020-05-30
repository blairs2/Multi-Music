var express = require('express');       // imports the express library
var router = express.Router();          // Router object for routes
var mysql = require('mysql'); 

var con;

con = mysql.createConnection({
        host: "",
        user: "",
        password: "",
        database: ""
    });


con.connect(function ConnectionHandler(err){
    if (err){
        console.log('Unable to connect to MySQL')
    } else {
        console.log("Connection to MySQL successfull");
    }
});   

exports.get = function GetHandler(){
    return con;
}

//checks db for song if found returns appleID and spotifyID else returns false
router.get('/db/hasSong/:ID', function(req, response){
    con.query( "SELECT spotify_Song_ID, apple_Song_ID, song_ID " +
                "FROM Song " +
                "WHERE spotify_Song_ID = \"" + req.params.ID + 
                "\" OR apple_Song_ID = \"" + req.params.ID +  "\";", function (err, result, fields) {
        if (err) {
            console.log("ERROR in db hasSong", err);
        }  else {
            if (result.length != 0){ // if record found
                response.send(result);
            } else {
                response.send(false);
            } 
        }
      });
});

//get playlist from db using spotify/apple or playlist id
router.get('/db/playlist/:playlistID', function(req, response){
    console.log("router");
    con.query( "SELECT p.playlist_Name, p.spotify_Playlist_ID, p.apple_Playlist_ID, p.playlist_ID, " + 
                "s.title, s.spotify_Song_ID, s.apple_Song_ID, s.artist, s.explicit, s.album " + 
                "FROM Playlist p " +
                "JOIN Song_Playlist sXp on p.playlist_ID = sXp.playlist_ID " +
                "JOIN Song s ON s.song_ID = sXp.song_ID " +
                "WHERE p.spotify_Playlist_ID = \"" + req.params.playlistID + 
                "\" OR p.apple_Playlist_ID = \"" + req.params.playlistID +
                "\" OR p.playlist_ID = \"" + req.params.playlistID + "\";", function (err, result, fields) {
        if (err) {
            console.log("ERROR in db Playlist", err);
        }  else {
            if (result.length != 0){ // if record found
                response.send(result);
            } else {
                response.send(false);
            } 
        }
      });
});

//get user id from username and password
router.get('/db/user/:name/:code', function(req, response){
    con.query( "SELECT username, user_ID " + 
                "FROM User " + 
                "WHERE username = \"" + req.params.name + "\" AND password = " + req.params.code + ";", function (err, result, fields) {
        if (err) {
            console.log("ERROR in db user", err);
        }  else {
            if (result.length != 0){ // if record found
                response.send(result);
            } else {
                response.send(false);
            }           
        }
    });
});

//update users spotify token
router.post('/db/user/spotify/:id/:token', function(req, response){
    con.query( "UPDATE User " +
                "SET spotify_Token = \"" + req.params.token + 
                "\" WHERE user_ID = \"" + req.params.id + "\";", function (err, result, fields) {
        if (err) {
            console.log("ERROR in db spotify token", err);
        }  else {
            response.send(result);      
        }
    });
});

//update users apple token
router.post('/db/user/apple/:id/:token', function(req, response){
    console.log("router");
    con.query( "UPDATE User " +
                "SET apple_Token = \"" + req.params.token + 
                "\" WHERE user_ID = \"" + req.params.id + "\";", function (err, result, fields) {
        if (err) {
            console.log("ERROR in db apple token", err);
        }  else {
            response.send(result);      
        }
    });
});

//add song to db
router.put('/db/song/:title/:artist/:album/:explicit/:spotifyID/:appleID', function(req, response){
    console.log("router add Song");
    con.query( "INSERT INTO Song(title, artist, album, explicit, spotify_Song_ID, apple_Song_ID) " +
                "VALUES (\"" + req.params.title + "\", \"" +
                        req.params.artist + "\", \"" +
                        req.params.album + "\", \"" +
                        req.params.explicit + "\", \"" +
                        req.params.spotifyID + "\", \"" +
                        req.params.appleID + "\");", function (err, result, fields) {
        if (err) {
            console.log("ERROR adding song to db", err);
        }  else {
            response.send(result);      
        }
    });
});

//add playlist to db
router.put('/db/playlist/:title/:userID/:spotifyID/:appleID', function(req, response){
    console.log("router");
    con.query( "INSERT INTO Playlist(playlist_Name, user_ID, spotify_Playlist_ID, apple_Playlist_ID) " +
                "VALUES (\"" + req.params.title + "\", " +
                        req.params.userID + ", \"" +
                        req.params.spotifyID + "\", \"" +
                        req.params.appleID + "\");", function (err, result, fields) {
        if (err) {
            console.log("ERROR adding playlist to db", err);
        }  else {
            response.send(result);     
        }
    });
});

//add song to playlist in db
router.put('/db/playlist/song/:playlistID/:songID', function(req, response){
    console.log("router");
    con.query( "INSERT INTO Song_Playlist(song_ID, playlist_ID) " +
                "VALUES (" + req.params.songID + ", " +
                        req.params.playlistID + ");", function (err, result, fields) {
        if (err) {
            console.log("ERROR adding song to playlist in db", err);
        }  else {
            response.send(result);      
        }
    });
});

//add user to db
router.put('/db/user/:name/:code', function(req, response){
    con.query( "INSERT INTO User(username, password) " +
                "VALUES (\"" + req.params.name + "\", " +
                        req.params.code + ");", function (err, result, fields) {
        if (err) {
            console.log("ERROR adding song to playlist in db", err);
        }  else {
            response.send(result);      
        }
    });
});

//get tokens from user id
router.get('/db/userToken/:id', function(req, response){
    console.log("router");
    con.query( "SELECT spotify_Token, apple_Token " + 
                "FROM User " + 
                "WHERE user_ID = \"" + req.params.id + "\";", function (err, result, fields) {
        if (err) {
            console.log("ERROR in db userToken", err);
        }  else {
            if (result.length != 0){ // if record found
                response.send(result);
            } else {
                response.send(false);
            }           
        }
    });
});

module.exports = router;
