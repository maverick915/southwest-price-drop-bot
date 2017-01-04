const ENV = process.env;

const ADMIN_NAME = ENV.ADMIN_NAME;
const ADMIN_PASSWORD = ENV.ADMIN_PASSWORD;

const DEVELOPMENT = ENV.DEVELOPMENT === 'true';

const PORT = ENV.PORT;

module.exports = {
  ADMIN_NAME,
  ADMIN_PASSWORD,
  DEVELOPMENT,
  PORT
};
