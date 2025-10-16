#!/usr/bin/env node
// ESM Autopilot: scans components, merges with config, generates router, sitemap, and a report.

import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// ── CONFIG (edit if your paths differ) ─────────────────────────────────────────
const SRC_DIR = path.resolve(__dirname, "../src");
const PAGES_DIR = path.join(SRC_DIR, "pages");           // e.g., src/pages/About.jsx
const COMPONENTS_DIR = path.join(SRC_DIR, "components"); // optional extra scan
const ROUTE_CONFIG_FILE = path.join(SRC_DIR, "routes.config.json"); // optional overrides
const ROUTER_OUT = path.join(SRC_DIR, "router.tsx");
const ENTRY_CANDIDATES = [
  path.join(SRC_DIR, "main.jsx"),
  path.join(SRC_DIR, "main.tsx")
];
const INDEX_HTML = path.join(process.cwd(), "index.html");
const REPORT_FILE = path.join(process.cwd(), "ROUTE_TESTING_REPORT.md");
const SITEMAP_FILE = path.join(process.cwd(), "public/sitemap.xml");
const NOT_FOUND_NAME = "NotFound";
const NOT_FOUND_VIRTUAL = path.join(SRC_DIR, "pages/__generated__", "NotFound.jsx");
// ──────────────────────────────────────────────────────────────────────────────

const exts = [".tsx", ".jsx", ".ts", ".js"];
const routePathFromFile = (absFile) => {
  // src/pages/about/index.jsx  -> /about
  // src/pages/About.jsx        -> /about
  // src/pages/business-hub.jsx -> /business-hub
  const rel = absFile.replace(SRC_DIR + path.sep, "");
  const noExt = rel.replace(/\.[tj]sx?$/, "");
  let segs = noExt.split(path.sep);

  // strip leading 'pages' or 'components'
  if (segs[0] === "pages" || segs[0] === "components") segs.shift();
  // drop "index" at the end
  if (segs[segs.length - 1].toLowerCase() === "index") segs.pop();
  // kebab-case everything
  const toKebab = (s) => s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

  const route = "/" + segs.map(toKebab).filter(Boolean).join("/");
  return route === "/" ? "/" : route.replace(/\/+/g, "/");
};

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function readJsonIfExists(p) {
  if (!(await exists(p))) return null;
  const raw = await fs.readFile(p, "utf8");
  try { return JSON.parse(raw); } catch { return null; }
}

async function* walk(dir) {
  if (!(await exists(dir))) return;
  const items = await fs.readdir(dir, { withFileTypes: true });
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) yield* walk(p);
    else if (exts.includes(path.extname(p))) yield p;
  }
}

function dedupe(arr) {
  const seen = new Set();
  return arr.filter((x) => {
    const key = typeof x === "string" ? x : JSON.stringify(x);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function titleFromRoute(route) {
  if (route === "/") return "Home";
  return route
    .split("/").filter(Boolean).map(seg => seg.replace(/-/g, " "))
    .map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" • ");
}

async function ensureNotFound() {
  if (await exists(NOT_FOUND_VIRTUAL)) return;
  await fs.mkdir(path.dirname(NOT_FOUND_VIRTUAL), { recursive: true });
  await fs.writeFile(NOT_FOUND_VIRTUAL, `import React from 'react';
export default function ${NOT_FOUND_NAME}(){
  return (
    <div style={{padding:24,fontFamily:"system-ui"}}>
      <h1 style={{marginBottom:8}}>Page not found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
    </div>
  );
}
`);
}

async function generateRouter(entries, prioritized) {
  await ensureNotFound();

  const lines = [];
  const imports = [];
  const lazyName = (file) => {
    const base = path.basename(file).replace(/\.[tj]sx?$/,"");
    // ensure valid identifier
    const id = base.replace(/[^A-Za-z0-9_]/g, "_");
    return "Pg_" + id + "_" + crypto.createHash("md5").update(file).digest("hex").slice(0,6);
  };

  // Create stable import map: route -> { file, symbol }
  const mapping = [];
  for (const { route, file } of entries) {
    const symbol = lazyName(file);
    const rel = "./" + path.posix.relative(SRC_DIR.replace(/\\/g,"/"), file.replace(/\\/g,"/"));
    imports.push(`const ${symbol} = React.lazy(() => import(/* @vite-ignore */ '${rel}'));`);
    mapping.push({ route, symbol });
  }

  // 404
  const nfSymbol = "Pg_NotFound";
  const relNF = "./" + path.posix.relative(SRC_DIR.replace(/\\/g,"/"), NOT_FOUND_VIRTUAL.replace(/\\/g,"/"));
  imports.push(`const ${nfSymbol} = React.lazy(() => import('${relNF}'));`);

  // Sort: put prioritized routes first (e.g., "/", "/about", "/programs" etc.)
  const top = new Set(prioritized || []);
  const ordered = mapping.slice().sort((a,b) => {
    const pa = top.has(a.route) ? 0 : 1;
    const pb = top.has(b.route) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    // shorter first to avoid greedy matches in UI trees
    return a.route.length - b.route.length;
  });

  // Build routes array
  const routeLines = ordered.map(({ route, symbol }) => `  { path: '${route}', element: <${symbol} /> },`);

  lines.push(`/* AUTO-GENERATED by scripts/routes-autopilot.mjs — do not edit by hand */
import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

${imports.join("\n")}

const routes = [
${routeLines.join("\n")}
  { path: '*', element: <${nfSymbol} /> }
];

export const router = createBrowserRouter(routes);
export default router;
`);

  await fs.writeFile(ROUTER_OUT, lines.join("\n"));
  return { routeCount: ordered.length };
}

async function patchMainToUseRouter() {
  for (const entry of ENTRY_CANDIDATES) {
    if (!(await exists(entry))) continue;
    const src = await fs.readFile(entry, "utf8");
    if (/RouterProvider/.test(src)) return; // already wired
    const patched = src
      .replace(/from 'react-dom\/client'\)?;?/g, (m)=>m) // keep
      .replace(/createRoot\((.*?)\)\.render\(([\s\S]*?)\);?/m, (_m, el, comp) => {
        return `createRoot(${el}).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{padding:20}}>Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);`;
      })
      .replace(/import React(,? ?\{?[^\}]*\}?)* from 'react';?/m, (m) =>
        /Suspense/.test(m) ? m : `${m}\n// added Suspense import above if needed`
      )
      .replace(/^/m, `import React, { Suspense } from 'react';\nimport { RouterProvider } from 'react-router-dom';\nimport router from './router';\n`);
    await fs.writeFile(entry, patched);
    return;
  }
  // If no entry found, create one
  const fallback = ENTRY_CANDIDATES[0];
  await fs.mkdir(path.dirname(fallback), { recursive: true });
  await fs.writeFile(fallback, `import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{padding:20}}>Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
`);
}

async function ensureIndexHtmlHasRoot() {
  if (!(await exists(INDEX_HTML))) return;
  const html = await fs.readFile(INDEX_HTML, "utf8");
  if (!html.includes('id="root"')) {
    const patched = html.replace(/<body[^>]*>/i, (m) => `${m}\n<div id="root"></div>`);
    await fs.writeFile(INDEX_HTML, patched);
  }
}

async function scanComponents() {
  const files = [];
  for await (const f of walk(PAGES_DIR)) files.push(f);
  for await (const f of walk(COMPONENTS_DIR)) files.push(f); // optional extra pool
  // Map to routes
  const pairs = files.map((f) => ({ file: f, route: routePathFromFile(f) }))
    .filter(({route}) => !!route); // no empty
  // Prefer /pages over /components when duplicates share the same route
  const seen = new Map();
  for (const p of pairs) {
    const key = p.route;
    const prev = seen.get(key);
    if (!prev) seen.set(key, p);
    else if (prev.file.includes("/components/") && p.file.includes("/pages/")) seen.set(key, p);
  }
  return Array.from(seen.values());
}

function normalizeRoute(r) {
  if (!r) return null;
  if (!r.startsWith("/")) r = "/" + r;
  return r.replace(/\/+/g, "/");
}

async function loadConfigRoutes() {
  const cfg = await readJsonIfExists(ROUTE_CONFIG_FILE);
  if (!cfg || !Array.isArray(cfg.routes)) return [];
  return cfg.routes.map((r) => {
    if (typeof r === "string") return normalizeRoute(r);
    if (r && typeof r.path === "string") return normalizeRoute(r.path);
    return null;
  }).filter(Boolean);
}

function buildSitemapXml(routes) {
  const base = process.env.PUBLIC_URL || "https://elevateforhumanity.org";
  const urls = routes
    .filter((r) => r !== "*" && r !== "/*")
    .map((r) => `  <url><loc>${base}${r}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

async function writeReport(stats) {
  const lines = [];
  lines.push(`# ROUTE TESTING REPORT`);
  lines.push(``);
  lines.push(`**Executive Summary:**`);
  lines.push(`- Total routes in config: **${stats.configCount}**`);
  lines.push(`- Components available: **${stats.componentCount}**`);
  lines.push(`- Routes generated: **${stats.generatedCount}**`);
  lines.push(`- Coverage vs. config: **${(stats.generatedCount / Math.max(1, stats.configCount) * 100).toFixed(1)}%**`);
  lines.push(``);
  lines.push(`## Working routes (generated)`);
  for (const r of stats.generatedRoutes.slice(0, 200)) lines.push(`- ${r}`);
  if (stats.missingFromComponents.length) {
    lines.push(``);
    lines.push(`## Missing components for config routes`);
    for (const r of stats.missingFromComponents.slice(0, 300)) lines.push(`- ${r}`);
  }
  if (stats.extraComponents.length) {
    lines.push(``);
    lines.push(`## Extra component routes (not in config)`);
    for (const r of stats.extraComponents.slice(0, 300)) lines.push(`- ${r}`);
  }
  lines.push(``);
  lines.push(`_Auto-generated by \`scripts/routes-autopilot.mjs\`_`);
  await fs.writeFile(REPORT_FILE, lines.join("\n"));
}

async function main() {
  console.log('🤖 Routes Autopilot: Self-healing route configuration');
  console.log('=====================================================\n');
  
  // load declared routes (from config) and discovered components
  const configRoutes = await loadConfigRoutes(); // may be empty
  const discovered = await scanComponents();

  console.log(`📊 Discovered ${discovered.length} page components`);
  console.log(`📋 Config routes: ${configRoutes.length}`);

  const discoveredMap = new Map(discovered.map(p => [p.route, p]));
  const allRoutes = dedupe([
    ...configRoutes,
    ...discovered.map(p => p.route),
    "/", "/about", "/programs", "/apply", "/donate", "/donate.html", "/contact",
    "/support", "/login", "/hub"
  ].filter(Boolean)).map(normalizeRoute);

  // Build entries only for routes we can fulfill with a file
  const entries = [];
  const missingFromComponents = [];
  for (const r of allRoutes) {
    const hit = discoveredMap.get(r);
    if (hit) entries.push({ route: r, file: hit.file });
    else missingFromComponents.push(r);
  }

  console.log(`✅ Matched ${entries.length} routes to components`);
  if (missingFromComponents.length) {
    console.log(`⚠️  ${missingFromComponents.length} routes missing components`);
  }

  // Generate router
  const prioritized = ["/", "/about", "/programs", "/apply", "/donate", "/contact", "/login"];
  const { routeCount } = await generateRouter(entries, prioritized);

  // Patch main & ensure index.html has #root
  await patchMainToUseRouter();
  await ensureIndexHtmlHasRoot();

  // Write sitemap
  await fs.mkdir(path.dirname(SITEMAP_FILE), { recursive: true });
  await fs.writeFile(SITEMAP_FILE, buildSitemapXml(entries.map(e => e.route)));

  // Report
  const extras = [...discoveredMap.keys()].filter(r => !allRoutes.includes(r));
  await writeReport({
    configCount: configRoutes.length || allRoutes.length,
    componentCount: discovered.length,
    generatedCount: routeCount,
    generatedRoutes: entries.map(e => e.route).sort(),
    missingFromComponents: missingFromComponents.sort(),
    extraComponents: extras.sort()
  });

  console.log(`\n✅ Routes generated: ${routeCount}`);
  console.log(`📝 Report: ${path.relative(process.cwd(), REPORT_FILE)}`);
  console.log(`🗺️  Sitemap: ${path.relative(process.cwd(), SITEMAP_FILE)}`);
  console.log(`➡️  Router: ${path.relative(process.cwd(), ROUTER_OUT)}`);
  console.log('\n🚀 Self-healing routes autopilot complete!\n');
}

main().catch((e) => {
  console.error("Autopilot failed:", e);
  process.exit(1);
});
