const cookieSession = require('cookie-session');
const express = require('express');

const { ADMIN_NAME, PASSWORD } = require('../constants.js');
const render = require('../render.js');

const app = express();

const EXPIRE = new Date('9999-12-31');
const USER_COOKIE = 'user';
const PASSWORD_COOKIE = 'password';

app.use(cookieSession({
  name: 'auth',
  keys: [ USER_COOKIE, PASSWORD_COOKIE ],
  expires: EXPIRE
}));

app.get('/sign-out', (req, res) => {
  setAuthCookie(req, null, null);
  res.status(303).location('/sign-in').end();
});

app.get('/sign-in', (req, res) => {
  if (authenticate(req)) res.status(303).location('/').end();
  else res.send(render('sign-in', req));
});

app.post('/sign-in', (req, res) => {
  setAuthCookie(req, req.body.user, req.body.password);
  if (authenticate(req)) res.status(303).location('/').end();
  else res.send(render('sign-in', req, { error: true }));
});

app.use((req, res, next) => {
  if (authenticate(req)) next();
  else res.status(303).location('/sign-in').end();
});

function authenticate (req) {
  const cookie = req.session;
  const user = cookie[USER_COOKIE];
  const password = cookie[PASSWORD_COOKIE];
  req.auth = { user, isAdmin: user === ADMIN_NAME };

  if (user && password === PASSWORD) {
    return true;
  } else {
    setAuthCookie(req, null, null);
    return false;
  }
}

function setAuthCookie (req, user, password) {
  const cookie = req.session;
  cookie[USER_COOKIE] = user;
  cookie[PASSWORD_COOKIE] = password;
}

module.exports = app;
