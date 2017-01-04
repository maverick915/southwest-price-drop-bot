require('dotenv').config({ path: '../.env' });

const redis = require('../lib/redis.js');
const Alert = require('../lib/bot/alert.js');

(async () => {
  try {
    const keys = await redis.keysAsync('*');
    const values = keys.length ? await redis.mgetAsync(keys) : [];
    console.log(`#####\nchecking ${values.length} flights`);
    const alerts = values.map(v => new Alert(v));
    await Promise.all(alerts.map(a => a.getPrice()));

    alerts.forEach(async (alert) => {
      const flight = `${alert.date} #${alert.number} ${alert.from} => ${alert.to}`;
      if (alert.latestPrice < parseInt(alert.price)) {
        console.log(`${flight} dropped to $${alert.latestPrice}`);
        const res = await alert.sendSms();
      } else {
        console.log(`${flight} not cheaper`);
      }
    });

    redis.quit();
  } catch (e) {
    console.log(e);
  }
})();
