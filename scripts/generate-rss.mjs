import fs from "fs";
import path from "path";

const SITE_URL = process.env.SITE_URL || "https://frontierinsight.dev";
const OUT_DIR = path.join(process.cwd(), "out");

function discoverDigests(locale) {
  const localeDir = path.join(OUT_DIR, locale, "digest");
  if (!fs.existsSync(localeDir)) return [];

  const digests = [];
  const entries = fs.readdirSync(localeDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const htmlPath = path.join(localeDir, entry.name, "index.html");
    if (!fs.existsSync(htmlPath)) continue;

    const html = fs.readFileSync(htmlPath, "utf-8");
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
    const dateMatch = html.match(/data-pagefind-meta="[^"]*date:([^,"]*)/);

    digests.push({
      slug: entry.name,
      title: titleMatch
        ? titleMatch[1].replace(/<[^>]*>/g, "").trim()
        : entry.name,
      date: dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0],
    });
  }

  return digests.sort((a, b) => b.date.localeCompare(a.date));
}

function generateRss(locale, digests) {
  const lang = locale === "zh" ? "zh-CN" : "en";
  const siteName = locale === "zh" ? "Frontier Insight" : "Frontier Insight";
  const description =
    locale === "zh"
      ? "全球前沿科学与硬核科普每日简报"
      : "Daily Briefing on Global Frontier Science";

  const items = digests
    .map(
      (d) => `    <item>
      <title><![CDATA[${d.title}]]></title>
      <link>${SITE_URL}/${locale}/digest/${d.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/${locale}/digest/${d.slug}/</guid>
      <pubDate>${new Date(d.date).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <description>${description}</description>
    <link>${SITE_URL}/${locale}/</link>
    <language>${lang}</language>
    <atom:link href="${SITE_URL}/${locale}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

for (const locale of ["zh", "en"]) {
  const digests = discoverDigests(locale);
  if (digests.length === 0) {
    console.log(`No digests found for ${locale}, skipping RSS`);
    continue;
  }
  const rss = generateRss(locale, digests);
  const localeDir = path.join(OUT_DIR, locale);
  if (!fs.existsSync(localeDir)) fs.mkdirSync(localeDir, { recursive: true });
  fs.writeFileSync(path.join(localeDir, "feed.xml"), rss);
  console.log(`RSS feed generated: ${locale} (${digests.length} items)`);
}
