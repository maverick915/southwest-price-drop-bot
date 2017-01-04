const hash = require('object-hash');

const { getPriceForFlight } = require('./get-price.js');
const sms = require('./send-sms.js');

class Alert {

  constructor (data) {
    this.data = typeof data === 'string' ? JSON.parse(data) : data;
    Object.assign(this, this.data);
  }

  key () {
    return hash(this.data);
  }

  value () {
    return JSON.stringify(this.data);
  }

  async getPrice () {
    this.latestPrice = await getPriceForFlight(this);
    return this.latestPrice;
  }

  async sendSms () {
    if (sms.enabled) {
      return sms.sendSms(this.phone, this.message);
    } else {
      return false;
    }
  }

  get message () {
    const less = parseInt(this.price) - this.latestPrice;
    return [
      `\u2708 Deal alert! `,
      `Southwest flight #${this.number} from ${this.from} to ${this.to} on ${this.date} `,
      `has dropped to $${this.latestPrice}, which is $${less} less than you paid.`
    ].join('');
  }

}

/*
date
from
to
number
price
phone
 */

module.exports = Alert;
