/**
 * check if song exists in database
 * @param {string} title the title of the song
 * @param {string} artist the songs artist
 * @param {string} album the title of the album the song is on
 * @param {string} explicit if the song is explicit or clean
 */
function dbHasSong(title, artist, album, explicit){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/db/hasSong/' + title + '/' + artist + '/' + album + '/' + explicit == "clean" ? false : true, true);
    xhttp.send(); // Gets the response
}

/**
 * get playlist from database
 * @param {string} playlistID the spotify or apple id of the playlist to get
 */
function dbGetPlaylist(playlistID){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/db/playlist/' + playlist, true);
    xhttp.send(); // Gets the response
}

/**
 * take username and password and checks db if user exists
 * @param {string} name the username of the user
 * @param {int} code the password of the user
 */
function dbGetUser(name, code){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/db/user/' + name + '/' + code, true);
    xhttp.send(); // Gets the response
}

/**
 * add spotify token to user record
 * @param {string} id the id of the user to be updated
 * @param {string} token the spotify token to be added to the user
 */
function dbUpdateSpotifyToken(id, token){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('POST', URL + '/db/user/spotify/' + id + '/' + token , true);
    xhttp.send(); // Gets the response
}
/**
 * update user record with apple token
 * @param {string} id the id of the user to be updated
 * @param {string} token the apple token to be added to the user record
 */
function dbUpdateAppleToken(id, token){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('POST', URL + '/db/user/apple/' + id + '/' + token, true);
    xhttp.send(); // Gets the response
}

/**
 * add a song to the database
 * @param {string} title the title of the song
 * @param {string} artist the songs artist
 * @param {string} album the songs album
 * @param {string} explicit if the song is explicit or clean
 * @param {string} spotifyID the spotifyID of the song
 * @param {string} appleID the appleIF of the song
 */
function dbAddSong(title, artist, album, explicit, spotifyID, appleID){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('PUT', URL + '/db/song/' + title + '/' + artist + '/' + album + '/' + explicit == "clean" ? false : true, true + '/' + spotifyID + '/' + appleID, true);
    xhttp.send(); // Gets the response
}

/**
 * add playlist to database
 * @param {string} title the title of the playlist
 * @param {string} user the id of the author of the playlist
 * @param {string} spotifyID the spotifyID of the playlist 
 * @param {string} appleID the appleID of the playlist 
 */
function dbAddPlaylist(title, user, spotifyID = null, appleID = null){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('PUT', URL + '.db/playlist/' + title + '/' + user + '/' + spotifyID + '/' + appleId, true);
    xhttp.send(); // Gets the response
}

/**
 * add the song to the playlist
 * @param {string} playlistID the id of the playlist the song will be added to
 * @param {string} songID the id of the song to add
 */
function dbAddSongToPlaylist(playlistID, songID){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('PUT', URL + '/db/playlist/song/' + playlistID + '/' + songID, true);
    xhttp.send(); // Gets the response
}

/**
 * add new user to the database
 * @param {string} name the username of the user
 * @param {int} code the password of the user
 */
function dbAddUser(name, code){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('PUT', URL + '/db/user/' + name + '/' + code, true);
    xhttp.send(); // Gets the response
}

/**
 * get the tokens stored on the db for the user
 * @param {string} id the id of the user to get tokens from db for
 */
function dbGetUserTokens(id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/db/userToken/' + id, true);
    xhttp.send(); // Gets the response
}