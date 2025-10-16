# Quick Start Guide

## 1. Gitpod Setup (30 seconds)

```bash
# Copy files to your repo
cp -r gitpod-nextjs-setup/.gitpod.yml .
cp -r gitpod-nextjs-setup/scripts .

# Push to GitHub
git add .gitpod.yml scripts/
git commit -m "Add Gitpod one-click setup"
git push

# Open in Gitpod
# Visit: https://gitpod.io/#YOUR_GITHUB_REPO_URL
```

Site auto-builds and opens at port 3000.

## 2. Durable Implementation (5 minutes)

### Quick Copy-Paste

**Custom CSS** (add to Durable):
```css
@import url('https://cdn.tailwindcss.com');
body{background:radial-gradient(1200px 800px at 10% -10%,rgba(14,165,233,.15),transparent 60%),#0b1220;color:#e5e7eb}
.gradient-text{background:linear-gradient(90deg,#22d3ee,#60a5fa,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}
.card-glass{border-radius:1rem;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);backdrop-filter:blur(10px)}
```

**Update Links**:
- `#programs` → `/programs`
- `#pricing` → `/pricing`
- `#contact` → `/contact`
- `#apply` → `/apply`

## 3. Component Order

1. Navbar (sticky header)
2. Hero (headline + CTA)
3. Features (3-column grid)
4. Pricing (3 tiers)
5. CTA (bottom banner)
6. Footer

## Files Included

```
gitpod-nextjs-setup/
├── .gitpod.yml              # Gitpod config
├── scripts/
│   └── setup-polished-site.sh  # Auto-setup script
├── README.md                # Full documentation
├── DURABLE_GUIDE.md         # Durable step-by-step
└── QUICKSTART.md            # This file
```

## Need Help?

See `DURABLE_GUIDE.md` for detailed instructions.
