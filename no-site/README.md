# 🤖 EFH Autopilot CLI

**No-Website Mode** - Complete hiring automation without needing a website.

## What It Does

The EFH Autopilot CLI automates your hiring workflow:

- **📝 Generate Job Posts** - Creates professional Markdown job descriptions ready for LinkedIn, Indeed, etc.
- **🐙 Seed GitHub** - Automatically creates labels and issues from your hiring plan
- **📊 Export Candidates** - Exports candidate data to CSV for analysis
- **💬 Slack Alerts** - Optional notifications for new candidates (no workspace creation needed)
- **🔒 Safe by Default** - DRY_RUN mode prevents accidental changes

## Quick Start

### 1. Install

```bash
cd no-site
npm install
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your credentials
```

**Required:**
- `GITHUB_TOKEN` - For creating issues/labels ([create token](https://github.com/settings/tokens?type=beta))

**Optional:**
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` - For candidate storage
- `SLACK_BOT_TOKEN` - For hiring alerts

### 3. Run

```bash
npm start
```

This opens an interactive menu where you can:
- Generate job post drafts
- Seed GitHub with labels and issues
- Export candidates to CSV
- Test Slack integration

## Commands

### Interactive Menu
```bash
npm start
```

### Individual Commands
```bash
npm run generate:jobs      # Generate job post Markdown files
npm run seed:github        # Create GitHub labels and issues
npm run export:candidates  # Export candidates to CSV
npm run test:slack         # Test Slack integration
```

## Safety Features

### DRY_RUN Mode (Default)

By default, `DRY_RUN=true` prevents any actual changes:

- ✅ Shows what would be created
- ✅ Generates local files
- ❌ No GitHub writes
- ❌ No Slack messages
- ❌ No spending

To enable actual writes:
```bash
# In .env
DRY_RUN=false
```

### Guardrails

- **No spending** - Never posts paid job ads
- **No production deploys** - Requires explicit flag
- **Local-first** - All outputs saved locally before any external actions
- **Reversible** - GitHub issues can be closed, labels can be deleted

## Output Locations

All generated files are saved to `.autopilot_out/`:

```
.autopilot_out/
├── job_posts/
│   ├── full-stack-developer.md
│   ├── devops-engineer.md
│   ├── product-manager.md
│   └── ux-ui-designer.md
├── candidates.csv
└── logs/
```

## GitHub Actions

The repository includes a GitHub Actions workflow that runs nightly or on-demand.

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **EFH Autopilot Nightly**
3. Click **Run workflow**
4. Choose:
   - **Dry run:** `true` (safe) or `false` (live)
   - **Task:** What to run

### Required Secrets

Add these in **Settings → Secrets → Actions**:

- `AUTOPILOT_GITHUB_TOKEN` - GitHub PAT for creating issues
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `SLACK_BOT_TOKEN` - (Optional) Slack bot token
- `SLACK_HIRING_CHANNEL` - (Optional) Slack channel ID

### Artifacts

After each run, download generated files from the **Artifacts** section.

## Job Post Templates

The CLI includes 4 pre-configured job templates:

1. **Full-Stack Developer** - React, Node.js, Supabase
2. **DevOps Engineer** - Cloudflare, CI/CD, monitoring
3. **Product Manager** - Strategy, roadmap, stakeholder management
4. **UX/UI Designer** - Figma, accessibility, design systems

### Customizing Templates

Edit `scripts/generate-jobs.js` to:
- Add new positions
- Modify requirements
- Update salary ranges
- Change benefits

## GitHub Seeding

The `seed:github` command creates:

### Labels
- `hiring` - Hiring and recruitment tasks
- `week-1`, `week-2`, etc. - Timeline tracking
- `priority-high/medium/low` - Priority levels
- `infrastructure`, `frontend`, `backend` - Categories

### Issues
Based on your 12-week plan:
- Week 1 Day 1: Infrastructure setup
- Week 1 Day 2: Begin hiring
- Week 1 Day 3: Technical setup
- Week 1 Day 4: Quick wins
- Week 1 Day 5: Hiring decisions
- Week 2-4: Ongoing tasks

## Slack Integration

### Setup

1. Create a Slack app: https://api.slack.com/apps
2. Add bot token scopes:
   - `chat:write`
   - `chat:write.public`
3. Install app to workspace
4. Copy **Bot User OAuth Token** to `.env`
5. Invite bot to channel: `/invite @your-bot-name`

### Test

```bash
npm run test:slack
```

### Hiring Alerts

When a new candidate applies (via Supabase integration), you'll receive:
- Candidate name and position
- Contact information
- Resume/portfolio links
- Quick action buttons
- Direct link to candidate profile

## Supabase Integration

### Database Schema

Run the migration to create tables:

```sql
-- In Supabase SQL Editor
-- Run: supabase/migrations/012_hiring_automation.sql
```

This creates:
- `candidates` - Candidate information
- `interviews` - Interview schedules
- `job_postings` - Job posting tracking
- `hiring_pipeline_events` - Audit log

### Candidate Export

```bash
npm run export:candidates
```

Exports all candidates to CSV with:
- Personal information
- Application details
- Status and stage
- Scores and notes
- Timeline

## Troubleshooting

### "GITHUB_TOKEN not set"

Create a fine-grained personal access token:
1. Go to https://github.com/settings/tokens?type=beta
2. Click **Generate new token**
3. Select repository: `elevateforhumanity/ecosystem2`
4. Permissions:
   - Contents: Read
   - Issues: Read and Write
   - Projects: Read and Write
5. Copy token to `.env`

### "Channel not found" (Slack)

1. Make sure the channel exists
2. Invite the bot: `/invite @your-bot-name`
3. Check channel name in `.env` matches exactly

### "Candidates table doesn't exist"

Run the Supabase migration:
```bash
# In Supabase dashboard → SQL Editor
# Paste contents of: supabase/migrations/012_hiring_automation.sql
```

### DRY_RUN not working

Make sure `.env` has:
```bash
DRY_RUN=false  # Not "False" or "0"
```

## Windows PowerShell

For Windows users, create `autopilot.ps1`:

```powershell
# EFH Autopilot Launcher
cd no-site
npm start
```

Run with:
```powershell
.\autopilot.ps1
```

## Advanced Usage

### Custom Job Templates

Add your own templates in `scripts/generate-jobs.js`:

```javascript
const jobTemplates = [
  {
    title: 'Your Position',
    department: 'Your Department',
    type: 'Full-Time',
    location: 'Remote',
    salary: '$XX,000 - $XX,000',
    description: '...',
    responsibilities: [...],
    requirements: [...],
    niceToHave: [...],
    benefits: [...],
  },
];
```

### Custom GitHub Issues

Modify `scripts/seed-github.js` to match your workflow:

```javascript
const issues = [
  {
    title: 'Your Task',
    body: 'Task description...',
    labels: ['your-label'],
  },
];
```

### Candidate Scoring

Customize scoring in Supabase:
- `technical_score` (0-100)
- `culture_fit_score` (0-100)
- `overall_score` (0-100)

## Support

- **Documentation:** This README
- **Issues:** https://github.com/elevateforhumanity/fix2/issues
- **Email:** hiring@elevateforhumanity.org

## License

UNLICENSED - Internal use only for Elevate for Humanity.

---

**Made with ❤️ by the EFH Team**
