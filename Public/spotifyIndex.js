const url = window.location.host;
/**
 * Redirects to the spotify login for user to authorize our program
 */
function spotifyLogin(extra){
    console.log("CLICK");
    location.href = "http://"+ url +"/spotify/login";
    console.log(url);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:    }
        console.log(xhttp.responseText);
    }
    xhttp.open("GET", "http://"+ url +"/spotify/login" + extra, true);
    xhttp.send();
    }
}

/**
 * Get the user data for the currently logged in user
 */
function spotifyGetUser(){
  var xhttp = new XMLHttpRequest();
  return new Promise(async function(resolve, reject) {
    xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4) { //Upon getting a response
        if(this.status == 200){
          resolve(this.responseText);
        } else {
        reject("Error Getting Spotify User");
      }
     }
    };
    spotifyToken = getCookie("spotifyUserToken") || null ; //get spotify user token from cookie
    if (spotifyToken == null){
      await refreshToken();
      spotifyToken = getCookie("spotifyUserToken")
    }
    xhttp.open('GET', 'http://' + url + '/spotify/user/' + spotifyToken , true);
    xhttp.send(); // Gets the response
  });
}

/**
 * Get a list of the the user playlists and all the tracks in each playlist
 */function spotifyGetUserPlaylists(){
    var xhttp = new XMLHttpRequest();
    return new Promise(async function(resolve, reject) {
      xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4) { //Upon getting a response
        if(this.status == 200){
          resolve(this.responseText);
        } else {
          reject("Error Getting User Playlists");
        }
      }
    };
    spotifyToken = getCookie("spotifyUserToken") || null; //get spotify user token from cookie
    if (spotifyToken == null){
      await refreshToken();
      spotifyToken = getCookie("spotifyUserToken")
    }
    //console.log(spotifyToken);
    xhttp.open('GET', 'http://' + url + '/spotify/user/playlists/' + spotifyToken , true);
    xhttp.send(); // Gets the response
    });
}


/**
 * Get the tracks from the Spotify playlist specifed by the playlistid
 * @param {string} playlistid the id of the playlist to get
 */
function spotifyGetPlaylistTracks(playlistid){
   var xhttp = new XMLHttpRequest();
   return new Promise(function(resolve, reject) {
     xhttp.onreadystatechange = function ReceivedCallback() {
     if (this.readyState == 4) { //Upon getting a response
       if(this.status == 200){
         resolve(this.responseText);
       } else {
         reject("Error Getting Playlist Tracks");
     }
    }
   };
   xhttp.open('GET', 'http://' + url + '/spotify/playlist/tracks/' + playlistid + '/' + spotifyToken , true);
   xhttp.send(); // Gets the response
  });
}

/**
 * Get the tracks from the Spotify playlist specifed by the playlistid
 * @param {string} playlistid the id of the playlist to get
 */
function spotifyGetPlaylistAttributes(playlistid){
  var xhttp = new XMLHttpRequest();
  return new Promise(async function(resolve, reject) {
    xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4) { //Upon getting a response
      if(this.status == 200){
        // document.getElementById("generated-content").innerHTML += displaySearch(JSON.parse(this.responseText), "Apple Music");
        resolve(this.responseText);
      } else {
      reject("Error Getting Playlist Attributes");
    }
   }
  };
  spotifyToken = getCookie("spotifyUserToken") || null; //get spotify user token from cookie
  if (spotifyToken == null){
    await refreshToken();
    spotifyToken = getCookie("spotifyUserToken")
  }
  xhttp.open('GET', 'http://' + url + '/spotify/playlist/' + playlistid + '/' + spotifyToken, true);
  xhttp.send(); // Gets the response
  });
}

/**
 * Deletes the track from the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited
 * @param {sting} trackURI URI of the track to be deleted
 */
async function spotifyDeleteTrackFromPlaylist(playlistid, trackURI){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    spotifyToken = getCookie("spotifyUserToken") || null; //get spotify user token from cookie
    if (spotifyToken == null){
      await refreshToken();
      spotifyToken = getCookie("spotifyUserToken")
    }
    xhttp.open('GET', 'http://' + url + '/spotify/playlist/delete/' + playlistid + '/' + trackURI + "/" + spotifyToken, true);
    xhttp.send(); // Gets the response
}

/**
 * Add the track to the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited
 * @param {sting} trackURI URI of the track to be added
 */
async function spotifyAddTrackToPlaylist(body, playlistID){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    spotifyToken = getCookie("spotifyUserToken") || null; //get spotify user token from cookie
    if (spotifyToken == null){
      await refreshToken();
      spotifyToken = getCookie("spotifyUserToken")
    }
    xhttp.open('POST', 'http://' + url + '/spotify/playlist/add/' + playlistID + '/' + spotifyToken , true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(body); // Gets the response
}

/**
 * Reaname the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited
 * @param {string} name the new name of the playlist
 */
async function spotifyRenamePlaylist(playlistid, name){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    spotifyToken = getCookie("spotifyUserToken") || null; //get spotify user token from cookie
    if (spotifyToken == null){
      await refreshToken();
      spotifyToken = getCookie("spotifyUserToken")
    }
    xhttp.open('GET', 'http://' + url + '/spotify/playlist/details/' + playlistid + '/' + name + "/" + spotifyToken, true);
    xhttp.send(); // Gets the response
}

/**
 * Create a new Spotify playlist
 * @param {string} userID the id of the user to be the author of the playlist
 * @param {string} name the name of the playlist
 * @param {boolean} public true if playlist is public else false
 * @param {string} description a description of the playlist
 * @param {boolean} collaborative true if playlist can be edited by other users
 */
function spotifyCreateNewPlaylist(body, userID){
  var xhttp = new XMLHttpRequest();
  return new Promise(async function(resolve, reject) {
    xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4) { //Upon getting a response
        console.log(this.status);
        if(this.status == 200){
          resolve(this.responseText);
        } else {
          reject("Error Creating New Playlist");
        }
      }
    };
    spotifyToken = getCookie("spotifyUserToken") || null; //get spotify user token from cookie
    if (spotifyToken == null){
      await refreshToken();
      spotifyToken = getCookie("spotifyUserToken")
    }
    xhttp.open('POST', 'http://' + url + '/spotify/playlist/create/' + userID + '/' + spotifyToken, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(body); // Sends the response
  });
}

/**
 * Reoder the tracks in the specifed Spotify playlist
 * @param {string} playlistid the id of playlist to be modifed
 * @param {int} start the starting index of the tracks to be moved
 * @param {int} index the index where the tracks are to be moved to
 * @param {int} length the number of tracks to be moved
 */
async function spotifyReorderTracksInPlaylist(playlistid, start, index, length = 1){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    spotifyToken = getCookie("spotifyUserToken") || null; //get spotify user token from cookie
    if (spotifyToken == null){
      await refreshToken();
      spotifyToken = getCookie("spotifyUserToken")
    }
    xhttp.open('GET', 'http://' + url + '/spotify/playlist/reorder/' + playlistid + '/' + start + '/' + index + '/' + length +  "/" + spotifyToken, true);
    xhttp.send(); // Gets the response
}

/**
 * Search Spotify for tracks containing the search term
 * @param {string} searchTerm what to search the spotify library for
 */
function spotifySearch(searchTerm){
  var xhttp = new XMLHttpRequest();
  return new Promise(function(resolve, reject) {
    xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4) { //Upon getting a response
        if(this.status == 200){
          resolve(this.responseText);
        } else {
        reject("Error Searching Spotify");
        }
      }
    };
    xhttp.open('GET', 'http://' + url + '/spotify/search/' + searchTerm, true);
    xhttp.send(); // Gets the response
  });
}

/**
 * use refresh token to get new access token and set cookie
 */
async function refreshToken(){
  refresh = getCookie("spotifyRefreshToken")
  if (refresh != null) {
    var xhttp = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
      xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4) { //Upon getting a response
          if(this.status == 200){
            resolve(this.responseText);
          } else {
            reject("Error Refreshing Token");
         }
        }
      };
      xhttp.open('GET', 'http://' + url + '/spotify/refresh/' + refresh, true);
      xhttp.send(); // Gets the response
      console.log("refresh Sent");
    });
  } else {
    Promise.reject("no refresh token available");
  }
}