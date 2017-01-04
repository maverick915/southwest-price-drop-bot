const Plivo = require('plivo');

const { PLIVO_ID, PLIVO_TOKEN, PLIVO_NUMBER } = require('../constants.js');

const enabled = Boolean(PLIVO_ID && PLIVO_TOKEN && PLIVO_NUMBER);

async function sendSms (to, message, from = PLIVO_NUMBER) {
  if (!enabled) return false;

  const plivo = getPlivo();
  const params = {
    src: from,
    dst: to,
    text: message
  };

  return new Promise(resolve => {
    plivo.send_message(params, (status, res) => {
      resolve({
        status,
        res
      });
    });
  });
}

function getPlivo () {
  return Plivo.RestAPI({
    authId: PLIVO_ID,
    authToken: PLIVO_TOKEN
  });
}

module.exports = {
  enabled,
  getPlivo,
  sendSms
};
