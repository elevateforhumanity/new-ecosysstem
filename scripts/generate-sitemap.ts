import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";
import { SitemapStream, streamToPromise } from "sitemap";

const DOMAIN =
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "http://localhost:3000"; // safe local default

const outDir = resolve(process.cwd(), "dist");

type Route = string | { path: string };
async function getStaticPaths(): Promise<string[]> {
  try {
    // Try both with and without extension
    const mod =
      (await import("../src/routes.ts").catch(() => null)) ??
      (await import("../src/routes").catch(() => null));
    const routes: Route[] = (mod as any)?.routes ?? [];
    return routes
      .map((r: Route) => (typeof r === "string" ? r : r?.path))
      .filter(Boolean) as string[];
  } catch {
    return ["/"];
  }
}

async function main() {
  const paths = await getStaticPaths();
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // Generate a single sitemap.xml
  const stream = new SitemapStream({ hostname: DOMAIN });
  for (const p of paths) {
    stream.write({
      url: p,
      changefreq: "weekly",
      priority: p === "/" ? 1.0 : 0.8,
    });
  }
  stream.end();
  const xml = await streamToPromise(stream);
  writeFileSync(resolve(outDir, "sitemap.xml"), xml.toString(), "utf8");

  // Generate an index pointing to sitemap.xml
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${DOMAIN}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
  writeFileSync(resolve(outDir, "sitemap-index.xml"), indexXml, "utf8");

  // robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap-index.xml
`;
  writeFileSync(resolve(outDir, "robots.txt"), robotsTxt, "utf8");

  console.log("✅ Generated sitemap.xml, sitemap-index.xml, and robots.txt in dist/");
}

main().catch((e) => {
  console.error("❌ Sitemap generation failed:", e);
  process.exit(1);
});