//import cookieParser from "cookie-parser";

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
 */
async function dbHasSong(ID){
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
		xhttp.open('GET', 'http://' + url + '/db/hasSong/' + ID, true);
		xhttp.send(); // Gets the response
	});
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
    xhttp.open('GET', 'http://' + url + '/db/playlist/' + playlistID, true);
    xhttp.send(); // Gets the response
   });
 }

async function login(){
		return new Promise(async function(resolve, reject){
			var name = document.forms["login-form"]["email"].value;
			var pass = document.forms["login-form"]["password"].value;
			await dbGetUser(name, pass).then((value) => {
						console.log(value);
						if (value == "false"){
								reject(false);
						} else {
								resolve(JSON.parse(value)[0].user_ID);
						}
				});
		});
	}

async function RegisterUser(){
    var name = document.forms["register"]["userName"].value;
    var pass = document.forms["register"]["password"].value;
    var passC = document.forms["register"]["password_confirm"].value;
    if (pass == passC){
      await dbAddUser(name, pass).then(insert =>{
					if(insert!= 'false'){ //insertedId is the id of the recently added user
						setCookie(JSON.parse(insert).insertId, "userID");
						setTimeout(function() {window.location = 'http://' + url + '/index.html' });
					} else {
						alert("Invalid credentials");
					}

        });
    } else {
        alert("Passwords do not match please try again");
    }
}



/**
 * take username and password and checks db if user exists
 * @param {string} name the username of the user
 * @param {int} code the password of the user
 */
async function dbGetUser(name, code){
    var xhttp = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
      xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4) { //Upon getting a response
	      console.log(this.status);
        if(this.status == 200){
          resolve(this.responseText);
        } else {
        reject("Error Here");
      }
     }
    };
    xhttp.open('GET', 'http://' + url + '/db/user/' + name + '/' + hashCode(code), true);
    xhttp.send(); // Gets the response
   });
  }

/**
 * add spotify token to user record
 * @param {string} id the id of the user to be updated
 * @param {string} token the spotify token to be added to the user
 */

async function dbUpdateSpotifyToken(id, token){
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
    xhttp.open('POST', 'http://' + url + '/db/user/spotify/' + id + '/' + token , true);
    xhttp.send(); // Gets the response
   });
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
    xhttp.open('POST', 'http://' + url + '/db/user/apple/' + id + '/' + token, true);
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
async function dbAddSong(title, artist, spotifyID, appleID){
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
		xhttp.open('PUT', 'http://' + url + '/db/song/' + title + '/' + artist + '/' + spotifyID + '/' + appleID, true);
		xhttp.send(); // Gets the response
	});
}

/**
i * add playlist to database
 * @param {string} title the title of the playlist
 * @param {string} user the id of the author of the playlist
 * @param {string} spotifyID the spotifyID of the playlist
 * @param {string} appleID the appleID of the playlist
 */
async function dbAddPlaylist(title, user, spotifyID = null, appleID = null, description= null){
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
	 xhttp.open('PUT', 'http://' + url + '/db/playlist/' + title + '/' + user + '/' + spotifyID + '/' + appleID , true);
	 xhttp.setRequestHeader("Content-Type", "application/json");
	 xhttp.send(JSON.stringify(description)); // Gets the response
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
    xhttp.open('PUT', 'http://' + url + '/db/playlist/song/' + playlistID + '/' + songID, true);
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
    xhttp.open('PUT', "http://" + url + '/db/user/' + name + '/' + hashCode(code), true);
    xhttp.send(); // Gets the response
}

/**
 * get the tokens stored on the db for the user
 * @param {string} id the id of the user to get tokens from db for
 */
async function dbGetUserTokens(id){
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
    xhttp.open('GET', 'http://' + url + '/db/userToken/' + id, true);
    xhttp.send(); // Gets the response
   });
  }

/**
 * delete all tracks from the playlist in db
 * @param {string} id the playlist db id of playlist to delete tracks from
 */
async function dbDeleteTracks(id){
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
	xhttp.open('DELETE', 'http://' + url + '/db/delete/tracks/' + id, true);
	xhttp.send(); // Gets the response
	});
}

async function dbPlaylistExists(playlistID){
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
		xhttp.open('GET', 'http://' + url + '/db/playlist/exists/' + playlistID, true);
		xhttp.send(); // Gets the response
	});
}
