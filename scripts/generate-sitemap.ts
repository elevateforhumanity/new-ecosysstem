import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { SitemapStream, streamToPromise } from "sitemap";
import { routes } from "../src/routes";

const DOMAIN =
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://yourdomain.com";
const outDir = resolve(process.cwd(), "dist");
const CHUNK_SIZE = 50000;

// Support string[] or { path: string }[]
const staticPaths: string[] = (routes as any[])
  .map((r) => (typeof r === "string" ? r : r?.path))
  .filter(Boolean);

async function getDynamicPaths(): Promise<string[]> {
  const endpoint = process.env.SITEMAP_DYNAMIC_ENDPOINT; // optional JSON array endpoint
  if (!endpoint) return [];
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return [];
    const arr = (await res.json()) as string[];
    return Array.isArray(arr) ? arr.filter((p) => typeof p === "string") : [];
  } catch {
    return [];
  }
}

async function generate() {
  const dynamicPaths = await getDynamicPaths();
  const allPaths = Array.from(new Set([...staticPaths, ...dynamicPaths]));

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const sitemapFiles: string[] = [];
  for (let i = 0; i < allPaths.length; i += CHUNK_SIZE) {
    const chunk = allPaths.slice(i, i + CHUNK_SIZE);
    const sm = new SitemapStream({ hostname: DOMAIN });
    for (const p of chunk)
      sm.write({ url: p, changefreq: "weekly", priority: p === "/" ? 1.0 : 0.8 });
    sm.end();
    const data = await streamToPromise(sm);
    const fileName = `sitemap-${sitemapFiles.length + 1}.xml`;
    writeFileSync(resolve(outDir, fileName), data.toString());
    sitemapFiles.push(fileName);
  }

  const today = new Date().toISOString().split("T")[0];
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map((f) => `  <sitemap><loc>${DOMAIN}/${f}</loc><lastmod>${today}</lastmod></sitemap>`).join("\n")}
</sitemapindex>`;
  writeFileSync(resolve(outDir, "sitemap-index.xml"), indexXml);

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap-index.xml
`;
  writeFileSync(resolve(outDir, "robots.txt"), robotsTxt);

  console.log("✅ Sitemaps + robots.txt generated in dist/");
}
generate().catch((e) => {
  console.error(e);
  process.exit(1);
});