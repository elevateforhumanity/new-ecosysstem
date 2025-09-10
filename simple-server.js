// ESM/CJS bridge for tests importing ../simple-server.js
const app = require('./simple-server.cjs');
module.exports = app;
module.exports.default = app;