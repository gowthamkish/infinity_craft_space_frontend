/**
 * Regenerates public/sitemap.xml from the live product list on every build (npm "prebuild").
 *
 * Why: the sitemap Google reads is served from this site as a static file. A hand-written file only listed 5
 * pages, so Google was never told about the products or blog posts. The server already builds a complete sitemap;
 * this copies it into the build, fixing the web address so it matches the canonical host the pages declare.
 *
 * It can never break a deploy: if the server can't be reached or returns something odd, the existing
 * public/sitemap.xml is kept and the build carries on.
 *
 * Env (all optional):  SITEMAP_SOURCE_URL  where to fetch the server's sitemap   (default: production API)
 *                      SITE_URL            the public address, no trailing slash (default: https://infinitycraftspace.com)
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SITE = (process.env.SITE_URL || "https://infinitycraftspace.com").replace(/\/+$/, "");
const SOURCE = process.env.SITEMAP_SOURCE_URL || "https://infinity-craft-space-backend.onrender.com/sitemap.xml";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sitemap.xml");
const MIN_URLS = 6; // the old hand-written file had 5

const log = (m) => console.log(`[sitemap] ${m}`);

/** Pure: point every <loc> at the canonical address and check the result is a usable sitemap. */
export function normalise(xml, site = SITE) {
  if (!/<urlset[\s>]/.test(xml)) throw new Error("not a sitemap (no <urlset>)");
  const host = new URL(site).host.replace(/^www\./, "");
  const fixed = xml.replace(/<loc>\s*([^<]+?)\s*<\/loc>/g, (_, loc) => {
    const u = new URL(loc.replace(/&amp;/g, "&"));
    if (u.host.replace(/^www\./, "") !== host) throw new Error(`unexpected host in sitemap: ${u.host}`);
    return `<loc>${site}${u.pathname}${u.search.replace(/&/g, "&amp;")}</loc>`;
  });
  const count = (fixed.match(/<url>/g) || []).length;
  if (count < MIN_URLS) throw new Error(`only ${count} URLs — refusing to overwrite the existing sitemap`);
  return { xml: fixed, count };
}

async function fetchWithRetry() {
  let last;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // The API only answers browsers' requests, which always carry an Origin header; send the site's own.
      const res = await fetch(SOURCE, { headers: { Origin: SITE, "User-Agent": "sitemap-build" }, signal: AbortSignal.timeout(75_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      last = e;
      log(`attempt ${attempt} failed: ${e.message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 4000)); // a sleeping free-tier server needs a moment
    }
  }
  throw last;
}

async function main() {
  try {
    const { xml, count } = normalise(await fetchWithRetry());
    const old = await readFile(OUT, "utf8").catch(() => "");
    if (old === xml) return log(`already up to date (${count} URLs)`);
    await writeFile(OUT, xml);
    log(`wrote ${count} URLs to public/sitemap.xml`);
  } catch (e) {
    log(`kept the existing sitemap.xml (${e.message})`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
