const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');

const { PORT } = require('./constants.js');
const Auth = require('./apps/auth.js');
const App = require('./apps/app.js');

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../static')));
app.use('/', Auth);
app.use('/', App);

app.listen(PORT, () => console.log(`app started on ${PORT}`));
