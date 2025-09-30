module.exports = {
  apps: [
    { name: "lms",       script: "npm", args: "run lms:start",       env: { PORT: "9200", NODE_ENV: "production" } },
    { name: "vizio",     script: "npm", args: "run vizio:start",     env: { PORT: "9300", NODE_ENV: "production" } },
    { name: "marketing", script: "npm", args: "run marketing:start", env: { PORT: "4100", NODE_ENV: "production" } }
  ]
};
