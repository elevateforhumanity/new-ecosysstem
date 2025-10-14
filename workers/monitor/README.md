# EFH Autopilot Monitor - Cloudflare Worker

External monitoring for the Elevate for Humanity preview environment.

## Setup

1. Install Wrangler:
```bash
npm i -D wrangler
```

2. Update `wrangler.toml`:
   - Set `TARGET_URL` to your preview URL
   - Set `SLACK_WEBHOOK` to your Slack webhook URL (or remove for no alerts)

3. Deploy:
```bash
cd workers/monitor
npx wrangler deploy
```

## Features

- **Cron monitoring**: Checks every 5 minutes
- **Health probe**: Tests `/@vite/client` endpoint
- **Slack alerts**: Notifies on downtime
- **On-demand check**: Visit worker URL for manual health check

## Configuration

Edit `wrangler.toml` to change:
- Check frequency (crons)
- Target URL
- Alert destination
