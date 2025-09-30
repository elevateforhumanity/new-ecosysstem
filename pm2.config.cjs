/** PM2 config: adjust scripts to match package.json */
module.exports = {
  apps: [
    {
      name: "dev",
      script: "npm",
      args: "run dev",
      env: { PORT: "5173", NODE_ENV: "development" }
    },
    {
      name: "preview",
      script: "npm",
      args: "run preview",
      env: { PORT: "3000", NODE_ENV: "production" }
    }
  ]
};
