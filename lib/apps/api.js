const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send({ yolo: 'swag' });
});

module.exports = app;
