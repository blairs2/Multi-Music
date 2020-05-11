
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
   var searchTerm = (document.getElementById('search-input').value).replace(' ', '+');
   if (event.keyCode === 13) { //on enter key
     console.log('enter');
     searchByTerm(searchTerm); //Search for the users input
   }else{
     retrieveSearchHints(searchTerm); //Creates suggestions as user is typing
   }
});

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
        retval += `<button class="list-group-item" class='playlist-button' onclick="retirevePlaylist('${playlist_id}')" >${playlistName}</button>`; //Each button includes playlist id
      }
      document.getElementById('user-playlists').innerHTML = retval;
    }
  };
  xhttp.open("GET", "http://localhost:8080/library/playlists", true);
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
  xhttp.open("GET", "http://localhost:8080/library/songs", true);
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
 xhttp.open("GET", "http://localhost:8080/library/artists", true);
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
  xhttp.open("GET", "http://localhost:8080/library/albums", true);
  xhttp.send(); // Gets the response
 }

//As the user is typing into the search bar. this will fetch search hits for the drop down
function retrieveSearchHints(searchTerm){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
         //Code to change the generated-content inner html

    }
  };
  xhttp.open("GET", "http://localhost:8080/search/apple-music/hints/" + searchTerm, true);
  xhttp.send(); // Gets the response
 }

//Gets an individual playlist by id.
//Buttons for each playlist's are generated when retrieveUserPlaylsits() is run. Each playlist button has the corresponding id attached
function retirevePlaylist(playlist_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4 && this.status == 200) { //Upon getting a response
          //Code to change the generated-content inner html
      }
    };
    xhttp.open("GET", "http://localhost:8080/library/playlists/" + playlist_id, true);
    xhttp.send(); // Gets the response
   }

//Searches for term across every catagory
function searchByTerm(searchTerm){
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function ReceivedCallback() {
     if (this.readyState == 4 && this.status == 200) { //Upon getting a response
       document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(this.responseText));
     }
   };
   xhttp.open("GET", "http://localhost:8080/search/apple-music/" + searchTerm, true);
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
   xhttp.open("POST", "http://localhost:8080/library/playlist", true);
   xhttp.send(); // Gets the response
  }

function addAppleMusicUserToken(musicUserToken){
  console.log(musicUserToken);
}

function displaySearch(search_response){
  //Displays albums
  var searchResults = '<h2>Albums</h2><div class="scrolling-wrapper">';
  var albums = search_response.results.albums.data;
  for(var i = 0; i< albums.length; i++){
    var h = albums[i].attributes.artwork.height;
    var w = albums[i].attributes.artwork.width;
    var url = (albums[i].attributes.artwork.url).replace('{w}', w).replace('{h}',h);
    var artistName = albums[i].attributes.artistName;
    var albumName = albums[i].attributes.name;
    searchResults += `<div class="card"><img src=${url} height=100% width=100%><span class="album-artist-label">${artistName}</span><span class="album-artist-label">${albumName}</span></div>`;
  }
  searchResults += '</div><hr></h5> <h2>PLaylists</h2><div class="scrolling-wrapper">';

  var playlists = search_response.results.playlists.data;
  for(var i = 0; i< playlists.length; i++){
    var h = playlists[i].attributes.artwork.height;
    var w = playlists[i].attributes.artwork.width;
    var url = (playlists[i].attributes.artwork.url).replace('{w}', w).replace('{h}',h);
    var playlistName = playlists[i].attributes.name;
    searchResults += `<div class="card"><img src=${url} height=100% width=100%><span class="album-artist-label">${playlistName}</span></div>`;
  }
  searchResults += '</div><hr>';
return searchResults;
}

    function displaySearchSongs(songs){
      retval = "<div class='row'>"
      for(var i =0; i<songs.length;i++){
        retval += "<div class='row'>"
        + "<button>"

      }
    }

    function q_and_play(song_id){
      console.log('called');
      const typeInput = 'song';

/***
  Add an item to the playback queue
  https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992716-setqueue
***/
      music.setQueue({
        [typeInput]: song_id
      });

      music.play();
    }
