function homeLoad() {
    document.getElementById("generated-content").innerHTML =
         '<div id="carouselExampleIndicators" class="carousel slide my-4" data-ride="carousel"></div>' +
         '<h2 class="my-4">Home</h2>' +
         '<div>' +
         '<h5>Discover</h5>' +
         '<div class="row">' +
         '<div class="col-lg-3 col-md-6 mb-4">' +
         '<div class="card h-100">' +
         '<a href="#"><img class="card-img-top" src="http://placehold.it/200x200" alt=""></a>' +
         '<div class="card-body">' +
            '<h4 class="card-title">' +
             '<a href="#">Playlist One</a>' +
            '</h4>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '<div class="col-lg-3 col-md-6 mb-4">' +
         '<div class="card h-100">' +
         '<a href="#"><img class="card-img-top" src="http://placehold.it/200x200" alt=""></a>' +
         '<div class="card-body">' +
            '<h4 class="card-title">' +
             '<a href="#">Playlist Two</a>' +
            '</h4>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '<div class="col-lg-3 col-md-6 mb-4">' +
         '<div class="card h-100">' +
         '<a href="#"><img class="card-img-top" src="http://placehold.it/200x200" alt=""></a>' +
         '<div class="card-body">' +
            '<h4 class="card-title">' +
             '<a href="#">Playlist Three</a>' +
            '</h4>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '</div>' ;
}

function aboutLoad() {
    document.getElementById("generated-content").innerHTML =
         '<div id="carouselExampleIndicators" class="carousel slide my-4" data-ride="carousel"></div>' +
         '<h2 class="my-4">About Us</h2>' +
         '<div>' +
         '<h5>The Software Engineers</h5>' +
         '<p>We are Seattle Pacific University graduates as of June, 2020.<br><br> ' +
         'Our team is comprised of Stone Blair, Nathan Geddis, Elizabeth Myers, and Annabel Rathmanner.' +
         '</p></div>' +
         '</div>' +
         '</div>' +
         '</div>' ;
}

function contactLoad() {
    document.getElementById("generated-content").innerHTML =
         '<div id="carouselExampleIndicators" class="carousel slide my-4" data-ride="carousel"></div>' +
         '<h2 class="my-4">Contact Us</h2>' +
         '<div>' +
         '<p>Thank you for wanting to contact us! We are unavailable at the moment.<br><br> ' +
         '</p></div>' +
         '</div>' +
         '</div>' +
         '</div>' ;
}


function playlistLoad() {
    document.getElementById("generated-content").innerHTML =
         '<div id="carouselExampleIndicators" class="carousel slide my-4" data-ride="carousel"></div>' +
         '<div>' +
         '<h4>My Music</h4>' +
         '<div class="row">' +
         '<div class="col-lg-3 col-md-6 mb-4">' +
         '<div>' +
         '<a href="#"><img class="card-img-top" src="http://placehold.it/200x200" alt=""></a>' +
         '</div>' +
         '<div style="text-align:center">' +
            '<h5>' +
             '<a href="#">Playlist One</a>' +
            '</h5><h6>Author</h6><h7>Description</h7></br></br>' +
            '<button type="button"  class="btn btn-default btn-small">Play</button>' +
            '' +
         '</div>' +
         '</div>' +
         '<div class="col-lg-4">' +
         '<div class="row">&emsp;' +
         ' <a href="#"><img class="card-img-top" src="http://placehold.it/50x50" alt=""></a> &emsp;' +
         '<h8 class="my-4">Song and Artist</h8>' +
         '</div>' +
         '<div class="row">&emsp;' +
         ' <a href="#"><img class="card-img-top" src="http://placehold.it/50x50" alt=""></a> &emsp;' +
         '<h8 class="my-4">Song and Artist</h8>' +
         '</div>' +
         '<div class="row">&emsp;' +
         ' <a href="#"><img class="card-img-top" src="http://placehold.it/50x50" alt=""></a> &emsp;' +
         '<h8 class="my-4">Song and Artist</h8>' +
         '</div>' +
          '</div>' +
         '</div>' +
         '</div>' ;
}

function makePlaylist() {
    document.getElementById("generated-content").innerHTML =
         '<div id="carouselExampleIndicators" class="carousel slide my-4" data-ride="carousel"></div>' +
         '<div>' +
         '<h4>New Playlist</h4>' +
         '<div class="row">' +
         '<div class="col-lg-3 col-md-6 mb-4">' +
         '<div>' +
         '<a href="#"><img class="card-img-top" src="http://placehold.it/200x200" alt=""></a>' +
         '</div>' +
         '</div>' +
         '<div class="col-lg-6">' +
         '<div class="row">' +
         '<input class="form-control form-control-sm ml-3 w-75" type="text" placeholder="Playlist Name" aria-label="Playlist Name"> <br><br>' +
         '<textarea rows="4" class="form-control form-control-sm ml-3 w-75" type="text" placeholder="Description" aria-label="Description"></textarea>' +
         '</div>' +
         '<p><div class="row">' +
         '&ensp;&nbsp;<button type="button" class="btn btn-default btn-small">' +
         '<span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add Song' +
         '</button>' +
         '</p></div>' +
         '<div class="row">' +
         '<div>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '</div>' ;
}

function convertPlaylist() {
    document.getElementById("generated-content").innerHTML =
         '<div id="carouselExampleIndicators" class="carousel slide my-4" data-ride="carousel"></div>' +
         '<div>' +
         '<h4>Convert Playlist</h4>' +
         '<div class="row">' +
         '<div class="col-lg-3 col-lg-6 mb-4">' +
         '<div>' +
         '<br><label for="selectPlaylist">Select Playlist</label>' +
         '<div class="dropdown">' +
         '<button class="btn btn-default dropdown-toggle" type="button" id="selectPlaylist" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
         'Select Playlist</button>' +
         '<ul class="dropdown-menu" aria-labelledby="selectPlaylist">' +
         '<li><a href="#">My Playlist</a></li>' +
         '</ul>' +
         '</div>' +
         '<br><label for="Playlist Name">Enter new playlist name:</label>' +
         '<input class="form-control form-control-sm ml-3 w-75" type="text" placeholder="Playlist Name" aria-label="Playlist Name"><br>' +
         '<input type="checkbox" id="collab" name="collab" value="Collab">' +
         '&ensp;<label for="collab">Can collaborate</label><br><br>' +
         '<input type="radio" id="AppleMusic" name="convertTo" value="AppleMusic">' +
         '&ensp;<label for="AppleMusic">Apple Music</label><br>' +
         '<input type="radio" id="SpotifyMusic" name="convertTo" value="SpotifyMusic">' +
         '&ensp;<label for="SpotifyMusic">Spotify</label><br>' +
         '<button type="button" class="btn btn-default btn-small">' +
         '<span class="glyphicon glyphicon-play" aria-hidden="true"></span> Start Conversion' +
         '</button><br>' +
         '<br><label for="PlaylistLink">Playlist Link:</label><br>' +
         '<textarea rows="1" style="resize:none" class="form-control form-control-sm ml-3 w-75" type="text" aria-label="PlaylistLink"></textarea>' +
         '</div>' +
         '</div>' +
         '<div class="col-lg-3 col-md-6 mb-4">' +
         '<div>' +
         '<a href="#"><img class="card-img-top" src="http://placehold.it/200x200" alt=""></a>' +
         '</div>' +
         '<div style="text-align:center">' +
            '<h5>' +
             '<a href="#">Playlist One</a>' +
            '</h5><h6>Author</h6><h7>Description</h7></br></br>' +
         '</div>' +
         '</div>' +
         '</div>' +
         '</div>' ;
}

function toggleAppleLogo() {
   var x = document.getElementById("appleLogo");
   if (x.getAttribute("src") == "assets/APPLEMUSICLOGOBW.png") { //Log in
      appleLogin();
      location.reload();
      // x.setAttribute("src", "assets/APPLEMUSICLOGO.png");
      // x.setAttribute("title", "Log out of Apple Music");
   }
   else { //Log out
      deleteCookie("appleUserToken");
      location.reload();
      // x.setAttribute("src", "assets/APPLEMUSICLOGOBW.png");
      // x.setAttribute("title", "Login to Apple Music");
   }
}

function toggleSpotifyLogo() {
   var x = document.getElementById("spotifyLogo");
   if (x.getAttribute("src") == "assets/SPOTIFYLOGOBW.png") {//log in
     spotifyLogin(); //will route user to back to home page after they log in
     // x.setAttribute("src", "assets/SPOTIFYLOGO.png");
     // x.setAttribute("title", "Log out of Spotify");
   }
   else {//log out
      deleteCookie("spotifyUserToken");
      x.setAttribute("src", "assets/SPOTIFYLOGOBW.png");
      x.setAttribute("title", "Login to Spotify");
   }
}
