const { DEVELOPMENT } = require('./constants.js');

function errorResponse (res) {
  return err => {
    const error = formatError(err);
    console.log(error);
    res.status(500).send({ error: (DEVELOPMENT ? error : {}) });
  };
}

function formatError (err) {
  console.log(err);
  return { error: {
    name: err.name,
    message: err.message,
    stack: err.stack.split('\n')
  }};
}

module.exports = {
  errorResponse,
  formatError
};
