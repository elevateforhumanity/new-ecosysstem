#!/usr/bin/env bash
set -euo pipefail

OUT="build-doctor-report.md"
LOG=".tools/build.log"
PKG=".tools/package-audit.json"

echo "# EFH Build Doctor Report" > "$OUT"
echo "_$(date -u '+%Y-%m-%d %H:%M:%SZ UTC')_" >> "$OUT"
echo "" >> "$OUT"

say(){ echo "$@" | tee -a "$OUT" >/dev/null; }
hr(){ echo "" >> "$OUT"; echo "---" >> "$OUT"; echo "" >> "$OUT"; }

# 0) Repo basics
say "## Repo Basics"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 && GIT=1 || GIT=0
if [ "$GIT" -eq 1 ]; then
  CURBR=$(git rev-parse --abbrev-ref HEAD || echo "unknown")
  say "- ✅ Git repo detected (branch: \`$CURBR\`)"
  if [ -n "$(git status --porcelain)" ]; then
    say "- ⚠️ Uncommitted changes present — commit/push to avoid Gitpod data loss."
  else
    say "- ✅ Working tree clean"
  fi
else
  say "- ❌ Not a git repository — initialize and push to GitHub to prevent data loss."
fi
hr

# 1) Environment & versions
say "## Environment & Versions"
NODEV=$(node -v 2>/dev/null || echo "missing")
NPMV=$(npm -v 2>/dev/null || echo "missing")
PNPMV=$(pnpm -v 2>/dev/null || echo "missing")
say "- Node: \`$NODEV\` | npm: \`$NPMV\` | pnpm: \`$PNPMV\`"
if [ -f .nvmrc ]; then
  say "- .nvmrc present: \`$(cat .nvmrc)\`"
else
  say "- ❌ Missing .nvmrc (recommend pinning Node e.g. \`20.11.1\`)"
fi
if jq -r '.engines.node // empty' package.json >/dev/null 2>&1; then
  say "- package.json engines.node: \`$(jq -r '.engines.node' package.json)\`"
else
  say "- ❌ package.json missing \`engines.node\`"
fi
if jq -r '.packageManager // empty' package.json >/dev/null 2>&1; then
  say "- packageManager: \`$(jq -r '.packageManager' package.json)\`"
else
  say "- ❌ package.json missing \`packageManager\` (recommend \`pnpm@9.7.0\`)"
fi
hr

# 2) Project type quick check
say "## Framework / Project Check"
if [ -d src/app ] || [ -f next.config.js ] || [ -f next.config.mjs ]; then
  say "- Next.js project detected"
else
  say "- ⚠️ Next.js not clearly detected (this tool assumes Next.js; still running generic checks)"
fi
[ -f next.config.js ] && say "- next.config.js present"
[ -f next.config.mjs ] && say "- next.config.mjs present"
[ -f netlify.toml ] && say "- netlify.toml present" || say "- ❌ Missing netlify.toml (if deploying to Netlify)"
[ -f .gitpod.yml ] && say "- .gitpod.yml present" || say "- ❌ Missing .gitpod.yml (pin Gitpod env + prebuilds)"
[ -f .gitpod.Dockerfile ] && say "- .gitpod.Dockerfile present"
hr

# 3) Env vars sanity
say "## Environment Variables"
[ -f .env.example ] && say "- .env.example present" || say "- ❌ Missing .env.example (document required vars)"
need_vars=(NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY)
for v in "${need_vars[@]}"; do
  if grep -q "^$v=" .env 2>/dev/null || env | grep -q "^$v="; then
    say "- ✅ $v set (in env or .env)"
  else
    say "- ⚠️ $v not detected — builds may render generic placeholders"
  fi
done
hr

# 4) Dependency audit (loose versions)
say "## Dependency Version Audit"
node -e '
const fs=require("fs");
const p=JSON.parse(fs.readFileSync("package.json","utf8"));
const loose=re=>re.test.bind(re);
const bad=loose(/^[\^~><=*]|latest$/);
function scan(obj,kind){
  if(!obj) return [];
  return Object.entries(obj)
    .filter(([_,v])=>bad(v))
    .map(([k,v])=>({kind,name:k,range:v}));
}
const issues=[...scan(p.dependencies,"dependencies"),...scan(p.devDependencies,"devDependencies")];
console.log(JSON.stringify({issues},null,2));
' > "$PKG" 2>/dev/null || echo '{"issues":[]}' > "$PKG"
ISSUES=$(jq '.issues | length' "$PKG" 2>/dev/null || echo 0)
if [ "$ISSUES" -gt 0 ]; then
  say "- ⚠️ Found $ISSUES loose version(s). Prefer exact versions to prevent drift."
  jq -r '.issues[] | "- \(.kind): \(.name) -> \(.range)"' "$PKG" >> "$OUT"
else
  say "- ✅ All dependency versions appear pinned (no ^, ~, latest, etc.)"
fi
hr

# 5) Clean install & build (deterministic)
say "## Deterministic Install & Build"
echo "- Running: corepack enable && corepack prepare pnpm@9.7.0 --activate" >> "$OUT"
(corepack enable >/dev/null 2>&1 || true)
(corepack prepare pnpm@9.7.0 --activate >/dev/null 2>&1 || true)

rm -rf node_modules .next 2>/dev/null || true
echo "- Running: pnpm install --frozen-lockfile" >> "$OUT"
if pnpm install --frozen-lockfile | tee "$LOG" >/dev/null; then
  say "- ✅ Install OK (frozen lockfile)"
else
  say "- ❌ Install failed — check $LOG"
fi

run_script(){
  local s="$1" ; local label="$2"
  if jq -e --arg s "$s" '.scripts[$s]' package.json >/dev/null 2>&1; then
    echo "- Running: pnpm $s" >> "$OUT"
    if pnpm "$s" | tee -a "$LOG" >/dev/null; then
      say "- ✅ $label passed"
    else
      say "- ❌ $label failed — see tail of $LOG below"
    fi
  else
    say "- (skip) no \`$s\` script"
  fi
}

run_script "typecheck" "Typecheck"
run_script "lint" "Lint"
run_script "build" "Build"

# 6) Show last errors if build failed
if ! grep -q "Next.js" "$LOG" 2>/dev/null && ! grep -q "Compiled" "$LOG" 2>/dev/null; then
  say ""
fi
say "### Build Log (tail)"
echo '\n```text' >> "$OUT"
tail -n 200 "$LOG" >> "$OUT" || true
echo '```' >> "$OUT"
hr

# 7) SEO routes check (Next.js App Router)
say "## SEO Routes Check"
[ -f src/app/sitemap.xml/route.ts ] || [ -f app/sitemap.xml/route.ts ] && say "- ✅ sitemap route found" || say "- ⚠️ No sitemap route found"
[ -f src/app/robots.txt/route.ts ] || [ -f app/robots.txt/route.ts ] && say "- ✅ robots.txt route found" || say "- ⚠️ No robots.txt route found"
hr

# 8) Recommendations summary
say "## Recommendations"
echo "- Pin Node in .nvmrc and package.json engines (e.g., 20.11.1)" >> "$OUT"
echo "- Commit lockfile and use \`pnpm install --frozen-lockfile\` in Gitpod/CI" >> "$OUT"
echo "- Add netlify.toml with Node 20 + Next.js plugin if using Netlify" >> "$OUT"
echo "- Add .gitpod.yml (prebuilds on) and .gitpod.Dockerfile to fix env drift" >> "$OUT"
echo "- Provide .env.example; set real env in Gitpod Variables/Netlify" >> "$OUT"
echo "- Replace loose dependency ranges (^, ~, latest) with exact versions" >> "$OUT"
hr

echo "Report written to $OUT"
