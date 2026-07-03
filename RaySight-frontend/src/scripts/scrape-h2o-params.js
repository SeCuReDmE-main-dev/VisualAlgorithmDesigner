import fs from 'node:fs/promises';

const DEFAULT_URL = 'https://docs.h2o.ai/h2o/latest-stable/h2o-docs/data-science.html';
const OUTPUT_PATH = new URL('../services/h2o-params.snapshot.json', import.meta.url);

function extractLinks(html) {
  const matches = html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis);

  return [...matches]
    .map((match) => ({
      href: match[1],
      label: match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    }))
    .filter((link) => /gbm|glm|random forest|deep learning|k-means|automl/i.test(`${link.href} ${link.label}`));
}

async function main() {
  const url = process.argv[2] ?? DEFAULT_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  const html = await response.text();
  const snapshot = {
    sourceUrl: url,
    scrapedAt: new Date().toISOString(),
    links: extractLinks(html),
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${snapshot.links.length} H2O links to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
