
// listen for MusicKit Loaded callback

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
  });
});

document.getElementById('login-btn').addEventListener('click', () => {
  //Returns a promise which resolves with a music-user-token when a user successfully authenticates and authorizes
  music.authorize().then(musicUserToken => {
    addAppleMusicUserToken(musicUserToken); // Here we want to call a function to add the musicUserToken to our database
  });


  retreiveUserPlaylists(); //Populates the left hand side of screen with all the playlsits in the users library
});

document.getElementById('search-input').addEventListener("keyup", function(event){
  //When user clicks enter in our search bar
   var searchTerm = (document.getElementById('search-input').value).replace(/ /g, '+'); // '/ /g' is a regular expression that replaces all space instances with '+'
   if (event.keyCode === 13) { //on enter key
     console.log('enter');
     searchByTerm("term=" + searchTerm + "&limit=10&types=songs,albums,playlists"); //Search for the users input
     // searchByTerm("term=" + searchTerm); //Search for the users input
   }else{
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
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
      //This block of code generates the list of playlists on the left hand side of the screen
      var cloudPlaylists = JSON.parse(this.responseText).data;
      var retval = '';
      for(var i =0; i < cloudPlaylists.length; i++){
        console.log(cloudPlaylists[i]);
        var playlistName = cloudPlaylists[i].attributes.name;
        var playlist_id = cloudPlaylists[i].id;

        retval += `<button class="list-group-item playlist-button" data-id="${playlist_id}" >${playlistName}</button>`; //Each button includes playlist id
      }
      document.getElementById('user-playlists').innerHTML = retval;
      var user_playlists = document.getElementsByClassName("playlist-button");
      //Add event listener to each playlist.
      //Clicking on a playlists will trigger two GET requests. One gives attributes of library playlist, two gives tracks of library playlist
      for (var i = 0; i < user_playlists.length; i++) {
         user_playlists[i].addEventListener('click', function() {
           getPlaylistAttributes(this.getAttribute("data-id"));
           getPlaylistTracks(this.getAttribute("data-id"));
            },false);
       }
    }
  };
  xhttp.open("GET", "http://localhost:8080/apple-music/library/playlists", true);
  // xhttp.setRequestHeader('music-user-token:', music_user_token);
  xhttp.send(); // Gets the response
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
  xhttp.open("GET", "http://localhost:8080/apple-music/library/songs", true);
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
 xhttp.open("GET", "http://localhost:8080/apple-music/library/artists", true);
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
  xhttp.open("GET", "http://localhost:8080/apple-music/library/albums", true);
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
  xhttp.open("GET", "http://localhost:8080/apple-music/catalog/search/hints/" + searchTerm, true);
  xhttp.send(); // Gets the response
 }

//Gets an individual playlist by id.
//Buttons for each playlist's are generated when retrieveUserPlaylsits() is run. Each playlist button has the corresponding id attached
function retirevePlaylist(playlist_id){
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response

      }
    };
    xhttp.open("GET", "http://localhost:8080/apple-music/library/playlists/" + playlist_id, true);
    xhttp.send(); // Gets the response
   }

//seperate from retrievePlaylist which gets the information about the playlist.
//This function gets the tracks that are in the playlist
function retrievePlaylistTracks(playlist_id){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response

    }
  };
  xhttp.open("GET", "http://localhost:8080/apple-music/library/playlists/"+ playlist_id +"/relationships", true);
  xhttp.send(); // Gets the response
}

//Searches for term across every catagory
function searchByTerm(searchTerm){
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function ReceivedCallback() {
     if (this.readyState == 4 && this.status == 200) { //Upon getting a response
       document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(this.responseText));
       var song_elements = document.getElementsByClassName("song-button");
       var elements = document.getElementsByClassName("card");

      for (var i = 0; i < song_elements.length; i++) {
          console.log(song_elements[i].value);
          song_elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
      }
      for (var i = 0; i < elements.length; i++) {
          elements[i].addEventListener('click', function() { applePlay(this.getAttribute("data-value"), this.getAttribute("value")); },false);
      }

     }
   };
   xhttp.open("GET", "http://localhost:8080/apple-music/catalog/search/" + searchTerm, true);
   xhttp.send(); // Gets the response
  }

//////////////////////////////
//POST functions
/////////////////////////////

//Creates a new empty playlist
function addPlaylist(playlist_name, description){
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function ReceivedCallback() {
     if (this.readyState == 4 && this.status == 200) { //Upon getting a response
       // console.log(JSON.parse(this.responseText));

          // document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(this.responseText));
     }
   };
   xhttp.open("POST", "http://localhost:8080/apple-music/library/playlist", true);
   xhttp.send(); // Gets the response
  }

function addTrackToPlaylist(playlist_id){
     var xhttp = new XMLHttpRequest();
     xhttp.onreadystatechange = function ReceivedCallback() {
       if (this.readyState == 4 && this.status == 200) { //Upon getting a response
         // console.log(JSON.parse(this.responseText));

            // document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(this.responseText));
       }
     };
     xhttp.open("POST", "http://localhost:8080/apple-music/library/" + playlist_id + "/playlist", true);
     xhttp.send(); // Gets the response
}

function addAppleMusicUserToken(musicUserToken){
  //Will add musicUserToken to db
  console.log(musicUserToken);
}


function getPlaylistTracks(playlist_id){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
      console.log(JSON.parse(this.responseText));

    }
  };
  xhttp.open("GET", "http://localhost:8080/apple-music/library/playlists/" + playlist_id + "/relationships" , true);
  xhttp.send(); // Gets the response
}

function getPlaylistAttributes(playlist_id){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
      console.log(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "http://localhost:8080/apple-music/library/playlists/" + playlist_id , true);
  xhttp.send(); // Gets the response
}

//This will recieve a multi music format JSON

function displaySearch(search_response){
  //Displays albums
  var searchResults = '';
  var h, w, url;
  if(search_response.hasOwnProperty("albums")){
    var albums = search_response.albums.data;
    searchResults += '<h2>Albums</h2><div class="scrolling-wrapper">';
    for(var i = 0; i< albums.length; i++){
      url = albums[i].artwork;
      var artistName = albums[i].artist;
      var albumName = albums[i].title;
      var albumId = albums[i].id
      searchResults += `<div class="card" value="album" data-value="${albumId}"><img src=${url} height=100% width=100%><span class="album-artist-label">${artistName}</span><span class="album-artist-label">${albumName}</span></div>`;
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
      searchResults += `<button type="button" class="list-group-item song-button" value="song" data-value="${songId}"><img class="song-button-img" src=${url}><span>${songName}</span></button>`;
      if(count%3==0){
        searchResults += '</ul></div><div class="song-block"><ul class="list-group">'
      }
      count++;
    }
    searchResults += '</ul></div></div><hr>';
  }
  if(search_response.hasOwnProperty("playlists")){
    var playlists = search_response.playlists.data;
    searchResults += '<h2>PLaylists</h2><div class="scrolling-wrapper">';
    for(var i = 0; i< playlists.length; i++){
      url = playlists[i].artwork;
      var playlistName = playlists[i].title;
      var playlistId = playlists[i].id;
      searchResults += `<div class="card" value="playlist" data-value="${playlistId}"><img src=${url} height=100% width=100%><span class="album-artist-label">${playlistName}</span></div>`;
    }
    searchResults += '</div><hr>';
  }
return searchResults;
}

function displayPlaylist(playlist_id){
  //Triggers two get requests
  //One has playlist's attributes
  //second has tracks in playlist
  var playlist_attributes = retirevePlaylist(playlist_id); //
  var playlist_tracks = retrievePlaylistTracks(playlist_id);
  // console.log(playlist_tracks);
  // console.log(playlist_attributes);
}

/*
@id is a unique id of the Content
@type is album, song, artist, playlist...
*/
function applePlay(id, contentType){
  console.log(id, contentType);
  music.setQueue({[contentType]: id }).then(music.play());
}



// login to spotify button
document.getElementById("login-spotify").onclick = function(){
  console.log("CLICK");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Typical action to be performed when the document is ready:    }
      xhttp.open("GET", "http://localhost:8080/spotify/login", true);
      xhttp.send();
      console.log(xhttp.responseText);
      var access_token = "";
      getUserPlaylists(access_token);
  }
}};

