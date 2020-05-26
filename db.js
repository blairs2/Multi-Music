
var mysql = require('mysql');

var pool;

//Configure database
exports.connect = function ConnectionHandler(done){
    pool = mysql.createPool({
        host: ,
        user: ,
        password: ,
        database:
    });
    done();
}

exports.get = function GetHandler(){
    return pool;
}
