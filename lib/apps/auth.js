const basicAuth = require('basic-auth');
const express = require('express');

const { USER_NAME, USER_PASSWORD } = require('../constants.js');

const app = express();

app.all('*', (req, res, next) => {
  const user = basicAuth(req);
  if (user && user.name === USER_NAME && user.pass === USER_PASSWORD) next();
  else res.set('WWW-Authenticate', 'Basic realm=Authorization Required').sendStatus(401);
});

module.exports = app;
