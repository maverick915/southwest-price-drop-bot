const { promisifyAll } = require('bluebird');
const redis = require('redis');

const { DEVELOPMENT, REDIS_URL } = require('./constants.js');

promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient(REDIS_URL);
if (DEVELOPMENT) client.select(3);

module.exports = client;
