const cheerio = require('cheerio');
const dateFormat = require('dateformat');
const osmosis = require('osmosis');

async function getPriceForFlight ({ from, to, date, number }) {
  const flights = (await getFlights({
    from,
    to,
    departDate: dateFormat(date, 'mm/dd/yyyy')
  })).outbound;

  const options = flights.filter(f => f.number === number);
  const prices = options.map(f => f.price);
  return Math.min(...prices);
}

async function getFlights ({ from, to, departDate, returnDate }) {
  const twoWay = Boolean(departDate && returnDate);

  const params = {
    twoWayTrip: twoWay,
    airTranRedirect: '',
    returnAirport: twoWay ? 'RoundTrip' : '',
    outboundTimeOfDay: 'ANYTIME',
    returnTimeOfDay: 'ANYTIME',
    seniorPassengerCount: 0,
    fareType: 'DOLLARS',
    originAirport: from,
    destinationAirport: to,
    outboundDateString: departDate,
    returnDateString: returnDate || '',
    adultPassengerCount: 1
  };

  const fares = { outbound: [] };
  if (twoWay) fares.return = [];

  const html = await getPage(params);
  const $ = cheerio.load(html);

  $(`[name='outboundTrip']`).toArray().forEach(e => parseTrip(e, fares.outbound));
  twoWay ? $(`[name='inboundTrip']`).toArray().forEach(e => parseTrip(e, fares.return)) : null;

  return fares;

  function parseTrip (e, dest) {
    const title = $(e).attr('title');

    const flights_ = title.match(/flight ([\d/]+)/);
    const flights = flights_[1].split('/').map(f => parseInt(f, 10));

    const stops_ = title.match(/arrive (\w+)/);
    const stops = stops_[1] === 'Nonstop' ? 0 : parseInt(stops_[1], 10);

    const price_ = title.match(/\$(\d+)/);
    const price = parseInt(price_[1], 10);

    dest.push({
      number: flights.join(','),
      stops,
      price
    });
  }
}

async function getPage (params) {
  return new Promise(resolve => {
    osmosis
      .get('https://www.southwest.com')
      .submit('.booking-form--form', params)
      .then(doc => resolve(doc.toString()));
  });
}

module.exports = {
  getPriceForFlight,
  getFlights
};
