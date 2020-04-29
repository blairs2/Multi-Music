#!/usr/bin/env node
const express = require('express');
const app = express();
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT, 10) || 8080;
const publicDir =  __dirname + '/public';
const path = require('path');

// library for signing tokens
const jwt = require('jsonwebtoken');
const fs = require('fs');

// respond with displaying homepage (index.html) when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.sendFile(path.join(publicDir, '/index.html'));
});

const private_key = fs.readFileSync('apple_private_key.p8').toString(); // read your private key
const team_id = 'J3P2DY3RZZ';
const key_id = '968VB2ATHG';
const token = jwt.sign({}, private_key, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: team_id,
  header: {
    alg: 'ES256',
    kid: key_id
  }
});


app.get('/token', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({token: token}));
});


app.use(express.static(publicDir));

console.log('Listening at', publicDir, hostname, port);
app.listen(port, hostname);
