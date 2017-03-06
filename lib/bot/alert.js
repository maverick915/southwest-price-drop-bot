const PN = require('google-libphonenumber');
const shortid = require('shortid');

const { getPriceForFlight } = require('./get-price.js');

class Alert {

  constructor (data) {
    this.data = typeof data === 'string' ? JSON.parse(data) : data;
    this.data.id = this.data.id || shortid.generate();
    this.data.number = this.data.number.split(',').map(n => n.trim()).filter(n => n.length).join(',');
    this.data.price = parseInt(this.data.price, 10);
    this.data.phone = this.data.phone.split('').filter(d => /\d/.test(d)).join('');
    this.data.priceHistory = Alert.compactPriceHistory(this.data.priceHistory || []);
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

  get formattedNumber () {
    return '#' + this.number.split(',').join(', ');
  }

  get formattedDate () {
    return this.dateString;
  }

  get formattedPhone () {
    return this.phoneString;
  }

  get phoneString () {
    const phoneUtil = PN.PhoneNumberUtil.getInstance();
    const number = phoneUtil.parse(this.data.phone, 'US');
    return phoneUtil.format(number, PN.INTERNATIONAL);
  }

  get latestPrice () {
    const ph = this.data.priceHistory;
    return ph.length ? (ph[ph.length - 1]).price : Infinity;
  }

  get priceHasDropped () {
    return this.latestPrice < this.price;
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

  static compactPriceHistory (history) {
    const compact = [];

    for (let i = 0; i < history.length; i++) {
      const p = i - 1;
      const n = i + 1;

      const prevDifferent = !history[p] || history[i].price !== history[p].price;
      const nextDifferent = !history[n] || history[i].price !== history[n].price;

      if (prevDifferent || nextDifferent) compact.push(history[i]);
    }

    return compact;
  }

}

module.exports = Alert;
