# 🤖 AI Grant Autopilot

**Automated grant discovery, matching, drafting, and deadline tracking powered by OpenAI**

## Overview

The AI Grant Autopilot is a complete TypeScript service that:
1. **Scans** grant sources (Grants.gov, foundations, state programs)
2. **Matches** grants to your organization's focus areas
3. **Drafts** full proposals using GPT-4
4. **Tracks** deadlines in Google Calendar
5. **Automates** daily scanning via cron jobs

## Quick Start

### 1. Run Bootstrap Script

```bash
cd /workspaces/fix2
bash scripts/bootstrap-grant-autopilot.sh
```

This creates a new `efh-grant-autopilot/` directory with:
- Complete TypeScript project
- Express API server
- OpenAI integration
- Google Calendar integration
- Supabase database schema
- Cron job scheduler

### 2. Configure Environment

```bash
cd efh-grant-autopilot
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Supabase
SUPABASE_URL=https://cuxzzpsyufcewtmicszk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Service Account (JSON as single line)
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
GOOGLE_CALENDAR_ID=primary

# Organization
ORG_DISPLAY_NAME="Elevate for Humanity"
ORG_EIN="00-0000000"
ORG_DOMAINS="elevateforhumanity.org,selfishinc.org"
DEFAULT_TIMEZONE="America/Indiana/Indianapolis"

# Features
ENABLE_GRANTS_GOV=true
ENABLE_FOUNDATION_FEEDS=true
GRANTS_GOV_API_KEY=  # Optional
```

### 3. Create Database Tables

Open Supabase SQL Editor and run:

```bash
cat efh-grant-autopilot/sql/schema.sql
```

This creates:
- `organizations` - Your org profile
- `grants_catalog` - All discovered grants
- `matches` - Grants matched to your org
- `drafts` - AI-generated proposals
- `submissions` - Submission tracking

### 4. Install Dependencies

```bash
cd efh-grant-autopilot
npm install
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs on [http://localhost:8787](http://localhost:8787)

## Usage Workflow

### Step 1: Seed Your Organization

```bash
curl -X POST http://localhost:8787/api/org/seed \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elevate for Humanity",
    "ein": "00-0000000",
    "websites": ["elevateforhumanity.org", "selfishinc.org"],
    "focus_areas": ["workforce", "entrepreneurship", "healthcare", "education"],
    "location": "Indianapolis, IN"
  }'
```

**Response**:
```json
{
  "seeded": {
    "id": "uuid-here",
    "name": "Elevate for Humanity",
    ...
  }
}
```

Save the `id` for next steps.

### Step 2: Scan Grant Sources

```bash
curl -X POST http://localhost:8787/api/scan
```

**Response**:
```json
{
  "fetched": {
    "grantsGov": 15,
    "foundations": 0
  }
}
```

This fetches grants from:
- Grants.gov API (if key provided)
- Foundation feeds (customize in `src/services/grants.ts`)

### Step 3: Match Grants to Your Org

```bash
curl -X POST http://localhost:8787/api/match \
  -H "Content-Type: application/json" \
  -d '{"organization_id": "YOUR_ORG_ID"}'
```

**Response**:
```json
{
  "matches_created": 8
}
```

Matching algorithm:
- Compares grant title/synopsis to your focus areas
- Scores 0-1 based on keyword matches
- Creates match if score ≥ 0.25
- Stores match reasons for review

### Step 4: Draft a Proposal

Find a match in Supabase:

```sql
SELECT id, grant_id, match_score, reasons, status
FROM matches
WHERE organization_id = 'YOUR_ORG_ID'
ORDER BY match_score DESC
LIMIT 10;
```

Draft the proposal:

```bash
curl -X POST http://localhost:8787/api/draft \
  -H "Content-Type: application/json" \
  -d '{"match_id": "MATCH_ID"}'
```

**Response**:
```json
{
  "drafted": "draft-uuid",
  "tokens": 1250
}
```

This:
1. Generates full proposal using GPT-4
2. Saves to `drafts` table
3. Creates Google Calendar event for deadline
4. Updates match status to "drafted"

### Step 5: Review Draft

Query Supabase:

```sql
SELECT 
  d.full_proposal,
  d.tokens_used,
  m.match_score,
  g.title as grant_title,
  g.close_date,
  g.url
FROM drafts d
JOIN matches m ON d.match_id = m.id
JOIN grants_catalog g ON m.grant_id = g.id
WHERE d.id = 'DRAFT_ID';
```

## API Endpoints

### GET /
Health check

**Response**:
```json
{
  "ok": true,
  "service": "EFH Grant Autopilot",
  "org": "Elevate for Humanity"
}
```

### POST /api/org/seed
Create organization profile

**Body**:
```json
{
  "name": "Elevate for Humanity",
  "ein": "00-0000000",
  "websites": ["elevateforhumanity.org"],
  "focus_areas": ["workforce", "entrepreneurship"],
  "location": "Indianapolis, IN"
}
```

### POST /api/scan
Fetch grants from all sources

**Response**:
```json
{
  "fetched": {
    "grantsGov": 15,
    "foundations": 3
  }
}
```

### POST /api/match
Match grants to organization

**Body**:
```json
{
  "organization_id": "uuid"
}
```

**Response**:
```json
{
  "matches_created": 8
}
```

### POST /api/draft
Generate proposal draft

**Body**:
```json
{
  "match_id": "uuid"
}
```

**Response**:
```json
{
  "drafted": "draft-uuid",
  "tokens": 1250
}
```

### GET /healthz
Simple health check

## Automated Scheduling

The service includes a cron job that runs **daily at 9am Eastern**:

```typescript
cron.schedule("0 9 * * *", async () => {
  // 1. Fetch new grants
  await fetchGrantsGov();
  await fetchFoundationFeeds();
  
  // 2. Match to first organization
  const { data: orgs } = await sb.from("organizations").select("id").limit(1);
  if (orgs && orgs[0]) {
    await matchGrantsToOrg(orgs[0].id);
  }
}, { timezone: "America/Indiana/Indianapolis" });
```

## Customization

### Add Foundation Sources

Edit `src/services/grants.ts`:

```typescript
export async function fetchFoundationFeeds() {
  const feeds = [
    {
      name: "Lilly Endowment",
      url: "https://lillyendowment.org/grants",
      parser: parseLillyGrants
    },
    {
      name: "Indiana DWD",
      url: "https://www.in.gov/dwd/grants",
      parser: parseINDWDGrants
    }
  ];

  for (const feed of feeds) {
    const grants = await feed.parser(feed.url);
    for (const grant of grants) {
      await addOrUpdateGrant({
        source: feed.name,
        external_id: grant.id,
        title: grant.title,
        synopsis: grant.description,
        sponsor: feed.name,
        url: grant.url,
        close_date: grant.deadline,
        ...grant
      });
    }
  }
}
```

### Customize Proposal Prompts

Edit `src/services/writer.ts`:

```typescript
const SYSTEM = `You are an expert nonprofit grant writer for Elevate for Humanity.

Focus on:
- Workforce development (WIOA, WEX, JRI programs)
- Entrepreneurship pathways
- Healthcare career training
- Community impact metrics

Use EFH's voice:
- Data-driven outcomes
- Wraparound services
- Partnership-based approach
- Measurable KPIs

Reference:
- DOL/DWD best practices
- Indiana workforce gaps
- Indianapolis community needs`;
```

### Add DOCX Export

Install dependencies:

```bash
npm install docx
```

Add endpoint in `src/index.ts`:

```typescript
import { Document, Packer, Paragraph } from "docx";

app.get("/api/drafts/:id/docx", async (req, res) => {
  const { data: draft } = await sb
    .from("drafts")
    .select("*, matches(*, grants_catalog(*), organizations(*))")
    .eq("id", req.params.id)
    .single();

  if (!draft) return res.status(404).json({ error: "Draft not found" });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: draft.matches.grants_catalog.title, heading: "Title" }),
        new Paragraph({ text: draft.full_proposal })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", `attachment; filename="proposal-${req.params.id}.docx"`);
  res.send(buffer);
});
```

## Database Schema

### organizations
```sql
id              uuid PRIMARY KEY
name            text NOT NULL
ein             text
websites        text[]
focus_areas     text[]  -- ['workforce', 'entrepreneurship', ...]
location        text    -- 'Indianapolis, IN'
created_at      timestamptz
```

### grants_catalog
```sql
id              uuid PRIMARY KEY
source          text NOT NULL  -- 'grants.gov' | 'foundation' | 'state'
external_id     text           -- Unique ID from source
title           text NOT NULL
synopsis        text
sponsor         text
url             text
posted_date     date
close_date      date
categories      text[]
eligibility     text[]
amount_min      numeric
amount_max      numeric
raw             jsonb          -- Original data
created_at      timestamptz
```

### matches
```sql
id                  uuid PRIMARY KEY
grant_id            uuid REFERENCES grants_catalog
organization_id     uuid REFERENCES organizations
match_score         numeric  -- 0..1
reasons             text[]   -- ['workforce', 'entrepreneurship']
status              text     -- 'new' | 'drafted' | 'submitted' | 'awarded'
created_at          timestamptz
```

### drafts
```sql
id                  uuid PRIMARY KEY
match_id            uuid REFERENCES matches
executive_summary   text
need_statement      text
objectives          text
methods             text
outcomes            text
budget_narrative    text
full_proposal       text
tokens_used         int
created_at          timestamptz
```

### submissions
```sql
id                      uuid PRIMARY KEY
match_id                uuid REFERENCES matches
portal                  text  -- 'grants.gov' | 'foundation-portal'
submitted_at            timestamptz
confirmation_number     text
notes                   text
```

## Deployment

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Build command: `cd efh-grant-autopilot && npm install && npm run build`
4. Start command: `cd efh-grant-autopilot && npm start`
5. Add environment variables in dashboard
6. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY efh-grant-autopilot/package*.json ./
RUN npm ci --production
COPY efh-grant-autopilot/ ./
RUN npm run build
EXPOSE 8787
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t efh-grant-autopilot .
docker run -p 8787:8787 --env-file .env efh-grant-autopilot
```

### Gitpod

The service works out of the box in Gitpod:

1. Open workspace
2. Run bootstrap script
3. Configure `.env`
4. Run `npm run dev`
5. Port 8787 is automatically public

## Monitoring

### View Matches

```sql
SELECT 
  g.title,
  g.sponsor,
  g.close_date,
  m.match_score,
  m.reasons,
  m.status
FROM matches m
JOIN grants_catalog g ON m.grant_id = g.id
WHERE m.organization_id = 'YOUR_ORG_ID'
ORDER BY m.match_score DESC;
```

### View Drafts

```sql
SELECT 
  g.title as grant_title,
  g.close_date,
  d.tokens_used,
  d.created_at as drafted_at,
  m.status
FROM drafts d
JOIN matches m ON d.match_id = m.id
JOIN grants_catalog g ON m.grant_id = g.id
ORDER BY d.created_at DESC;
```

### Check Cron Logs

```bash
# In production
tail -f logs/grant-autopilot.log | grep CRON
```

## Cost Estimates

### OpenAI (GPT-4o-mini)

- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Average proposal**: ~1,500 tokens (~$0.001 per draft)
- **Monthly (100 drafts)**: ~$0.10

### Google Calendar API

- **Free**: Up to 1M requests/day

### Supabase

- **Free tier**: 500MB database, 2GB bandwidth
- **Pro tier**: $25/month for more capacity

## Troubleshooting

### Grants.gov API Not Working

If you don't have a Grants.gov API key:

1. Set `ENABLE_GRANTS_GOV=false` in `.env`
2. Add grants manually via CSV import
3. Or scrape their RSS feed

### OpenAI Rate Limits

If you hit rate limits:

1. Add delay between drafts
2. Use GPT-3.5-turbo instead of GPT-4
3. Upgrade OpenAI tier

### Calendar Events Not Creating

Check service account permissions:

1. Service account must have Calendar API enabled
2. Calendar must be shared with service account email
3. Service account needs "Make changes to events" permission

## Next Steps

### React Dashboard

Add a simple admin UI:

```bash
cd efh-grant-autopilot
npx create-react-app dashboard
cd dashboard
npm install @supabase/supabase-js
```

Create `src/GrantsDashboard.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function GrantsDashboard() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    const { data } = await supabase
      .from('matches')
      .select('*, grants_catalog(*)')
      .order('match_score', { ascending: false });
    setMatches(data);
  }

  async function draftProposal(matchId) {
    await fetch('http://localhost:8787/api/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_id: matchId })
    });
    loadMatches();
  }

  return (
    <div>
      <h1>Grant Matches</h1>
      {matches.map(m => (
        <div key={m.id} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem' }}>
          <h3>{m.grants_catalog.title}</h3>
          <p>Score: {(m.match_score * 100).toFixed(0)}%</p>
          <p>Deadline: {m.grants_catalog.close_date}</p>
          <p>Status: {m.status}</p>
          {m.status === 'new' && (
            <button onClick={() => draftProposal(m.id)}>
              Draft Proposal
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Email Notifications

Add email alerts when new matches are found:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function notifyNewMatches(matches: any[]) {
  await transporter.sendMail({
    from: 'grants@elevateforhumanity.org',
    to: 'team@elevateforhumanity.org',
    subject: `${matches.length} New Grant Matches`,
    html: `
      <h2>New Grant Opportunities</h2>
      ${matches.map(m => `
        <div>
          <h3>${m.grants_catalog.title}</h3>
          <p>Match Score: ${(m.match_score * 100).toFixed(0)}%</p>
          <p>Deadline: ${m.grants_catalog.close_date}</p>
          <a href="${m.grants_catalog.url}">View Grant</a>
        </div>
      `).join('')}
    `
  });
}
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-14  
**Status**: Production Ready ✅
