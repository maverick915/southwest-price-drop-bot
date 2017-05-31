require('dotenv').config({ silent: true });

const redis = require('../lib/redis.js');
const Alert = require('../lib/bot/alert.js');
const sms = require('../lib/bot/send-sms.js');

const COOLDOWN = 3 * 24 * 60 * 60; // max one text every 3 days

(async () => {
  try {
    const basePath = await redis.getAsync('__BASE_PATH');
    if (!basePath) throw Error('__BASE_PATH is not set in redis');

    const keys = await redis.keysAsync('alert.*');
    const values = keys.length ? await redis.mgetAsync(keys) : [];
    console.log(`checking ${values.length} flights`);
    const promises = values
      .map(data => new Alert(data))
      .sort((a, b) => a.date - b.date)
      .map(async alert => {
        const flight = `${alert.formattedDate} #${alert.number} ${alert.from} → ${alert.to}`;

        // delete alert if in past
        if (alert.date < Date.now()) {
          console.log(`${flight} expired, deleting`);
          redis.delAsync(alert.key());
          return;
        }

        // skip sms message if alert is on cooldown
        const cooldownKey = alert.key('cooldown');
        const cooldown = await redis.existsAsync(cooldownKey);

        // get current price
        await alert.getLatestPrice();
        await redis.setAsync(alert.key(), alert.toJSON());

        // send message if cheaper
        const less = alert.price - alert.latestPrice;
        if (less > 0) {
          console.log(`${flight} dropped $${less} to $${alert.latestPrice}${cooldown ? ' (on cooldown)' : ''}`);
          if (sms.enabled && !cooldown) {
            const noProtocolPath = basePath.substr(basePath.indexOf('://') + 3);
            const message = [
              `Deal alert! Southwest flight #${alert.number} `,
              `from ${alert.from} to ${alert.to} on ${alert.formattedDate} `,
              `has dropped $${less} to $${alert.latestPrice}.`,
              `\n\nOnce you re-book your flight, tap this link to lower your alert threshold accordingly: `,
              `${noProtocolPath}/${alert.id}/change-price?price=${alert.latestPrice}`
            ].join('');
            await sms.sendEmail(message);
            await redis.setAsync(cooldownKey, '');
            await redis.expireAsync(cooldownKey, COOLDOWN);
          }
        } else {
          console.log(`${flight} not cheaper`);
        }
      });

    await Promise.all(promises);
    redis.quit();
  } catch (e) {
    console.log(e);
    redis.quit();
  }
})();
