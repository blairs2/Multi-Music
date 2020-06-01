const url = window.location.host;
/**
 * Redirects to the spotify login for user to authorize our program
 */
function spotifyLogin(){
    console.log("CLICK");
    location.href = "http://"+ url +"/spotify/login";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:    }
        console.log(xhttp.responseText);
    }
    xhttp.open("GET", "http://"+ url +"/spotify/login", true);
    xhttp.send();
    }
}

/**
 * Get the user data for the currently logged in user
 */
function spotifyGetUser(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    id = getCookie(); //get user_ID from cookie
    await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/user/' + x[0].spotifyToken , true);
        xhttp.send(); // Gets the response
    });
}

/**
 * Get a list of the the user playlists and all the tracks in each playlist
 */
async function spotifyGetUserPlaylists(){
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
    id = getCookie(); //get user_ID from cookie
    await dbGetUserTokens(id).then((value) =>{
         var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlists/' + x[0].spotifyToken , true);
        xhttp.send(); // Gets the response
        });
    });
}


/**
 * Get the tracks from the Spotify playlist specifed by the playlistid
 * @param {string} playlistid the id of the playlist to get
 */
async function spotifyGetPlaylistTracks(playlistid){
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
   id = getCookie(); //get user_ID from cookie
   await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlist/tracks/' + playlistid + "/" + x[0].spotifyToken , true);
        xhttp.send(); // Gets the response
      });
   
  });
}

/**
 * Get the tracks from the Spotify playlist specifed by the playlistid
 * @param {string} playlistid the id of the playlist to get
 */
async function spotifyGetPlaylistAttributes(playlistid){
  var xhttp = new XMLHttpRequest();
  return new Promise(function(resolve, reject) {
    xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4) { //Upon getting a response
      if(this.status == 200){
        // document.getElementById("generated-content").innerHTML += displaySearch(JSON.parse(this.responseText), "Apple Music");
        resolve(this.responseText);
      } else {
      reject("Error");
    }
   }
  };
  id = getCookie(); //get user_ID from cookie
  await dbGetUserTokens(id).then((value) =>{
       var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlist/' + playlistid + "/" + x[0].spotifyToken, true);
        xhttp.send(); // Gets the response
    });
  });
}

/**
 * Deletes the track from the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited
 * @param {sting} trackURI URI of the track to be deleted
 */
function spotifyDeleteTrackFromPlaylist(playlistid, trackURI){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    id = getCookie(); //get user_ID from cookie
    await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlist/delete/' + playlistid + '/' + trackURI + "/" + x[0].spotifyToken, true);
        xhttp.send(); // Gets the response
    });
}

/**
 * Add the track to the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited
 * @param {sting} trackURI URI of the track to be added
 */
function spotifyAddTrackToPlaylist(playlistid, trackURI){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    id = getCookie(); //get user_ID from cookie
    await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlist/add/' + playlistid + '/' + trackURI + "/" + x[0].spotifyToken , true);
        xhttp.send(); // Gets the response
    });
}

/**
 * Reaname the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited
 * @param {string} name the new name of the playlist
 */
function spotifyRenamePlaylist(playlistid, name){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    id = getCookie(); //get user_ID from cookie
    await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlist/details/' + playlistid + '/' + name + "/" + x[0].spotifyToken, true);
        xhttp.send(); // Gets the response
    });
}

/**
 * Create a new Spotify playlist
 * @param {string} userID the id of the user to be the author of the playlist
 * @param {string} name the name of the playlist
 * @param {boolean} public true if playlist is public else false
 * @param {string} description a description of the playlist
 * @param {boolean} collaborative true if playlist can be edited by other users
 */
function spotifyCreateNewPlaylist(userID, name, public = false, description = '', collaborative = false){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    id = getCookie(); //get user_ID from cookie
    await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlist/create/' + userID + '/' + name + '/' + public + '/' + description + '/' + collaborative + "/" + x[0].spotifyToken, true);
        xhttp.send(); // Gets the response
    });
}

/**
 * Reoder the tracks in the specifed Spotify playlist
 * @param {string} playlistid the id of playlist to be modifed
 * @param {int} start the starting index of the tracks to be moved
 * @param {int} index the index where the tracks are to be moved to
 * @param {int} length the number of tracks to be moved
 */
function spotifyReorderTracksInPlaylist(playlistid, start, index, length = 1){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    id = getCookie(); //get user_ID from cookie
    await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + url + '/spotify/playlist/reorder/' + playlistid + '/' + start + '/' + index + '/' + length +  "/" + x[0].spotifyToken, true);
        xhttp.send(); // Gets the response
    });

}

/**
 * Search Spotify for tracks containing the search term
 * @param {string} searchTerm what to search the spotify library for
 */
async function spotifySearch(searchTerm){
   var xhttp = new XMLHttpRequest();
   return new Promise(function(resolve, reject) {
     xhttp.onreadystatechange = function ReceivedCallback() {
       if (this.readyState == 4) { //Upon getting a response
         if(this.status == 200){
           // document.getElementById("generated-content").innerHTML += displaySearch(JSON.parse(this.responseText), "Apple Music");
           resolve(this.responseText);
         } else {
         reject("Error");
       }
      }
     };
   id = getCookie(); //get user_ID from cookie
   await dbGetUserTokens(id).then((value) =>{
        var x = JSON.parse(value);
        xhttp.open('GET', 'http://' + URL + '/spotify/search/' + searchTerm + "/" + x[0].spotifyToken, true);
        xhttp.send(); // Gets the response
    });
  });
}

