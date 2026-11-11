#!/usr/bin/env node
"use strict";

// Checks URLs that lychee.toml excludes from CI (bot-blocked domains).
// Run locally from the project root: node scripts/check-excluded-links.js
// Requires a built _site/ directory (run `pnpm run build` first).

const { readFileSync, readdirSync, existsSync } = require("fs");
const { join } = require("path");

const ROOT = process.cwd();
const SITE_DIR = join(ROOT, "_site");
const LYCHEE_TOML = join(ROOT, "lychee.toml");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Patterns that are not real external URLs (infrastructure exclusions)
const SKIP_TERMS = ["localhost", "127.0.0.1", "0.0.0.0", "example.com", "mailto:"];

function parseExcludePatterns() {
  const content = readFileSync(LYCHEE_TOML, "utf8");
  const match = content.match(/^exclude\s*=\s*\[([\s\S]*?)\]/m);
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

function isCheckablePattern(pattern) {
  return (
    pattern.startsWith("https://") &&
    !SKIP_TERMS.some((term) => pattern.includes(term))
  );
}

function walkHtml(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkHtml(path));
    else if (entry.name.endsWith(".html")) results.push(path);
  }
  return results;
}

function extractUrls(htmlFiles) {
  const urls = new Set();
  for (const file of htmlFiles) {
    const content = readFileSync(file, "utf8");
    for (const [, url] of content.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
      urls.add(url);
    }
  }
  return urls;
}

function matchesPattern(url, pattern) {
  try {
    return new RegExp(pattern).test(url);
  } catch {
    return url.includes(pattern);
  }
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: null, error: e.message };
  }
}

async function main() {
  if (!existsSync(SITE_DIR)) {
    console.error("_site/ not found — run `pnpm run build` first.");
    process.exit(1);
  }

  const checkablePatterns = parseExcludePatterns().filter(isCheckablePattern);
  const allUrls = extractUrls(walkHtml(SITE_DIR));

  const urlsToCheck = [...allUrls].filter((url) =>
    checkablePatterns.some((pattern) => matchesPattern(url, pattern))
  );

  if (urlsToCheck.length === 0) {
    console.log("No excluded URLs found in site content.");
    return;
  }

  console.log(`Checking ${urlsToCheck.length} excluded URL(s)...\n`);

  let passed = 0;
  let failed = 0;

  for (const url of urlsToCheck) {
    const result = await checkUrl(url);
    if (result.ok) {
      console.log(`✓ [${result.status}] ${url}`);
      passed++;
    } else {
      const detail = result.error ?? `HTTP ${result.status}`;
      console.log(`✗ [${detail}] ${url}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
