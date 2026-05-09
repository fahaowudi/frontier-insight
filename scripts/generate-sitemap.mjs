import fs from "fs";
import path from "path";

const SITE_URL = process.env.SITE_URL || "https://frontierinsight.dev";
const OUT_DIR = path.join(process.cwd(), "out");

function discoverPages() {
  const pages = [];

  function walk(dir, urlPath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "pagefind") continue;
      const fullPath = path.join(dir, entry.name);
      const fullUrl = urlPath ? `${urlPath}/${entry.name}` : `/${entry.name}`;
      if (entry.isDirectory()) {
        if (fs.existsSync(path.join(fullPath, "index.html"))) {
          pages.push(fullUrl);
        }
        walk(fullPath, fullUrl);
      }
    }
  }

  walk(OUT_DIR);
  return pages;
}

function getPriority(url) {
  if (url === "/zh" || url === "/en") return "1.0";
  if (url.includes("/digest/")) return "0.8";
  if (url.includes("/archive")) return "0.6";
  return "0.4";
}

function getChangefreq(url) {
  if (url === "/zh" || url === "/en") return "daily";
  if (url.includes("/digest/")) return "daily";
  if (url.includes("/archive")) return "weekly";
  return "monthly";
}

function generateSitemap(pages) {
  const today = new Date().toISOString().split("T")[0];
  const urls = pages
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}${p}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${getChangefreq(p)}</changefreq>
    <priority>${getPriority(p)}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

const pages = discoverPages();
const sitemap = generateSitemap(pages);
fs.writeFileSync(path.join(OUT_DIR, "sitemap.xml"), sitemap);
console.log(`Sitemap generated: ${pages.length} pages`);
