const { promisifyAll } = require('bluebird');
const redis = require('redis');

promisifyAll(redis.RedisClient.prototype);

const client = redis.createClient();
// client.select(3);

module.exports = client;
