import express from 'express';
import cron from 'node-cron';
import { setTimeout as sleep } from 'node:timers/promises';
import pino from 'pino';
import { fetch } from 'undici';

const log = pino({ transport: { target: 'pino-pretty' } });
const app = express();
const PORT = process.env.WORKER_PORT || 4000;

// ---- health
app.get('/health', (_req, res) => res.status(200).send('OK'));

// ---- common job examples
async function syncEnrollments() {
  log.info('Sync enrollments: start');
  // TODO: pull pending enrollments from your API/database and process them
  await sleep(500); // simulate work
  log.info('Sync enrollments: done');
}

async function generateDailyReports() {
  log.info('Daily reports: start');
  // TODO: generate PDFs/CSVs, upload to Cloudflare R2 / Supabase, email link
  await sleep(500);
  log.info('Daily reports: done');
}

// ---- schedules (cron in server's local time)
// Every 5 minutes: quick sync
cron.schedule('*/5 * * * *', syncEnrollments);

// At 1:05am daily: reports
cron.schedule('5 1 * * *', generateDailyReports);

// Optional: warm Durable / health ping every 10 min
cron.schedule('*/10 * * * *', async () => {
  try {
    const url = process.env.DURABLE_URL || 'https://www.elevateforhumanity.org';
    const r = await fetch(url, { method: 'HEAD' });
    log.info({ status: r.status }, 'Durable warm ping');
  } catch (e) {
    log.warn({ err: e }, 'Durable warm ping failed');
  }
});

app.listen(PORT, '0.0.0.0', () => log.info(`EFH worker up on :${PORT}`));