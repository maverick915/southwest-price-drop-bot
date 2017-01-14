const express = require('express');
const path = require('path');
const pug = require('pug');

const { ADMIN_NAME, ADMIN_PASSWORD } = require('../constants.js');
const redis = require('../redis.js');
const Alert = require('../bot/alert.js');
const sms = require('../bot/send-sms.js');

const app = express();

// PERSIST BASE URL
app.use((req, res, next) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const credentials = [ ADMIN_NAME, ADMIN_PASSWORD ].map(encodeURIComponent).join(':');
  const basePath = `${protocol}://${credentials}@${host}`;
  redis.setAsync('__BASE_PATH', basePath);
  next();
});

// LIST
app.get('/', async (req, res) => {
  const keys = await redis.keysAsync('alert.*');
  const values = keys.length ? await redis.mgetAsync(keys) : [];
  const alerts = values
    .map(v => new Alert(v))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  res.send(render('list', { alerts }));
});

// CREATE
app.post('/', async (req, res) => {
  const alert = new Alert(req.body);
  const key = alert.key();
  const exists = Boolean(await redis.existsAsync(key));

  if (exists) {
    res.status(303).location(`/${alert.id}`).end();
  } else {
    await redis.setAsync(key, alert.value());
    res.status(303).location(`/${alert.id}`).end();
    if (sms.enabled) {
      const message = [
        `✈ Alert created for Southwest flight #${alert.number} from `,
        `${alert.from} to ${alert.to} on ${alert.dateString}. `,
        `We'll text you if the price drops below $${alert.price}.`
      ].join('');
      sms.sendSms(alert.phone, message);
    }
  }
});

// EDIT
app.get('/:id/edit', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  const alert = new Alert(data);
  res.send(render('edit', { alert }));
});

// UPDATE
app.post('/:id', async (req, res) => {
  const alert = new Alert(Object.assign({}, req.body, { id: req.params.id }));
  await redis.setAsync(alert.key(), alert.value());
  res.status(303).location(`/${alert.id}`).end();
});

// DELETE
app.get('/:id/delete', async (req, res) => {
  await redis.delAsync(`alert.${req.params.id}`);
  res.status(303).location('/').end();
});

// NEW
app.get('/new', async (req, res) => {
  res.send(render('new'));
});

// SHOW
app.get('/:id', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  const alert = new Alert(data);
  res.send(render('show', { alert }));
});

// CHANGE PRICE
app.get('/:id/change-price', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  const alert = new Alert(data);
  alert.data.price = parseInt(req.query.price, 10);
  await redis.setAsync(alert.key(), alert.value());
  await redis.delAsync(alert.key('cooldown'));
  res.send(render('show', { alert }));
});

function render (view, vars) {
  const file = path.resolve(__dirname, '../views', `${view}.pug`);
  return pug.renderFile(file, vars);
}

module.exports = app;
