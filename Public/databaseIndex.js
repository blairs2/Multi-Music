
function hashCode(str){
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		var character = str.charCodeAt(i);
		hash = ((hash<<5)-hash)+character;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
/**
 * check if song exists in database
 * @param {string} title the title of the song
 * @param {string} artist the songs artist
 * @param {string} album the title of the album the song is on
 * @param {string} explicit if the song is explicit or clean
 */
function dbHasSong(ID){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };

    xhttp.open('GET', 'http://' + URL + '/db/hasSong/' + ID, true);
    xhttp.send(); // Gets the response
}

/**
 * get playlist from database
 * @param {string} playlistID the spotify or apple id of the playlist to get
 */
 async function dbGetPlaylist(playlistID){
    var xhttp = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
      xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4) { //Upon getting a response
        if(this.status == 200){
          resolve(this.responseText);
        } else {
          reject("Error");
      }
     }
    };
    xhttp.open('GET', 'http://' + URL + '/db/playlist/' + playlistID, true);
    xhttp.send(); // Gets the response
   });
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
    xhttp.open('GET', 'http://' + URL + '/db/user/' + name + '/' + hashCode(code), true);
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
    xhttp.open('POST', 'http://' + URL + '/db/user/spotify/' + id + '/' + token , true);
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
    xhttp.open('POST', 'http://' + URL + '/db/user/apple/' + id + '/' + token, true);
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
    xhttp.open('PUT', 'http://' + URL + '/db/song/' + title + '/' + artist + '/' + album + '/' + explicit + '/' + spotifyID + '/' + appleID, true);
    xhttp.send(); // Gets the response
}

/**
 * add playlist to database
 * @param {string} title the title of the playlist
 * @param {string} user the id of the author of the playlist
 * @param {string} spotifyID the spotifyID of the playlist
 * @param {string} appleID the appleID of the playlist
 */
async function dbAddPlaylist(title, user, spotifyID = null, appleID = null){
	 var xhttp = new XMLHttpRequest();
	 return new Promise(function(resolve, reject) {
		 xhttp.onreadystatechange = function ReceivedCallback() {
		 if (this.readyState == 4) { //Upon getting a response
			 if(this.status == 200){
				 resolve(this.responseText);
			 } else {
				 reject("Error");
		 }
		}
	 };
	 xhttp.open('PUT', 'http://' + URL + '/db/playlist/' + title + '/' + user + '/' + spotifyID + '/' + appleID, true);
	 xhttp.send(); // Gets the response
	});
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
    xhttp.open('PUT', 'http://' + URL + '/db/playlist/song/' + playlistID + '/' + songID, true);
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
    xhttp.open('PUT', "http://" + URL + '/db/user/' + name + '/' + hashCode(code), true);
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
    xhttp.open('GET', 'http://' + URL + '/db/userToken/' + id, true);
    xhttp.send(); // Gets the response
}

/**
 * delete all tracks from the playlist in db
 * @param {string} id the playlist db id of playlist to delete tracks from
 */
function dbDeleteTracks(id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('DELETE', 'http://' + URL + '/db/delete/tracks/' + id, true);
    xhttp.send(); // Gets the response
}
