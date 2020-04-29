
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


    // document.getElementById('login-btn').addEventListener('click', () => {
      /***
        Returns a promise which resolves with a music-user-token when a user successfully authenticates and authorizes
        https://developer.apple.com/documentation/musickitjs/musickit/musickitinstance/2992701-authorize
      ***/
      music.authorize().then(musicUserToken => {
        console.log(`Authorized, music-user-token: ${musicUserToken}`);
      });

      music.authorize().then(function() {
        music.api.library.playlists().then(function(cloudPlaylists) {
          var retval = '';
          for(var i =0; i < cloudPlaylists.length; i++){
            console.log(cloudPlaylists[i]);
            var playlistName = cloudPlaylists[i].attributes.name;
            var playlist_id = cloudPlaylists[i].id;
            retval += `<button class='playlist-button' onclick="clickOnPlaylist('${playlist_id}')" >${playlistName}</button>`;
          }
          document.getElementById('user-playlists').innerHTML = retval;
      });
    });
  // });
    // expose our instance globally for testing
    window.music = music;
  });


});


function clickOnPlaylist(playlist_id){

  music.authorize().then(function() {
    music.api.library.playlist(playlist_id).then(function(playlist) {
        window.history.pushState('', 'Title', playlist.href);

        console.log(playlist);
      });
    });

}

function displayPlaylist(playlist){


}

// function populatePlaylistLibrary(){
//   var xhttp = new XMLHttpRequest();
// 	xhttp.onreadystatechange = function ReceivedCallback() {
// 		if (this.readyState == 4 && this.status == 200) {
// 			document.getElementById("generated-content").innerHTML = createPlayListLayout(JSON.parse(this.responseText));
// 		}
// 	};
// 	xhttp.open("GET", "http://localhost/library/playlist-library", true);
// 	xhttp.send();
// }
//
// function createPlayListLayout(playlists_metadata){
//   var retval = '<h5>Playlist Library</h5>' +
//   '<div class="row">'+
//     '<div class="col-lg-4 col-md-6 mb-4">' +
//       '<div class="card h-100">';
//   for(var i in playlists_metadata){
//
//     retval += `<a href="#"><img class="card-img-top" src=${img} alt=""></a>`;
//   }
//
//         <div class="card-body">
//           <h4 class="card-title">
//             <a href="#">Playlist One</a>
//           </h4>
//         </div>
//       </div>
//     </div>
//
// }

document.getElementById('playlist-btn').addEventListener("click", () => {
  console.log(music.api.library);
  var promise = music.api.library.playlists();
  var promise2 = music.api.library.playlist('p.V7VYpJNcvW3QrM');
  console.log(promise);
  var searchResults = '<table style="width:100%"><tr><th>Playlists</th></tr><tr>';


  // promise.then(function(result) {
  //   console.log(result.albums.data[1]);
  //   console.log(result.songs.data[1]);
  //   var songData = result.songs.data;
  //
  //   console.log(songData.length);
  //
  //   for(var i = 0; i< songData.length; i++){
  //     var h = songData[i].attributes.artwork.height;
  //     var w = songData[i].attributes.artwork.width;
  //
  //     var url = (songData[i].attributes.artwork.url).replace('{w}', w).replace('{h}',h);
  //     console.log(url);
  //     searchResults += `<tr><td><img src=${url} height=100 width=100></td>`;
  //     searchResults += `<<td>${songData[i].attributes.name}</td>`;
  //     searchResults += `<td>${songData[i].id}</td></tr>`;
  //
  //   }
  //   searchResults += '</tr></table>';
  //   document.getElementById("generated-content").innerHTML = searchResults;
// });

});

document.getElementById('search-input').addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    var search = document.getElementById('search-input').value;
    console.log(search);
    var promise = music.api.search(search);
    console.log(promise);
    var searchResults = '<table style="width:100%"><tr><th>Song</th></tr><tr>';

    promise.then(function(result) {
      console.log(result.albums.data[1]);
      console.log(result.songs.data[1]);
      var songData = result.songs.data;

      console.log(songData.length);

      for(var i = 0; i< songData.length; i++){
        var h = songData[i].attributes.artwork.height;
        var w = songData[i].attributes.artwork.width;

        var url = (songData[i].attributes.artwork.url).replace('{w}', w).replace('{h}',h);
        console.log(url);
        searchResults += `<tr><td><img src=${url} height=100 width=100></td>`;
        searchResults += `<<td>${songData[i].attributes.name}</td>`;
        searchResults += `<td>${songData[i].id}</td></tr>`;

      }
      searchResults += '</tr></table>';
      document.getElementById("generated-content").innerHTML = searchResults;
  });

  }
});
