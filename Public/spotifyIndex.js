var URL = "http://localhost:8080"

/**
 * Redirects to the spotify login for user to authorize our program
 */
function spotifyLogin(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/login', true);
    xhttp.send(); // Gets the response
}

/**
 * Get the user data for the currently logged in user
 */
function getSpotifyUser(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/user', true);
    xhttp.send(); // Gets the response
}

/**
 * Get a list of the the user playlists and all the tracks in each playlist
 */
function getSpotifyUserPlaylists(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/playlists', true);
    xhttp.send(); // Gets the response
}

/**
 * Get the Spotify playlist specifed by the playlistid
 * @param {string} playlistid the id of the playlist to get 
 */
function getSpotifyPlaylist(playlistid){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/playlist/' + playlistid, true);
    xhttp.send(); // Gets the response
}

/**
 * Deletes the track from the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited 
 * @param {sting} trackURI URI of the track to be deleted
 */
function deleteTrackFromSpotifyPlaylist(playlistid, trackURI){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/playlist/delete/' + playlistid + '/' + trackURI, true);
    xhttp.send(); // Gets the response
}

/**
 * Add the track to the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited  
 * @param {sting} trackURI URI of the track to be added
 */
function addTrackToSpotifyPlaylist(playlistid, trackURI){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/playlist/add/' + playlistid + '/' + trackURI, true);
    xhttp.send(); // Gets the response
}

/**
 * Reaname the Spotify playlist
 * @param {string} playlistid id of the playlist to be edited  
 * @param {string} name the new name of the playlist 
 */
function renameSpotifyPlaylist(playlistid, name){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/playlist/details/' + playlistid + '/' + name, true);
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
function createNewSpotifyPlaylist(userID, name, public = false, description = '', collaborative = false){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/playlist/create/' + userID + '/' + name + '/' + public + '/' + description + '/' + collaborative, true);
    xhttp.send(); // Gets the response
}

/**
 * Reoder the tracks in the specifed Spotify playlist
 * @param {string} playlistid the id of playlist to be modifed
 * @param {int} start the starting index of the tracks to be moved
 * @param {int} index the index where the tracks are to be moved to
 * @param {int} length the number of tracks to be moved
 */
function reorderTracksInSpotifyPlaylist(playlistid, start, index, length = 1){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/playlist/reorder/'+ playlistid + '/' + start + '/' + index + '/' + length , true);
    xhttp.send(); // Gets the response
}

/**
 * Search Spotify for tracks containing the search term
 * @param {string} searchTerm what to search the spotify library for 
 */
function searchSpotifyByTerm(searchTerm){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
        if (this.readyState == 4 && this.status == 200) { //Upon getting a response
            console.log(JSON.parse(this.responseText));
        }
    };
    xhttp.open('GET', URL + '/spotify/search/' + searchTerm, true);
    xhttp.send(); // Gets the response
}