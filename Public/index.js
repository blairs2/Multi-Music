//Gives front end access to apple musickit js
document.addEventListener('musickitloaded', () => {
 // MusicKit global is now defined
 fetch('/token').then(response => response.json()).then(res => {
   /***
     Configure our MusicKit instance with the signed token from server, returns a configured MusicKit Instance
     https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance
   ***/
   const music = MusicKit.configure({
     developerToken: res.token,
     app: {
       name: 'MultiMusic',
       build: '2020.5.7'
     }
   });

   // expose our instance globally for testing
   window.music = music;
   //Returns a promise which resolves with a music-user-token when a user successfully authenticates and authorizes

 });
});

window.addEventListener('load', async function(){
  //Populates the left hand side of screen with all the playlsits in the users library
  //user logged into both apple and spotify
  spotifyToken = getCookie("spotifyUserToken") || null;
  spotifyRefreshToken = getCookie("spotifyRefreshToken") || null;
  if (spotifyToken == null && spotifyRefreshToken != null){
      await refreshToken().then(() =>{spotifyToken = getCookie("spotifyUserToken")
    }).catch(e => {
      console.log(e);
    });
  }
  if(getCookie("appleUserToken") != null && getCookie("spotifyUserToken") != null){
    var appleLogo = document.getElementById("appleLogo");
    var spotifyLogo = document.getElementById("spotifyLogo");
    spotifyLogo.setAttribute("src", "assets/SPOTIFYLOGO.png");
    spotifyLogo.setAttribute("title", "Log out of Spotify");
    appleLogo.setAttribute("src", "assets/APPLEMUSICLOGO.png");
    appleLogo.setAttribute("title", "Log out of Apple Music");

    var applePlaylsits = await retreiveUserPlaylists();
    try{
      var spotifyPlaylists = await spotifyGetUserPlaylists();
    } catch {
      alert("Can't connect spotify playlist library");
    }
    await Promise.all([applePlaylsits,spotifyPlaylists]).then((values)=>{
      document.getElementById('user-playlists').innerHTML = displayPlaylistLibrary(values[0], "Apple Music");
      try{
        document.getElementById('user-playlists').innerHTML += displayPlaylistLibrary(values[1], "Spotify");
      } catch {

      }
    });

  }
  else if(getCookie("appleUserToken") != null){ //user logged into apple
    var appleLogo = document.getElementById("appleLogo");
    var spotifyLogo = document.getElementById("spotifyLogo");
    spotifyLogo.setAttribute("src", "assets/SPOTIFYLOGOBW.png");
    spotifyLogo.setAttribute("title", "Log in to Spotify");
    appleLogo.setAttribute("src", "assets/APPLEMUSICLOGO.png");
    appleLogo.setAttribute("title", "Log out of Apple Music");
    await retreiveUserPlaylists().then(playlists =>{
      //This generates the list of playlists on the left hand side of the screen
      var retval = displayPlaylistLibrary(playlists, "Apple Music");
      document.getElementById('user-playlists').innerHTML = retval;
    });
  }
  else if(spotifyToken != null){ //user logged into spotify
    var appleLogo = document.getElementById("appleLogo");
    var spotifyLogo = document.getElementById("spotifyLogo");
    spotifyLogo.setAttribute("src", "assets/SPOTIFYLOGO.png");
    spotifyLogo.setAttribute("title", "Log out of Spotify");
    appleLogo.setAttribute("src", "assets/APPLEMUSICLOGOBW.png");
    appleLogo.setAttribute("title", "Log in to Apple Music");
    await spotifyGetUserPlaylists().then(playlists =>{
      //This generates the list of playlists on the left hand side of the screen
      var retval = displayPlaylistLibrary(playlists, "Spotify");
      document.getElementById('user-playlists').innerHTML = retval;
    });
  }

  //all of the playlsts added to screen from above
  var user_playlists = document.getElementsByClassName("playlist-button");
  //Add event listener to each playlist.
  //Clicking on a playlists will trigger two GET requests. One gives attributes of library playlist, two gives tracks of library playlist
  for (var i = 0; i < user_playlists.length; i++) {
    //user playlist is clicked
     user_playlists[i].addEventListener('click', async function() {
      //Shows loading
      document.getElementById("generated-content").innerHTML = "<h4 class='loadingPlaylist'>Loading Playlist</h4>"
       //triggers get request to retrieve the playlists attributes from apple music's catalog (NOT USER Library)
       //upon retriving a response the function being called will generate attribute content to dislay on the screen
       try {
         if(this.getAttribute("data-service")=="Spotify"){
          var playlistAttributesPromise = await spotifyGetPlaylistAttributes(this.getAttribute("data-value"));
        } else {
          var playlistAttributesPromise = await appleUserPlaylistAttributes(this.getAttribute("data-value"));
        }
       } catch(e) {
         console.log(e);
       }
       //triggers get request to retrieve the playlists tracks from apple music's catalog (NOT USER Library)
       //upon retriving a response the function being called will generate track content to dislay on the screen
       try {
         if(this.getAttribute("data-service")=="Spotify"){
          var playlistTracksPromise = await spotifyGetPlaylistTracks(this.getAttribute("data-value"));
        } else {
          var playlistTracksPromise = await appleUserPlaylistTracks(this.getAttribute("data-value"));
        }
       } catch(e) {
         console.log(e);
       }

       Promise.all([playlistAttributesPromise, playlistTracksPromise]).then((values) => {
         //sets up divs to be populated
         document.getElementById("generated-content").innerHTML = '<div class="row"><div id="playlist-attributes"></div> <div id="playlist-songs" class="col-11"></div></div>';
         //The response should be a list with only one element
         var playlistAttr = JSON.parse(values[0]).playlists[0];
         document.getElementById("playlist-attributes").innerHTML = displayPlaylistAttributes(playlistAttr, this.getAttribute("data-service"));
         //Populate the songs, value[1] corresponses to playlistTracksPromise, which stores playlist tracks
         document.getElementById("playlist-songs").innerHTML = displayPlaylistTracks(JSON.parse(values[1]).tracks);
         document.getElementById("playlist-convert").addEventListener("click", () => {
           var playlist_id = document.getElementById("playlist-convert").getAttribute("data-value");
           // var user_id = getCookie("userID"); //change this to read username from cookie
           var user_id = 12; //for testing
           var current_service = document.getElementById("playlist-convert").getAttribute("data-service");
           //checks if playlist is already in the db, makes it if not
           document.getElementById("playlist-convert").disabled= true;
           document.getElementById("convert-link").innerHTML = "<span>Loading playlist link</span>";

           establishPlaylist(playlist_id, playlistAttr.title, user_id, current_service, false); //false tells apple we are searching users library

           },false);
           // //Adds event listeners to each song in the playlist view
           // //NOT USED FOR V1
           // if(this.getAttribute("data-service")=="Apple Music"){
           // //Add event listener for each song button. Upon click it will queue up the song to be played
           //
           // var song_elements = document.getElementsByClassName("song-button");
           // for (var i = 0; i < song_elements.length; i++) {
           //    song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
           //  }
           // }
         }); //end of promise.all
       },false);
     }
});

document.getElementById('search-input').addEventListener("keyup", async function(event){
 //When user clicks enter in our search bar
  var searchTerm = (document.getElementById('search-input').value).replace(/ /g, '+'); // '/ /g' is a regular expression that replaces all space instances with '+'
  if (event.keyCode === 13) { //on enter key
    document.getElementById("generated-content").innerHTML = "<h4 style='text-align: center;'>Loading Search</h4>"; //Clear the screen for the search results
    //Using promises ensures that both functions will be completed before the final step
    try {
      // var applePromise = await searchByTerm("term=" + searchTerm + "&limit=10&types=songs,albums,playlists");
      var applePromise = await searchByTerm("term=" + searchTerm + "&limit=10&types=playlists");

    } catch(e) {
      console.log(e);
    }
    try {
      // var spotifyPromise = await spotifySearch('q=' + searchTerm + '&type=track,album,playlist');
      var spotifyPromise = await spotifySearch('q=' + searchTerm + '&type=playlist');

    } catch(e) {
      console.log(e);
    }
   Promise.all([applePromise, spotifyPromise]).then((values) => {
     //first value is apple music results
     document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(values[0]), "Apple Music");
     //second value is spotify results
     document.getElementById("generated-content").innerHTML += displaySearch(JSON.parse(values[1]), "Spotify");
     //Gets a list of all the song buttons
     ////NOT USED IN V1
     // var song_elements = document.getElementsByClassName("song-button");
     ////Sets event listeners to each song button. Needs more config to play correctly
     // for (var i = 0; i < song_elements.length; i++) {
     //     if(song_elements[i].getAttribute("data-service") == "Apple Music"){
     //       song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
     //     }
     //   }
     //All of the apple and spotify playlists from the search
     var playlist_elements = document.getElementsByClassName("playlist-card");
     for (var i = 0; i < playlist_elements.length; i++) {
       //When a playlist is clicked enter the playlist view page
        playlist_elements[i].addEventListener('click', async function() {
        document.getElementById("generated-content").innerHTML = "<h4 class='loadingPlaylist'>Loading Playlist</h4>" //Loading message
          //triggers get request to retrieve the playlists attributes from apple music's catalog (NOT USER Library)
          //upon retriving a response the function being called will generate attribute content to dislay on the screen
          try {
            if(this.getAttribute("data-service")=="Spotify"){
             var playlistAttributesPromise = await spotifyGetPlaylistAttributes(this.getAttribute("data-value"));
           } else {
             var playlistAttributesPromise = await getCatalogPlaylistAttributes(this.getAttribute("data-value"));
           }
          } catch(e) {
            console.log(e);
          }
          //triggers get request to retrieve the playlists tracks from apple music's catalog (NOT USER Library)
          //upon retriving a response the function being called will generate track content to dislay on the screen
          try {
            if(this.getAttribute("data-service")=="Spotify"){
             var playlistTracksPromise = await spotifyGetPlaylistTracks(this.getAttribute("data-value"));
           } else {
             var playlistTracksPromise = await getCatalogPlaylistTracks(this.getAttribute("data-value"));
           }
          } catch(e) {
            console.log(e);
          }

          //waits for all the playlist attributes and tracks before displaying them
          Promise.all([playlistAttributesPromise, playlistTracksPromise]).then((values) => {
            //sets up divs to be populated
            document.getElementById("generated-content").innerHTML = '<div class="row"> <div id="playlist-attributes"> </div> <div id="playlist-songs" class="col-11"> </div> </div>';
            //The response should be a list with only one element
            var playlistAttr = JSON.parse(values[0]).playlists[0];
            //Populate the divs with the playlist content
            document.getElementById("playlist-attributes").innerHTML = displayPlaylistAttributes(playlistAttr, this.getAttribute("data-service"));
            //Populate the songs, value[1] corresponses to playlistTracksPromise, which stores playlist tracks
            document.getElementById("playlist-songs").innerHTML = displayPlaylistTracks(JSON.parse(values[1]).tracks);
            //Set convert event listener
            document.getElementById("playlist-convert").addEventListener("click", () => {
              var playlist_id = document.getElementById("playlist-convert").getAttribute("data-value");
              var user_id = getCookie("userID"); //Reads the users id from the cookie. The playlist being converted will  be added under this user's account
              // var user_id = 12; //for testing
              var current_service = document.getElementById("playlist-convert").getAttribute("data-service"); //The current service the playlist is from
              document.getElementById("playlist-convert").disabled= true; //Disables the convert button so the user cant spam the convert button
              document.getElementById("convert-link").innerHTML = "<span>Loading playlist link</span>"; //Sets the div for the convert link. will also be used to show progress of the conversion
              //convert
              //Convert process:
              //1. check if playlist has already been Converted
              //2. Either get existing playlist id or create a new playlist and get the id
              //3. For every song in the playlist check if its in the data base, if it is, add it to the databade playlist
              //4. If its not in the db add it to the database, this whill make the future conversions faster, then add it to the database playlist
              //5 return a link with the database playlist id and playlist name so the user can add it
              establishPlaylist(playlist_id, playlistAttr.title, user_id, current_service, true); //last true means search catalog

            },false); // end of promise.all
            // //Adds event listeners to each song in the playlist view
            // //NOT USED FOR V1
            // if(this.getAttribute("data-service")=="Apple Music"){
            // //Add event listener for each song button. Upon click it will queue up the song to be played
            //
            // var song_elements = document.getElementsByClassName("song-button");
            // for (var i = 0; i < song_elements.length; i++) {
            //    song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
            //  }
            // }
          });
        },false); //End of search playlist clicked event listener
      }
    });
  } else { // Enter key not pressed in search
    if(searchTerm.length > 0){ //Only send get request if there is something to search
      retrieveSearchHints("term=" + searchTerm); //Creates suggestions as user is typing
    }
  }
});

/**
*Apple playback features
*NOT USED IN V1
*/
//document.getElementById('next-btn').addEventListener("click", () =>{ music.skipToNextItem(); });
//document.getElementById('last-btn').addEventListener("click", () =>{ music.skipToPreviousItem(); });
//document.getElementById('play-btn').addEventListener('click', () => {music.play(); });
//document.getElementById('pause-btn').addEventListener('click', () => { music.pause(); });

//Populates search hints below search bar
function autocomplete(input, arr) {
 //Keeps track of what the user is highlighted on
 var currentFocus;
 //Adding an event listener to know when user starts typing in each
     //Closes all the lists
     closeAllLists();
     //Start the focus on nothing
     currentFocus = -1;
     //Creating the div for the items in the list
     first = document.createElement("div");
     first.setAttribute("id", this.id + "autocomplete-list");
     first.setAttribute("class", "autocomplete-items");
     //Puts the div class onto the div class
     input.parentNode.appendChild(first);
     //For each item in the array of values
     for (i = 0; i < arr.length; i++) {
       //Creating a div element to hold each item
       listItem = document.createElement("DIV");
       listItem.setAttribute("class", "search_hint");

       listItem.innerHTML += arr[i];
       //Holds the current value
       listItem.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
       listItem.addEventListener("click", function(e) {
           input.value = this.getElementsByTagName("input")[0].value;
           input.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 13}));
           closeAllLists();
       });

       first.appendChild(listItem);

     }



 //Closes all the items
 function closeAllLists(element) {
   var x = document.getElementsByClassName("autocomplete-items");
   for (var i = 0; i < x.length; i++) {
     if (element != x[i] && element != input) {
       x[i].parentNode.removeChild(x[i]);
     }
   }
 }
 //Closes the autocomplete drop down when the user clicks off
 document.addEventListener("click", function (e) {
     closeAllLists(e.target);
 });
}

//////////////////////////////
//GET functions
/////////////////////////////

/**
 * Retrieves all the users playlist in aphebetical order
 */
function retreiveUserPlaylists(){
  var xhttp = new XMLHttpRequest();
  return new Promise(async function(resolve, reject) {
    xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4) { //Upon getting a response
      if(this.status == 200){
        resolve(this.responseText);
      } else {
        reject("Error");
      }
    }
  };
  appleToken = getCookie("appleUserToken") || null; //get apple music token from cookie
  console.log(appleToken);
  xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/" + appleToken.replace(/\//g, '%2F'), true);
  xhttp.send(); // Gets the response
  });
}

/**
 *Used to get the the songs from a users library (defualt 25 at a itme)
 *NOT USED FOR V1
 */
function retrieveUserSongs(){
 var xhttp = new XMLHttpRequest();
 xhttp.onreadystatechange = function ReceivedCallback() {
   if (this.readyState == 4 && this.status == 200) { //Upon getting a response
     console.log(JSON.parse(this.responseText));
     //Code to change the generated-content inner html
   }
 };
 appleToken = getCookie("appleUserToken")  || null; //get apple music token from cookie
 xhttp.open("GET", "http://" + url + "/apple-music/library/songs/" + appleToken.replace(/\//g, '%2F'), true);
 xhttp.send(); // Gets the response
}

/**
 *Used to get the the artists from a users library (defualt 25 at a itme)
 *NOT USED FOR V1
 */
function retrieveUserArtists(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
      console.log(JSON.parse(this.responseText));
      //Code to change the generated-content inner html
    }
  };

  appleToken = getCookie("appleUserToken")  || null; //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/artists/" + appleToken.replace(/\//g, '%2F'), true);
  xhttp.send(); // Gets the response
}


/**
 *Used to get the albums from a users library (defualt 25 at a itme)
 *NOT USED FOR V1
 */
function retrieveUserAlbums(){
 var xhttp = new XMLHttpRequest();
 xhttp.onreadystatechange = function ReceivedCallback() {
   if (this.readyState == 4 && this.status == 200) { //Upon getting a response
     console.log(JSON.parse(this.responseText));
     //Code to change the generated-content inner html
   }
 };

  appleToken = getCookie("appleUserToken")  || null; //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/albums/" + appleToken.replace(/\//g, '%2F'), true);
  xhttp.send(); // Gets the response
}


/**
 * As the user is typing into the search bar. this will fetch search hits for the drop down
 * Used to find search recommendations
 * @param {string} searchTerm what is used to find recommended searches
 */
function retrieveSearchHints(searchTerm){
 var xhttp = new XMLHttpRequest();
 xhttp.onreadystatechange = function ReceivedCallback() {
   if (this.readyState == 4 && this.status == 200) { //Upon getting a response
        autocomplete(document.getElementById("search-input"), JSON.parse(this.responseText).results.terms);

   }
 };
 xhttp.open("GET", "http://" + url + "/apple-music/catalog/search/hints/" + searchTerm, true);
 xhttp.send(); // Gets the response

}

/**
 * Searches apple musics catalog
 * @param {string} searchTerm The term that is being searched in apple's catalog
 */
async function searchByTerm(searchTerm){
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
  xhttp.open("GET", "http://" + url + "/apple-music/catalog/search/" + searchTerm, true);
  xhttp.send(); // Gets the response
 });
}

/**
 * Used to add tracks to a particular playlist using the apple playlist id
 * NOT USED FOR V1
 * @param {string} playlist_id Is a apple playlist id. Ex. p.MoGJYM3CYXW09B
 */
function addTrackToPlaylist(playlist_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4 && this.status == 200) { //Upon getting a response

      }
    };
    appleToken = getCookie("appleUserToken")  || null; //get apple music token from cookie
    xhttp.open("POST", "http://" + url + "/apple-music/library/" + playlist_id + "/playlist/" + appleToken.replace(/\//g, '%2F'), true);
    xhttp.send(); // Gets the response
}

/**
 * Retrieves the tracks of a library playlist. "returns" a promise onces they are retrieved
 * @param {string} playlist_id Is a apple playlist id. Ex. p.MoGJYM3CYXW09B
 */
async function appleUserPlaylistTracks(playlist_id){
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
  appleToken = getCookie("appleUserToken")  || null; //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/" + playlist_id + "/relationships/" + appleToken.replace(/\//g, '%2F') , true);
  xhttp.send(); // Gets the response
  });
}

/**
 * Retrieves the attributes of a library playlist. Which includes; title, id, artwork (if exists). "returns" a promise onces they are retrieved
 * @param {string} playlist_id Is a apple playlist id. Ex. p.MoGJYM3CYXW09B
 */
async function appleUserPlaylistAttributes(playlist_id){
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
  appleToken = getCookie("appleUserToken")  || null; //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/" + playlist_id + "/" + appleToken.replace(/\//g, '%2F') , true);
  xhttp.send(); // Gets the response
  });
}

/**
 * Retrieves the tracks of a library playlist that is on apple's catalog. "returns" a promise onces they are retrieved
 * @param {string} playlist_id Is a apple playlist id. Ex. p.MoGJYM3CYXW09B
 */
async function getCatalogPlaylistTracks(playlist_id){
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
    xhttp.open("GET", "http://" + url + "/apple-music/catalog/playlists/" + playlist_id + "/relationships" , true);
    xhttp.send(); // Gets the response
  });
}

/**
 * Retrieves the attributes of a library playlist that is on apple's catalog. "returns" a promise onces they are retrieved
 * @param {string} playlist_id Is a apple playlist id. Ex. p.MoGJYM3CYXW09B
 */
async function getCatalogPlaylistAttributes(playlist_id){
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
   xhttp.open("GET", "http://" + url + "/apple-music/catalog/playlists/" + playlist_id , true);
   xhttp.send(); // Gets the response
  });
}

/**
 * This function takes a multi-music search json and returns formatted html to display
 * @param {string} playlist_id Is a apple playlist id. Ex. p.MoGJYM3CYXW09B
 */
function displaySearch(search_response, service){
  if (service == "Apple Music") {
    var searchResults = '<h3><img src="assets/APPLEMUSICLOGO.png" style="width:50px"> '+service+'</h3><hr>';
  }
  if (service == "Spotify") {
    var searchResults = '<h3><img src="assets/SPOTIFYLOGO.png" style="width:50px"> '+service+'</h3><hr>';
  }
  //Gives a header. Indicating what service the search results came from
  var h, w, url;
  ////ALBUMS AND SONGS NOT IN V
  // if(search_response.hasOwnProperty("albums")){
  //   var albums = search_response.albums.data;
  //   searchResults += '<h2>Albums</h2><div class="scrolling-wrapper">';
  //
  //   for(var i = 0; i< albums.length; i++){
  //     url = albums[i].artwork;
  //     var artistName = albums[i].artist;
  //     var albumName = albums[i].title;
  //     var albumId = albums[i].id
  //     searchResults += `<div class="card" value="album" data-service="${service}" data-value="${albumId}"><img src=${url} height=100% width=100%><span class="album-artist-label">${artistName}</span><span class="album-artist-label">${albumName}</span></div>`;
  //   }
  //   searchResults += '</div><hr>';
  // }
  // if(search_response.hasOwnProperty("songs")){
  //   var songs = search_response.songs.data;
  //   searchResults += '<h2>Songs</h2><div class="scrolling-wrapper"><div class="song-block" ><ul class="list-group">';
  //
  //   var count = 1;
  //   for(var i = 0; i< songs.length; i++){
  //
  //     url = songs[i].artwork;
  //     var songName = songs[i].title;
  //     var songId = songs[i].id;
  //     searchResults += `<button type="button" class="list-group-item song-button" value="song" data-service="${service}" data-value="${songId}"><img class="song-button-img" src=${url}><span>${songName}</span></button>`;
  //     if(count%3==0){
  //       searchResults += '</ul></div><div class="song-block"><ul class="list-group">'
  //     }
  //     count++;
  //   }
  //   searchResults += '</ul></div></div><hr>';
  // }
  if(search_response.hasOwnProperty("playlists") && search_response.playlists.data.length){ //Checks if playlists were in the search response
    var playlists = search_response.playlists.data;
    searchResults += '<h4>Playlists</h4><div class="scrolling-wrapper">';
    for(var i = 0; i< playlists.length; i++){
       //every playlist in the search should have these attributes
       url = playlists[i].artwork;
       var playlistName = playlists[i].title;
       var playlistId = playlists[i].id;
       searchResults += `<div class="card playlist-card" value="playlist" data-service="${service}" data-value="${playlistId}"><img src=${url} height=100% width=100%><span class="album-artist-label">${playlistName}</span></div>`;
     }
     searchResults += '</div><hr>';
  } else {
    searchResults += '<h5>No results found</h5><br>';
  }
  return searchResults;
}

/**
 * Displays the attributes of a playlist
 * @param {string} playlist_attributes Is a multi music json containing attributes.
 * @param {string} service Is the respective service that the playlist comes from
 */
function displayPlaylistAttributes(playlist_attributes, service){
 var retval = "";
 var playlistTitle = playlist_attributes.title;
//  retval += `<div style="display:flex; align-items:center"><h4>${playlistTitle}</h4>`;
//  retval += `<button id="playlist-convert" data-value='${playlist_attributes.id}' data-service='${service}' type="button" class="btn btn-primary" style="text-align: center;">Convert Playlist</button>`;
 if (playlist_attributes.hasOwnProperty("artwork")) {
     var artworkDisplay = playlist_attributes.artwork;
     retval += `<div><a href="#" style="padding: 15px"><img class='card-img-top' src="${artworkDisplay}" alt='' style="width: 300px; height: 300px"></a>`;
     retval += `<button id="playlist-convert" data-value='${playlist_attributes.id}' data-service='${service}' type="button" class="btn btn-primary">Convert Playlist</button>`;
     retval += '<div id="convert-link"></div></div>';
 } else{
   retval += '<div><a href="#" style="padding: 15px"><img class="card-img-top" src="/assets/Missing_content.png" alt="" style="width: 300px"></a>';
   retval += `<button id="playlist-convert" data-value='${playlist_attributes.id}' data-service='${service}' type="button" class="btn btn-primary">Convert Playlist</button>`;
   retval += '<div id="convert-link"></div></div>';
  }

 retval += `<div style="display:block; margin: auto"><h4>${playlistTitle}</h4> `;
 //retval += '<div style="text-align:left">';
 if (playlist_attributes.hasOwnProperty("description")){
   var playlistDescription = playlist_attributes.description;
   retval += `<div id="playlist-description">"${playlistDescription}"</div>`;
 }
 retval += "</div>";

 //retval += '</div>';
//  retval += `<span><button id="playlist-convert" data-value='${playlist_attributes.id}' data-service='${service}' type="button" class="btn btn-primary" style="text-align: center;">Convert Playlist</button></span>`;
//  retval += '<div id="convert-link"> </div>';
 return retval;
}

/**
 * Displays the tracks of a playlist
 * @param {string} playlist_tracks Is a multi-music json that contains a list of tracks
 */
function displayPlaylistTracks(playlist_tracks){
 var retval = "";
 var title, artist, sondId,url;
 retval += '<ul class="list-group">';
 retval += '<table><tr><th style="width: 20px"></th><th style="width:400px">Song</th><th>Arist</th></tr>';
 for(var i = 0; i< playlist_tracks.length; i++){
   title = playlist_tracks[i].title;
   artist = playlist_tracks[i].artist;
   songId = playlist_tracks[i].id;
   if(playlist_tracks[i].hasOwnProperty("artwork") && playlist_tracks[i].artwork != null){
     url = playlist_tracks[i].artwork;

   } else {
     url = "/assets/Missing_content.png";
   }
   retval += `<tr><td><img class="song-button-img" data-value="${songId}" src=${url}></td><td>${title}</td><td>${artist}</td></tr>`;
   //retval += `<button type="button" class="list-group-item song-button" value="song" data-value="${songId}"><img class="song-button-img" src=${url}><span>${title}</span>&emsp;<span>${artist}</span></button>`;
  }
retval+= "</table>";
 retval += "</div>";
 return retval;
}

/**
* Dislay the users playlist library on the left hand side
* @param {string} playlists is a multi music json containing a list of user playlist's
* @param {string} service the the service that the playlist library is from
*/
function displayPlaylistLibrary(playlists, service){
  var cloudPlaylists = JSON.parse(playlists).playlists;
  var retval = `<h5 style="text-align: center;">${service} Playlists</h5>`;
  for(var i =0; i < cloudPlaylists.length; i++){
    var playlistName = cloudPlaylists[i].title;
    var playlist_id = cloudPlaylists[i].id;

    retval += `<button class="list-group-item playlist-button" data-service="${service}" data-value="${playlist_id}" >${playlistName}</button>`; //Each button includes playlist id
  }
  return retval;
}

// /**
// *Used to play apple music
// *NOT USED IN V1
// @param {int} id a unique id of the Content
// @param {string} type is album, song, artist, playlist...
// */
// function applePlay(id, contentType){
//  console.log("play", id, contentType);
//  music.setQueue({[contentType]: id }); //Sets the music queue
// }

/**
will convert playlist from current_service to new_service
* @param {string} playlist_id is the id of the playlist
* @param {string} current_service is the current service of the playlist Apple Music or Spotify
* @param {string} mm_playlist_id is the multi music playlist id for the playlist being converted
* @param {string} playlist_name is the name of the playlist being converted
* @param {bool} catalog is a boolean. true and it will search the catalog, false will search the library
*/
async function convertPlaylist(playlist_id, current_service, mm_playlist_id, playlist_name, catalog){
  var new_service;
  if(current_service == "Apple Music"){
   new_service = "Spotify";
   try {
     if(catalog){ //Search catalog of library
       var playlistTracks = await getCatalogPlaylistTracks(playlist_id); //If were searching the apple catalog
     } else {
       var playlistTracks = await appleUserPlaylistTracks(playlist_id); //if were searching a users library
     }
   } catch(e) {
     console.log(e);
   }
  } else if (current_service == "Spotify"){
   new_service = "Apple Music";
   try{ //Searches catalog and library
     var playlistTracks = await spotifyGetPlaylistTracks(playlist_id);
   } catch(e) {
     console.log(e);
   }
 }

 //All the tracks of the playlist were collected
  Promise.all([playlistTracks]).then(async function(values){
    var tracks = JSON.parse(values[0]).tracks;
    var search, track, matches, handle; //handle is a promise
    for(var i = 0; i < tracks.length; i++){
      track = tracks[i];
      document.getElementById("convert-link").innerHTML = `<span>Loading playlist link ${i}/${tracks.length}</span>`; //Update the load bar
      //waits for it to check if the song is in the database. handle is a promise
      handle = await dbHasSong(track.id).then(async function(resp){
        if(resp == 'false'){//Song not in the database
          //replace spaces with plus and get rid of special characters
          search = (removeFeatureFromSong(track.title) + "+" + track.artist).replace(/ /g, '+').replace(/&/g, "").replace(/\//g, '%2F').replace(/%/g, " ").replace(/\?/g, " ");
          if(new_service == "Spotify"){ //Searches spotify for the song's equalivant
            await spotifySearch('q=' + search + '&limit=1&type=track').then(async function(value){
              var response = JSON.parse(value);
              if(response.hasOwnProperty("songs")){
                var song_matches = response.songs.data;
                if(song_matches.length > 0){
                  //add the new song to db
                  //Wait for it to be added
                  await dbAddSong(encodeURIComponent(song_matches[0].title), encodeURIComponent(song_matches[0].artist), song_matches[0].id, track.id).then(async function(inserted){
                    var song_id = JSON.parse(inserted).insertId; //Gets the recently inserted song ID
                    await dbAddSongToPlaylist(mm_playlist_id, song_id);
                  });
              } else {
                console.log(track.title, "NOT FOUND");
              }
            }
          });
        } else if(new_service == "Apple Music") {
          await searchByTerm('term=' + search.replace(/%20/g, "").replace(/ /g, '+') + '&limit=1&types=songs').then(async function(value){
            var response = JSON.parse(value);
            if(response.hasOwnProperty("songs")){
              var song_matches = response.songs.data;
              if(song_matches.length > 0){
                await dbAddSong(encodeURIComponent(song_matches[0].title), encodeURIComponent(song_matches[0].artist), track.id, song_matches[0].id,).then(async function(inserted){
                  var song_id = JSON.parse(inserted).insertId; //Gets the recently inserted song ID
                  await dbAddSongToPlaylist(mm_playlist_id, song_id);
                });
              } else {
                console.log(track.title, "NOT FOUND");
              }
            }
          });
        }
      } else {
        var repsonse_json = JSON.parse(resp);
        var song_id = repsonse_json[0].song_ID;
        await dbAddSongToPlaylist(mm_playlist_id, song_id);
      }
    });
  }
  document.getElementById('convert-link').innerHTML = `<a class="nav-link" href="http://${url}/convert.html?id=${mm_playlist_id}&name=${playlist_name}">Converted Playlist</a>`;
});
}

/*
* Takes a song title and removes the (feat...)
* makes cross searching services easier
*
*/
function removeFeatureFromSong(song_title){
 var idx = song_title.indexOf("(feat");
 if(idx > 0){//The string contains a feat tag
   return song_title.slice(0, idx);
 }
 return song_title;
}

/**
* Queries database checking the playlist table apple playlists or spotify playlists that match @playlist_id
* @param {string} playlist_id is applemusic or spotify playlist id
* @param {string} title title of the playlist
* @param {int} user_id multimusic user id
* @param {string} current_service which service the playlist is being converted from
* @param {bool} catalog true search catalog, false search library for playlist tracks
*
*/
async function establishPlaylist(playlist_id, title, user_id, current_service, catalog){
    var playlist_description = document.getElementById("playlist-description").textContent || null;
     var db_playlist_id = dbPlaylistExists(playlist_id).then(response => {
       if(response == 'false'){
         if(current_service == "Apple Music"){
           dbAddPlaylist(encodeURIComponent(title), user_id, spotifyID=null, appleID=playlist_id, description=playlist_description).then((inserted)=>{
             var mm_playlist_id = JSON.parse(inserted).insertId;
             convertPlaylist(playlist_id, current_service, mm_playlist_id, title, catalog);
           });
         } else if (current_service == "Spotify"){
           dbAddPlaylist(encodeURIComponent(title), user_id, spotifyID=playlist_id, appleID=null, description=playlist_description).then((inserted)=>{
             var mm_playlist_id = JSON.parse(inserted).insertId;
             convertPlaylist(playlist_id, current_service, mm_playlist_id, title, catalog);
           });
         } else {
           console.log("Invalid Service");
         }
         // dbPlaylistExists(playlist_id).then(value => {
         //
         //   var mm_playlist_id = JSON.parse(value)[0].playlist_ID;
         //   console.log("New playlist: ", mm_playlist_id);
         //   convertPlaylist(playlist_id, current_service, mm_playlist_id, title, catalog);
         // });
       } else {
         var mm_playlist_id = JSON.parse(response)[0].playlist_ID;
         console.log("playlist id:",mm_playlist_id);
         dbDeleteTracks(mm_playlist_id).then(()=>{
           convertPlaylist(playlist_id, current_service, mm_playlist_id,title, catalog);
         }); // delete the tracks currently associated with the playlist
       }
     });
}
