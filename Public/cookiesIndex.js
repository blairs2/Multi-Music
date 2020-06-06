function setCookie(token, cookieName){
    document.cookie = `${cookieName}=` + token  + "; sameSite=Lax";
}

function getCookie(name) {
  if (name != "spotifyUserToken"){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  } else {
    var expirationTime = getCookie("spotifyExpiration") || null;
    var d = new Date();
    if (expirationTime != null && expirationTime < d.getTime()){
      return null;
    } else {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
  }
}

