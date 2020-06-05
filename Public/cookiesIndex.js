function setCookie(token, cookieName){
    document.cookie = `${cookieName}=` + token  + "; sameSite=Lax";
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function deleteCookie(name) {
 document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
