const { DEVELOPMENT, MAILGUN_API_KEY, FROM_EMAIL, TO_EMAIL, MAILGUN_DOMAIN } = require('../constants.js');
const enabled = !DEVELOPMENT;

async function sendEmail (to = TO_EMAIL, message, from = FROM_EMAIL) {
  const mailgun = getMailgun();
  const data = {
    from: from,
    to: to,
    subject: 'Southwest Price Drop Alert',
    text: message
  };
  console.log(data);
  const params = {
    src: from,
    dst: to,
    text: message
  };

  return new Promise(resolve => {
    mailgun.messages().send(data, function (error, body) {
      if (error) {
        console.log('Error: ' + error);
      } else {
        console.log(body);
      }
      resolve({
        error,
        body
      });
    });
  });
}

function getMailgun () {
  var mailgun = require('mailgun-js')({apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN});
  return mailgun;
}

module.exports = {
  enabled,
  getMailgun,
  sendEmail
};
