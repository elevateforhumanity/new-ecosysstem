/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/

console.warn('⚠️  DEPRECATED: server.js is deprecated. Use simple-server.cjs instead.');
console.warn('   This file will be removed in a future version.');

// Main deployment entry point
// This file ensures deployment systems can find the correct server
// Redirects to the stable CommonJS server for better compatibility
console.log("🔄 Starting server via server.js...");
console.log("➡️  Redirecting to simple-server.js for deployment compatibility");
require("./simple-server.js");
