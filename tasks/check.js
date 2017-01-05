require('dotenv').config({ silent: true });

const redis = require('../lib/redis.js');
const Alert = require('../lib/bot/alert.js');

const COOLDOWN = 23.5 * 60 * 60; // only send a max of one text every 24 hours

(async () => {
  try {
    const keys = await redis.keysAsync('alert.*');
    const values = keys.length ? await redis.mgetAsync(keys) : [];
    console.log(`#####\nchecking ${values.length} flights`);
    const promises = values
      .map(async data => {
        const alert = new Alert(data);
        const flight = `${alert.date.toLocaleDateString()} #${alert.number} ${alert.from} => ${alert.to}`;

        if (alert.date < Date.now()) {
          console.log(`${flight} expired, deleting`);
          redis.delAsync(alert.key());
          return;
        }

        const cooldownKey = alert.key('cooldown');
        const cooldown = await redis.existsAsync(cooldownKey);
        if (cooldown) {
          console.log(`${flight} on cooldown, skipping`);
          return;
        }

        await alert.getPrice();
        if (alert.latestPrice < alert.price) {
          console.log(`${flight} dropped to $${alert.latestPrice}`);
          await alert.sendSms();
          await redis.setAsync(cooldownKey, '');
          await redis.expireAsync(cooldownKey, COOLDOWN);
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
