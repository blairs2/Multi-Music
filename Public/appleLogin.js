
function appleLogin(){  
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
    //Returns a promise which resolves with a music-user-token when a user successfully authenticates and authorizes
    //Then it sets the appleUserToken cookie for our site
    music.authorize().then(musicUserToken => {

      alert("Successfully signed in to Apple Music");
      setCookie(musicUserToken, "appleUserToken")
    });
  });
}
