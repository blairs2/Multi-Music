function setCookie(token, cookieName){
    document.cookie = `${cookieName}=` + token  + "; sameSite=Lax";
}

async function getCookie(name) {
  if (name != "spotifyUserToken"){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  } else {
    var expirationTime = getCookie("spotifyExpiration") || null;
    var d = new Date();
    if (expirationTime == null){ // if no expiration time return null
      return null;
    } else if (expirationTime < d.getTime()){ // if token expired
      await refreshToken(); // refresh the token
      const value = `; ${document.cookie}`; // get the new token
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
  }
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
      console.log("refresh Sent")
    });
  } else {
    Promise.resolve("no refresh token available");
  }
}