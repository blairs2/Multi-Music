// const url = window.location.host;
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
  console.log("loading");
  //Populates the left hand side of screen with all the playlsits in the users library
  if(getCookie("appleUserToken") != null && getCookie("spotifyUserToken") != null){

    var applePlaylsits = await retreiveUserPlaylists();
    var spotifyPlaylists = await spotifyGetUserPlaylists();

    Promise.all([applePlaylsits,spotifyPlaylists]).then((values)=>{
      document.getElementById('user-playlists').innerHTML = displayPlaylistLibrary(values[0], "Apple Music");
      document.getElementById('user-playlists').innerHTML += displayPlaylistLibrary(values[1], "Spotify");
    });
  }
  else if(getCookie("appleUserToken") != null){
    await retreiveUserPlaylists().then(playlists =>{
      //This generates the list of playlists on the left hand side of the screen
      var retval = displayPlaylistLibrary(playlists, "Apple Music");
      document.getElementById('user-playlists').innerHTML = retval;
    });
  }
  else if(getCookie("spotifyUserToken") != null){

    await spotifyGetUserPlaylists().then(playlists =>{
      //This generates the list of playlists on the left hand side of the screen
      var retval = displayPlaylistLibrary(playlists, "Spotify");
      document.getElementById('user-playlists').innerHTML = retval;
    });
  }


  var user_playlists = document.getElementsByClassName("playlist-button");
  //Add event listener to each playlist.
  //Clicking on a playlists will trigger two GET requests. One gives attributes of library playlist, two gives tracks of library playlist
  for (var i = 0; i < user_playlists.length; i++) {
       user_playlists[i].addEventListener('click', async function() {
       //sets up divs to be populated
       document.getElementById("generated-content").innerHTML = '<div class="row"> <div id="playlist-attributes" class="col-3"> </div> <div id="playlist-songs" class="col-9"> </div> </div>';
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

       //   if(JSON.parse(this.responseText).hasOwnProperty("errors")){
       //
       //   }
       //   else{
       //     var retval = displayPlaylistTracks(JSON.parse(this.responseText).tracks);
       //     document.getElementById("playlist-songs").innerHTML = retval;
       //     var song_elements = document.getElementsByClassName("song-button");
       //    for (var i = 0; i < song_elements.length; i++) {
       //        song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
       //    }
       //  }
       // }
       // var retval = displayPlaylistAttributes(JSON.parse(this.responseText).playlists[0], "Apple Music");
       // document.getElementById("playlist-attributes").innerHTML = retval;
       // document.getElementById("playlist-convert").addEventListener("click", () => {
       //   console.log("clicked playlist");
       //   convertPlaylist(document.getElementById("playlist-convert").getAttribute("data-value"), document.getElementById("playlist-convert").getAttribute("data-service"));
       //
       // },false);

         Promise.all([playlistAttributesPromise, playlistTracksPromise]).then((values) => {
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

             establishPlaylist(playlist_id, playlistAttr.title, user_id, current_service);
             // convertPlaylist(playlist_id, current_service);

           },false);

           if(this.getAttribute("data-service")=="Apple Music"){
           //Add event listener for each song button. Upon click it will queue up the song to be played

           var song_elements = document.getElementsByClassName("song-button");
           for (var i = 0; i < song_elements.length; i++) {
              song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
          }
        }
        });
      },false);
    }
});

document.getElementById('search-input').addEventListener("keyup", async function(event){
 //When user clicks enter in our search bar
  var searchTerm = (document.getElementById('search-input').value).replace(/ /g, '+'); // '/ /g' is a regular expression that replaces all space instances with '+'
  if (event.keyCode === 13) { //on enter key
    document.getElementById('generated-content').innerHTML = ''; //Clear the screen for the search results
    //Using promises ensures that both functions will be completed before the final step
    try {
      var applePromise = await searchByTerm("term=" + searchTerm + "&limit=10&types=songs,albums,playlists");
    } catch(e) {
      console.log(e);
    }
    try {
      var spotifyPromise = await spotifySearch('q=' + searchTerm + '&type=track,album,playlist');
    } catch(e) {
      console.log(e);
    }
   Promise.all([applePromise, spotifyPromise]).then((values) => {
     //first value is apple music results
     document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(values[0]), "Apple Music");
     //second value is spotify results
     document.getElementById("generated-content").innerHTML += displaySearch(JSON.parse(values[1]), "Spotify");
     var song_elements = document.getElementsByClassName("song-button");
      // var elements = document.getElementsByClassName("card");
     var playlist_elements = document.getElementsByClassName("playlist-card");
     for (var i = 0; i < song_elements.length; i++) {
         if(song_elements[i].getAttribute("data-service") == "Apple Music"){
           song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
         }
       }
     // for (var i = 0; i < elements.length; i++) {
     //     elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
     // }
     //add event listener to playlists in search results
     for (var i = 0; i < playlist_elements.length; i++) {
          playlist_elements[i].addEventListener('click', async function() {
          //sets up divs to be populated
          document.getElementById("generated-content").innerHTML = '<div class="row"> <div id="playlist-attributes" class="col-3"> </div> <div id="playlist-songs" class="col-9"> </div> </div>';
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


            Promise.all([playlistAttributesPromise, playlistTracksPromise]).then((values) => {
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

                establishPlaylist(playlist_id, playlistAttr.title, user_id, current_service);
                // convertPlaylist(playlist_id, current_service);

              },false);

              if(this.getAttribute("data-service")=="Apple Music"){
              //Add event listener for each song button. Upon click it will queue up the song to be played

              var song_elements = document.getElementsByClassName("song-button");
              for (var i = 0; i < song_elements.length; i++) {
                 song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
             }
           }
           });
         },false);
     }
   });
    //Search Spotify (Function in spotifyIndex.js)
    // searchByTerm("term=" + searchTerm); //Search for the users input
  } else { // Enter key not pressed
    if(searchTerm.length > 0){ //Only send get request if there is something to search
      retrieveSearchHints("term=" + searchTerm); //Creates suggestions as user is typing
    }
  }
});

document.getElementById('next-btn').addEventListener("click", () =>{
 music.skipToNextItem();
});
document.getElementById('last-btn').addEventListener("click", () =>{
 music.skipToPreviousItem();
});

document.getElementById('play-btn').addEventListener('click', () => {
 /***
   Resume or start playback of media item
   https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992709-play
 ***/
 music.play();
});

document.getElementById('pause-btn').addEventListener('click', () => {
 /***
   Pause playback of media item
   https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992708-pause
 ***/
 music.pause();
});

// document.getElementById("play_pause_button").addEventListener('click', () => {
//   var btn = $(".play_pause_button");
//   btn.click(function() {
//     btn.toggleClass("paused");
//     return false;
//   });
// });

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

function retreiveUserPlaylists(){
 var xhttp = new XMLHttpRequest();
 return new Promise(async function(resolve, reject) {
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
    appleToken = getCookie("appleUserToken"); //get apple music token from cookie
    xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/" + appleToken.replace(/\//g, '%2F'), true);
    xhttp.send(); // Gets the response
});
}

//Gets the users library of songs (default 25)
function retrieveUserSongs(){
 var xhttp = new XMLHttpRequest();
 xhttp.onreadystatechange = function ReceivedCallback() {
   if (this.readyState == 4 && this.status == 200) { //Upon getting a response
     console.log(JSON.parse(this.responseText));
     //Code to change the generated-content inner html
   }
 };
 appleToken = getCookie("appleUserToken"); //get apple music token from cookie
 xhttp.open("GET", "http://" + url + "/apple-music/library/songs/" + appleToken.replace(/\//g, '%2F'), true);
 xhttp.send(); // Gets the response
}

//Gets the users library of artists (default 25)
function retrieveUserArtists(){
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function ReceivedCallback() {
  if (this.readyState == 4 && this.status == 200) { //Upon getting a response
    console.log(JSON.parse(this.responseText));
    //Code to change the generated-content inner html
  }
};

  appleToken = getCookie("appleUserToken"); //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/artists/" + appleToken.replace(/\//g, '%2F'), true);
  xhttp.send(); // Gets the response
}

//Gets the users library of albums (defualt 25)
function retrieveUserAlbums(){
 var xhttp = new XMLHttpRequest();
 xhttp.onreadystatechange = function ReceivedCallback() {
   if (this.readyState == 4 && this.status == 200) { //Upon getting a response
     console.log(JSON.parse(this.responseText));
     //Code to change the generated-content inner html
   }
 };

  appleToken = getCookie("appleUserToken"); //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/albums/" + appleToken.replace(/\//g, '%2F'), true);
  xhttp.send(); // Gets the response
}

//As the user is typing into the search bar. this will fetch search hits for the drop down
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

// //Gets an individual playlist by id.
// //Buttons for each playlist's are generated when retrieveUserPlaylsits() is run. Each playlist button has the corresponding id attached
// function retirevePlaylist(playlist_id){
//  xhttp.onreadystatechange = function ReceivedCallback() {
//    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
//      }
//    };
//     appleToken = getCookie("appleUserToken"); //get apple music token from cookie
//     xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/" + playlist_id + "/" + appleToken.replace(/\//g, '%2F'), true);
//     xhttp.send(); // Gets the response
//   }

// //seperate from retrievePlaylist which gets the information about the playlist.
// //This function gets the tracks that are in the playlist
// function retrievePlaylistTracks(playlist_id){
//     var xhttp = new XMLHttpRequest();
//     xhttp.onreadystatechange = function ReceivedCallback() {
//     if (this.readyState == 4 && this.status == 200) { //Upon getting a response
//
//      }
//     };
//     appleToken = getCookie("appleUserToken"); //get apple music token from cookie
//     xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/"+ playlist_id +"/relationships/" + appleToken.replace(/\//g, '%2F'), true);
//     xhttp.send(); // Gets the response
// }

//Searches for term across every catagory

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

//////////////////////////////
//POST functions
/////////////////////////////


function addTrackToPlaylist(playlist_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4 && this.status == 200) { //Upon getting a response
        // console.log(JSON.parse(this.responseText));

           // document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(this.responseText));
      }
    };
    appleToken = getCookie("appleUserToken"); //get apple music token from cookie
    xhttp.open("POST", "http://" + url + "/apple-music/library/" + playlist_id + "/playlist/" + appleToken.replace(/\//g, '%2F'), true);
    xhttp.send(); // Gets the response
}


async function appleUserPlaylistTracks(playlist_id){
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
  appleToken = getCookie("appleUserToken"); //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/" + playlist_id + "/relationships/" + appleToken.replace(/\//g, '%2F') , true);
  xhttp.send(); // Gets the response
  });
}


async function appleUserPlaylistAttributes(playlist_id){
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
  appleToken = getCookie("appleUserToken"); //get apple music token from cookie
  xhttp.open("GET", "http://" + url + "/apple-music/library/playlists/" + playlist_id + "/" + appleToken.replace(/\//g, '%2F') , true);
  xhttp.send(); // Gets the response
  });
}



/*Gets tracks of a playlist on apple musics catalog, not a users library*/
async function getCatalogPlaylistTracks(playlist_id){
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
 xhttp.open("GET", "http://" + url + "/apple-music/catalog/playlists/" + playlist_id + "/relationships" , true);
 xhttp.send(); // Gets the response
});
}

/*Gets attributes of a playlist on apple musics catalog, not a users library*/
async function getCatalogPlaylistAttributes(playlist_id){
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
 xhttp.open("GET", "http://" + url + "/apple-music/catalog/playlists/" + playlist_id , true);
 xhttp.send(); // Gets the response
});
}


//This will recieve a multi music format JSON
function displaySearch(search_response, source){
 //Displays albums
 var searchResults = '<h3>'+source+'</h3><hr><br>';
 var h, w, url;
 if(search_response.hasOwnProperty("albums")){
   var albums = search_response.albums.data;
   searchResults += '<h2>Albums</h2><div class="scrolling-wrapper">';

   for(var i = 0; i< albums.length; i++){
     url = albums[i].artwork;
     var artistName = albums[i].artist;
     var albumName = albums[i].title;
     var albumId = albums[i].id
     searchResults += `<div class="card" value="album" data-service="${source}" data-value="${albumId}"><img src=${url} height=100% width=100%><span class="album-artist-label">${artistName}</span><span class="album-artist-label">${albumName}</span></div>`;
   }
   searchResults += '</div><hr>';
 }
 if(search_response.hasOwnProperty("songs")){
   var songs = search_response.songs.data;
   searchResults += '<h2>Songs</h2><div class="scrolling-wrapper"><div class="song-block" ><ul class="list-group">';

   var count = 1;
   for(var i = 0; i< songs.length; i++){

     url = songs[i].artwork;
     var songName = songs[i].title;
     var songId = songs[i].id;
     searchResults += `<button type="button" class="list-group-item song-button" value="song" data-service="${source}" data-value="${songId}"><img class="song-button-img" src=${url}><span>${songName}</span></button>`;
     if(count%3==0){
       searchResults += '</ul></div><div class="song-block"><ul class="list-group">'
     }
     count++;
   }
   searchResults += '</ul></div></div><hr>';
 }
 if(search_response.hasOwnProperty("playlists")){
   var playlists = search_response.playlists.data;
   searchResults += '<h2>Playlists</h2><div class="scrolling-wrapper">';

   for(var i = 0; i< playlists.length; i++){
     url = playlists[i].artwork;
     var playlistName = playlists[i].title;
     var playlistId = playlists[i].id;
     searchResults += `<div class="card playlist-card" value="playlist" data-service="${source}" data-value="${playlistId}"><img src=${url} height=100% width=100%><span class="album-artist-label">${playlistName}</span></div>`;
   }
   searchResults += '</div><hr>';
 }
return searchResults;
}

/* This function will generate the playlist attributes display
@param playlist_attributes is a multi music json containing a single playlist's attributes
*/
function displayPlaylistAttributes(playlist_attributes, service){
 var retval = "";
 var playlistTitle = playlist_attributes.title;
 retval += `<h4>${playlistTitle}</h4>`;
 if (playlist_attributes.hasOwnProperty("artwork")) {
     var artworkDisplay = playlist_attributes.artwork;
     retval += `<a href="#"><img class='card-img-top' src="${artworkDisplay}" alt=''></a>`;
 } else{
   retval += '<a href="#"><img class="card-img-top" src="/assets/Missing_content.png" alt=""></a>';
 }
 retval += '<div style="text-align:left">';
 if (playlist_attributes.hasOwnProperty("description")){
   var playlistDescription = playlist_attributes.description;
   retval += `<h7>"${playlistDescription}"</h7>`;
 }
 retval += '</div>';
 retval += `<button id="playlist-convert" data-value='${playlist_attributes.id}' data-service='${service}' type="button" class="btn btn-primary" style="text-align: center;">Convert Playlist</button>`;
 retval += '<div id="convert-link"> </div>';
 return retval;
}


/* This function will generate the playlist tracks display
@param playlist_tracks is a multi music json containing a list of all the tracks belonging to a playlist
*/
function displayPlaylistTracks(playlist_tracks){
 var retval = "";
 var title, artist, sondId,url;
 retval += '<ul class="list-group">';
 for(var i = 0; i< playlist_tracks.length; i++){
   title = playlist_tracks[i].title;
   artist = playlist_tracks[i].artist;
   songId = playlist_tracks[i].id;
   if(playlist_tracks[i].hasOwnProperty("artwork")){
     url = playlist_tracks[i].artwork;

   } else {
     url = "/assets/Missing_content.png";
   }
   retval += `<button type="button" class="list-group-item song-button" value="song" data-value="${songId}"><img class="song-button-img" src=${url}><span>${title}</span>&emsp;<span>${artist}</span></button>`;
 }
 retval += "</div>";
 return retval;
}

/*
* Function displays the users playlists library on the left hand side of the screen
* @playlists is a multi music json containing a list of user playlist's
*/
function displayPlaylistLibrary(playlists, service){
  var cloudPlaylists = JSON.parse(playlists).playlists;
  var retval = `<h5>${service} Playlists</h5>`;
  for(var i =0; i < cloudPlaylists.length; i++){
    var playlistName = cloudPlaylists[i].title;
    var playlist_id = cloudPlaylists[i].id;

    retval += `<button class="list-group-item playlist-button" data-service="${service}" data-value="${playlist_id}" >${playlistName}</button>`; //Each button includes playlist id
  }
  return retval;
}

/*
@id is a unique id of the Content
@type is album, song, artist, playlist...
*/
function applePlay(id, contentType){
 console.log(id, contentType);
 music.setQueue({[contentType]: id });
}

/*
will convert playlist from current_service to new_service
* @playlist_id is the id of the playlist
* @current_service is the current service of the playlist Apple Music or Spotify
* @catalog is a boolean 1 it will search the catalog 0 will search the library
*/
async function convertPlaylist(playlist_id, current_service, mm_playlist_id, playlist_name){
 var new_sercie;
 if(current_service == "Apple Music"){
   new_service = "Spotify";
   try {
     var playlistTracks = await getCatalogPlaylistTracks(playlist_id);
   } catch(e) {
     console.log(e);
   }
 } else if (current_service == "Spotify"){
   new_service = "Apple Music";
   try{
     var playlistTracks = await spotifyGetPlaylistTracks(playlist_id);
   } catch(e) {
     console.log(e);
   }
 }
Promise.all([playlistTracks]).then(async function(values){
  var tracks = JSON.parse(values[0]).tracks;
  var search, track, matches, handle;
  for(var i = 0; i < tracks.length; i++){
    track = tracks[i];
    document.getElementById("convert-link").innerHTML = `<span>Loading playlist link ${i}/${tracks.length}</span>`;
    handle = await dbHasSong(track.id).then(async function(resp){
      if(resp == 'false'){
        //replace spaces with plus and get rid of special characters
        search = (removeFeatureFromSong(track.title) + "+" + track.artist).replace(/ /g, '+').replace(/&/g, "").replace(/\//g, '%2F').replace(/%/g, " ").replace(/\?/g, " ");
        if(new_service == "Spotify"){
          await spotifySearch('q=' + search + '&limit=1&type=track').then(async function(value){
            var response = JSON.parse(value);
            if(response.hasOwnProperty("songs")){
              var song_matches = response.songs.data;
              if(song_matches.length > 0){
                //add the new song to db

                await dbAddSong(encodeURIComponent(song_matches[0].title), encodeURIComponent(song_matches[0].artist), song_matches[0].id, track.id).then(async function(){
                  // console.log("added: ",new_service, song_matches[0].title, song_matches[0].artist, track.id, song_matches[0].id);
                  await dbHasSong(track.id).then(async function(resp1){
                    var response_json = JSON.parse(resp1);
                    if(response_json != false){
                      var song_id = response_json[0].song_ID;
                      // console.log("Add song:", song_id);
                      await dbAddSongToPlaylist(mm_playlist_id, song_id);
                    }
                  });
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
                await dbAddSong(encodeURIComponent(song_matches[0].title), encodeURIComponent(song_matches[0].artist), track.id, song_matches[0].id,).then(async function(){
                  // console.log("added: ",new_service, song_matches[0].title, song_matches[0].artist, song_matches[0].id, track.id)
                  await dbHasSong(track.id).then(async function(resp1){
                    var response_json = JSON.parse(resp1);
                    if(response_json != false){
                      var song_id = response_json[0].song_ID;
                      await dbAddSongToPlaylist(mm_playlist_id, song_id);
                    }

                  });
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

/*
* Queries database checking the playlist table apple playlists or spotify playlists that match @playlist_id
* @playlist_id is applemusic or spotify playlist id
*
*/
async function establishPlaylist(playlist_id, title, user_id, current_service){
     var db_playlist_id = dbPlaylistExists(playlist_id).then(response => {
       if(response == 'false'){
         if(current_service == "Apple Music"){
           dbAddPlaylist(encodeURIComponent(title), user_id, spotifyID=null, appleID=playlist_id).then(()=>{
               // console.log(title, user_id, current_service, playlist_id);
           });
         } else if (current_service == "Spotify"){
           dbAddPlaylist(encodeURIComponent(title), user_id, spotifyID=playlist_id, appleID=null).then(()=>{
             // console.log(title, user_id, current_service, playlist_id);
           });
         } else {
           console.log("Invalid Service");
         }
         dbPlaylistExists(playlist_id).then(value => {
           var mm_playlist_id = JSON.parse(value)[0].playlist_ID;
           console.log("New playlist: ", mm_playlist_id);
           convertPlaylist(playlist_id, current_service, mm_playlist_id, title);
         });
       } else {
         var mm_playlist_id = JSON.parse(response)[0].playlist_ID;
         console.log("playlist id:",mm_playlist_id);
         dbDeleteTracks(mm_playlist_id).then(()=>{
           convertPlaylist(playlist_id, current_service, mm_playlist_id,title);
         }); // delete the tracks currently associated with the playlist
       }
     });
}
