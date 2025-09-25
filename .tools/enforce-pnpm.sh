#!/usr/bin/env bash
set -euo pipefail

echo "==> Enforcing pnpm + Node versions and cleaning lockfiles ..."

# 0) Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This isn't a git repo. Run: git init && git add -A && git commit -m 'init'"
fi

# 1) Corepack + pnpm
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.7.0 --activate

# 2) Pin Node (create/update .nvmrc)
echo "20.11.1" > .nvmrc

# 3) Clean conflicting lockfiles (root + packages/*)
echo " - Removing npm/yarn lockfiles ..."
find . -name "package-lock.json" -o -name "yarn.lock" | while read -r f; do
  rm -f "$f"
  git rm -f --cached "$f" 2>/dev/null || true
done

# 4) Add .npmrc for deterministic versions
if [ ! -f .npmrc ]; then
  echo "save-exact=true" > .npmrc
else
  grep -q "^save-exact=true" .npmrc || echo "save-exact=true" >> .npmrc
fi

# 5) Set VS Code to prefer pnpm
mkdir -p .vscode
cat > .vscode/settings.json <<'JSON'
{
  "npm.packageManager": "pnpm",
  "files.autoSave": "afterDelay",
  "files.eol": "\n"
}
JSON

# 6) Patch package.json: engines + packageManager
if [ -f package.json ]; then
  # add engines.node if missing
  node - <<'JS'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.engines = Object.assign({node: "20.11.1"}, p.engines || {});
p.packageManager = "pnpm@9.7.0";
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
JS
else
  echo '{}' > package.json
  node - <<'JS'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.name = p.name || "efh-app";
p.private = true;
p.engines = { node: "20.11.1" };
p.packageManager = "pnpm@9.7.0";
p.scripts = Object.assign({ dev: "next dev -p 3000 -H 0.0.0.0", build: "next build", start: "next start -p 3000" }, p.scripts||{});
fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
JS
fi

# 7) Install using pnpm (frozen if lock exists)
if [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
else
  pnpm install
fi

# 8) Commit the changes
git add -A
git commit -m "chore: enforce pnpm@9.7.0 + Node 20.11.1; remove conflicting lockfiles; set VS Code to pnpm

- Updated .nvmrc to 20.11.1
- Added .npmrc with save-exact=true
- Set VS Code to prefer pnpm
- Updated package.json with engines and packageManager
- Removed conflicting npm/yarn lockfiles
- Installed dependencies with pnpm

Co-authored-by: Ona <no-reply@ona.com>" || true

echo "==> Done. This workspace now uses pnpm only."
echo "   - pnpm version: $(pnpm -v)"
echo "   - node version : $(node -v)"