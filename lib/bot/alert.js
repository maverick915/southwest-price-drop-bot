const shortid = require('shortid');

const { getPriceForFlight } = require('./get-price.js');

class Alert {

  constructor (data) {
    this.data = typeof data === 'string' ? JSON.parse(data) : data;
    this.data.id = this.data.id || shortid.generate();
    this.data.price = parseInt(this.data.price, 10);
    this.data.priceHistory = this.data.priceHistory || [];
  }

  get id () { return this.data.id; }
  get date () { return new Date(this.data.date); }
  get from () { return this.data.from.toLocaleUpperCase(); }
  get to () { return this.data.to.toLocaleUpperCase(); }
  get number () { return this.data.number; }
  get price () { return this.data.price; }
  get phone () { return this.data.phone; }
  get priceHistory () { return this.data.priceHistory; }

  get dateString () {
    return this.date.toLocaleDateString('en-US', { timeZone: 'UTC' });
  }

  get latestPrice () {
    const priceHistory = this.data.priceHistory;
    return priceHistory.length ? (priceHistory[priceHistory.length - 1]).price : Infinity;
  }

  toJSON () {
    return JSON.stringify(this.data);
  }

  key (namespace = 'alert') {
    return `${namespace}.${this.id}`;
  }

  async getLatestPrice () {
    const time = Date.now();
    const price = await getPriceForFlight(this);
    if (price < Infinity) this.priceHistory.push({ time, price });
    return price;
  }

}

module.exports = Alert;
