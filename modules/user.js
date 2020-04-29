// var db = require('../db');
// var passwordHash = require('password-hash');
//
//
//
// exports.createNewUser = function InsertUserHandler(username, password, done){
//   var hashedPassword = passwordHash.generate(password);
//   var vlaues = [username, hashedPassword];
//     db.get().query(
//       'INSERT INTO User (username, password)' +
//       'VALUES (?)', values, function  function InsertQueryHandler(err, result){
//                   if (err)
//                       return done(err);
//                   done(null, result.insertId);
//               });
//     }
