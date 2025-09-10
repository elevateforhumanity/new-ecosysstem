// Shim to ensure CommonJS implementation is used when requiring './services/compliance'
// The real implementation lives in compliance.cjs.
module.exports = require('./compliance.cjs');

