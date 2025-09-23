# AUTOPILOT READY — Cloudflare DNS & Redirects

This repo contains a one-command "autopilot" to configure Cloudflare DNS and an apex redirect for `elevateforhumanity.org`.

## What it does
- Verifies your Cloudflare API token works for the target zone
- **Apex A**: `@ -> APEX_IP` (proxied)
- **CNAME**: `www -> elevateforhumanity.org` (proxied)
- **Redirect** (Rulesets): `https://elevateforhumanity.org/* -> https://elevate4humanity.org/*` (301)

> ⚠️ Note: `192.0.2.1` is a placeholder test IP. Replace with your real origin for production.

## Prereqs
- Node.js 18+ (`node -v`)
- `curl`, `jq` installed
- Cloudflare **API Token** with:
  - `Zone → Zone → Read`
  - `Zone → DNS → Edit`
  - (Token should be scoped to the `elevateforhumanity.org` zone)

## Quick Start
```bash
chmod +x autopilot-cloudflare-fix.sh test-autopilot-redirect.sh
./autopilot-cloudflare-fix.sh
# follow prompts for token, zone, IP, redirect target
./test-autopilot-redirect.sh
```

## Environment

The setup script writes `.env.autopilot` (kept local). Values:

```
CF_API_TOKEN=***redacted***
CF_ZONE_NAME=elevateforhumanity.org
APEX_IP=192.0.2.1
REDIRECT_TO=https://elevate4humanity.org
```

## Idempotency

Safe to re-run. The tool updates existing records/rules rather than duplicating them.

## Troubleshooting

* **Zone not found**: make sure the token is scoped to the correct zone (or "All zones" if preferred).
* **Insufficient permissions**: ensure `Zone:DNS:Edit` + `Zone:Zone:Read`.
* **No redirect**: check *Security → WAF → Rulesets* in the Cloudflare dashboard. You should see "Autopilot Redirects".
* **Propagation**: DNS/edge changes can take a few minutes globally.

## Netlify note (optional)

If you also manage DNS at **Netlify** (instead of Cloudflare), you'll need a Netlify Personal Access Token (role with DNS rights) and use their DNS endpoints to create `A/CNAME/TXT` records. This autopilot is currently scoped to Cloudflare; a Netlify variant can be added similarly if needed.