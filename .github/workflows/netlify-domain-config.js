// netlify-domain-config.js
// This script configures Netlify domain and SSL using Netlify API

const axios = require('axios');

const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
const NETLIFY_CUSTOM_DOMAIN = process.env.NETLIFY_CUSTOM_DOMAIN;

if (!NETLIFY_AUTH_TOKEN || !NETLIFY_SITE_ID) {
  console.error('Missing Netlify secrets. Please set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID.');
  process.exit(1);
}

const api = axios.create({
  baseURL: 'https://api.netlify.com/api/v1',
  headers: {
    Authorization: `Bearer ${NETLIFY_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

async function configureDomain() {
  if (!NETLIFY_CUSTOM_DOMAIN) {
    console.log('No custom domain provided. Skipping domain configuration.');
    return;
  }
  try {
    // Add custom domain
    await api.post(`/sites/${NETLIFY_SITE_ID}/domains`, {
      domain: NETLIFY_CUSTOM_DOMAIN,
    });
    console.log(`Custom domain ${NETLIFY_CUSTOM_DOMAIN} added.`);
  } catch (error) {
    if (error.response && error.response.status === 422) {
      console.log('Domain already exists.');
    } else {
      console.error('Error adding custom domain:', error.message);
      process.exit(1);
    }
  }
}

async function provisionSSL() {
  try {
    await api.post(`/sites/${NETLIFY_SITE_ID}/ssl`, {});
    console.log('SSL certificate provisioned/renewed.');
  } catch (error) {
    console.error('Error provisioning SSL:', error.message);
    process.exit(1);
  }
}

(async () => {
  await configureDomain();
  await provisionSSL();
})();
