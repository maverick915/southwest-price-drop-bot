const basicAuth = require('basic-auth');
const cookieSession = require('cookie-session');
const express = require('express');

const { USER_NAME, USER_PASSWORD } = require('../constants.js');

const app = express();

const EXPIRE = new Date('9999-12-31');
const USER_COOKIE = 'user';
const PASSWORD_COOKIE = 'password';

app.use(cookieSession({
  name: 'auth',
  keys: [ USER_COOKIE, PASSWORD_COOKIE ],
  expires: EXPIRE
}));

app.use((req, res, next) => {
  // check cookie auth
  const cookie = req.session;
  if (correctAuth(cookie[USER_COOKIE], cookie[PASSWORD_COOKIE])) return next();

  // check basic auth
  const user = basicAuth(req);
  if (user && correctAuth(user.name, user.pass)) {
    cookie[USER_COOKIE] = user.name;
    cookie[PASSWORD_COOKIE] = user.pass;
    return next();
  }

  // prompt for basic auth
  else res.set('WWW-Authenticate', 'Basic realm=Authorization Required').sendStatus(401);
});

function correctAuth (name, password) {
  return name === USER_NAME && password === USER_PASSWORD;
}

module.exports = app;
