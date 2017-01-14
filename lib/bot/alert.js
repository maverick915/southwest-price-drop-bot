const shortid = require('shortid');

const { getPriceForFlight } = require('./get-price.js');
const sms = require('./send-sms.js');

class Alert {

  constructor (data) {
    this.data = typeof data === 'string' ? JSON.parse(data) : data;
    this.data.id = this.data.id || shortid.generate();
    this.data.latestPrice = this.price;
  }

  get id () { return this.data.id }
  get date () { return new Date(this.data.date) }
  get from () { return this.data.from }
  get to () { return this.data.to }
  get number () { return this.data.number }
  get price () { return parseInt(this.data.price, 10) }
  get phone () { return this.data.phone }
  get latestPrice () { return this.data.latestPrice }

  key (namespace = 'alert') {
    return `${namespace}.${this.id}`;
  }

  value () {
    return JSON.stringify(this.data);
  }

  async getPrice () {
    this.data.latestPrice = await getPriceForFlight(this);
    return this.latestPrice;
  }

  get dateString () {
    return this.date.toLocaleDateString('en-US', { timeZone: 'UTC' });
  }

}

module.exports = Alert;
