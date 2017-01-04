const basicAuth = require('basic-auth');
const express = require('express');

const { ADMIN_NAME, ADMIN_PASSWORD } = require('../constants.js');

const app = express();

app.all('*', (req, res, next) => {
  const user = basicAuth(req);
  if (user && user.name === ADMIN_NAME && user.pass === ADMIN_PASSWORD) next();
  else res.set('WWW-Authenticate', 'Basic realm=Authorization Required').sendStatus(401);
});

module.exports = app;
