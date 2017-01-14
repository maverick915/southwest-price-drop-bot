const shortid = require('shortid');

const { getPriceForFlight } = require('./get-price.js');
const sms = require('./send-sms.js');

class Alert {

  constructor (data) {
    this.data = typeof data === 'string' ? JSON.parse(data) : data;
    this.data.id = this.data.id || shortid.generate();
    Object.assign(this, {
      id: this.data.id,
      date: new Date(this.data.date),
      from: this.data.from,
      to: this.data.to,
      number: this.data.number,
      price: parseInt(this.data.price, 10),
      phone: this.data.phone
    });
  }

  key (namespace = 'alert') {
    return `${namespace}.${this.id}`;
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
    const less = this.price - this.latestPrice;
    return [
      `\u2708 Deal alert! Southwest flight #${this.number} `,
      `from ${this.from} to ${this.to} on ${this.dateString} `,
      `has dropped to $${this.latestPrice}, which is $${less} less than you paid.`
    ].join('');
  }

  get dateString () {
    return this.date.toLocaleDateString('en-US', { timeZone: 'UTC' });
  }

}

module.exports = Alert;
