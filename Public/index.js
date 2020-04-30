// listen for MusicKit Loaded callback
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
        build: '1978.4.1'
      }
    });

    // expose our instance globally for testing
    window.music = music;
  });
});

document.getElementById('login-btn').addEventListener('click', () => {
  /***
    Returns a promise which resolves with a music-user-token when a user successfully authenticates and authorizes
    https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992701-authorize
  ***/
  music.authorize().then(musicUserToken => {
    console.log(`Authorized, music-user-token: ${musicUserToken}`);
  });

  retreiveUserPlaylsits();
});

document.getElementById('search-input').addEventListener("keyup", function(event) {
   var searchTerm = (document.getElementById('search-input').value).replace(' ', '+');
   if (event.keyCode === 13) { //on enter key
     console.log('enter');
     searchByTerm(searchTerm);
   }else{
     retrieveSearchHints(searchTerm);//Creates suggestions as user is typing
   }
});

function retreiveUserPlaylsits(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
      var cloudPlaylists = JSON.parse(this.responseText).data;
      var retval = '';
      for(var i =0; i < cloudPlaylists.length; i++){
        console.log(cloudPlaylists[i]);
        var playlistName = cloudPlaylists[i].attributes.name;
        var playlist_id = cloudPlaylists[i].id;
        retval += `<button class="list-group-item" class='playlist-button' onclick="retirevePlaylist('${playlist_id}')" >${playlistName}</button>`;
      }
      document.getElementById('user-playlists').innerHTML = retval;
    }
  };
  xhttp.open("GET", "http://localhost:8080/library/playlists", true);
  // xhttp.setRequestHeader('music-user-token:', music_user_token);
  xhttp.send(); // Gets the response
}


function retrieveSearchHints(searchTerm){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function ReceivedCallback() {
    if (this.readyState == 4 && this.status == 200) { //Upon getting a response
         // document.getElementById("generated-content").innerHTML = displayPlaylist(JSON.parse(this.responseText));
    }
  };
  xhttp.open("GET", "http://localhost:8080/search/apple-music/hints/" + searchTerm, true);
  // xhttp.setRequestHeader('music-user-token:', music_user_token);
  xhttp.send(); // Gets the response
 }

function retirevePlaylist(playlist_id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function ReceivedCallback() {
      if (this.readyState == 4 && this.status == 200) { //Upon getting a response
           // document.getElementById("generated-content").innerHTML = displayPlaylist(JSON.parse(this.responseText));
      }
    };
    xhttp.open("GET", "http://localhost:8080/library/playlists/" + playlist_id, true);
    // xhttp.setRequestHeader('music-user-token:', music_user_token);
    xhttp.send(); // Gets the response
   }


function searchByTerm(searchTerm){
     var xhttp = new XMLHttpRequest();
     xhttp.onreadystatechange = function ReceivedCallback() {
       if (this.readyState == 4 && this.status == 200) { //Upon getting a response
         console.log(JSON.parse(this.responseText));
            // document.getElementById("generated-content").innerHTML = displaySearch(JSON.parse(this.responseText));
       }
     };
     xhttp.open("GET", "http://localhost:8080/search/apple-music/" + searchTerm, true);
     xhttp.send(); // Gets the response
    }

    // function displaySearch(searchResults){
    // var result_ordering = searchResults.meta.results.order;
    // var retval =
    // for(var i =0; i<result_ordering.length; i++){
    //   if(result_ordering[i]=='Albums'){
    //     retval += displaySearchAlbums(searchResults.results.albums);
    //   } else if(results_ordering[i]=='Songs'){
    //     retval += displaySearchSongs(searchResults.results.songs);
    //   }
    //
    // }
    // //write html  to display the results
    //  // div for songs
    //  // div for albums
    //  // div for artist
    //  // div for ...
    // }
    //
    // function displaySearchSongs(songs){
    //   retval = "<div class='row'>"
    //   for(var i =0; i<songs.length;i++){
    //     retval += "<div class='row'>"
    //     + "<button>"
    //
    //   }
    // }
