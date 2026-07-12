#!/usr/bin/env node
/**
 * check-no-secrets.mjs
 *
 * CI release gate: scans an already-built dist/ directory for accidentally
 * bundled API keys/secrets. Run `npm run build` first.
 *
 * Pure Node, ESM, no external deps.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DIST_DIR = join(process.cwd(), "dist");

/**
 * Patterns are intentionally targeted (key-shaped value, or a key-ish name
 * nearby) to avoid false-positiving on ordinary minified JS, long variable
 * names, or base64 sourcemap blobs.
 */
const PATTERNS = [
  {
    name: "OpenAI-style secret key",
    // sk- followed by 20+ alphanumeric/underscore chars. Hyphens are
    // deliberately excluded from the body: real OpenAI key bodies don't
    // contain literal "-", and including it causes false positives on
    // Vite-generated locale-chunk filenames like "sk-SK-<hash>.js".
    regex: /sk-[A-Za-z0-9_]{20,}/g,
  },
  {
    name: "Google API key",
    // AIza followed by 35 chars (base64url-ish)
    regex: /AIza[0-9A-Za-z_-]{35}/g,
  },
  {
    name: "OPENAI_API_KEY / GEMINI_API_KEY literal assignment",
    // e.g. OPENAI_API_KEY="...", GEMINI_API_KEY: 'sk-...', GEMINI_API_KEY=abc123
    regex: /(?:OPENAI_API_KEY|GEMINI_API_KEY)\s*[:=]\s*["'`]?[A-Za-z0-9_\-./+]{8,}["'`]?/g,
  },
  {
    name: "Azure/Cognitive-style key near key-ish name",
    // Require a key-ish identifier (api-key / apiKey / api_key / AZURE_*) within
    // ~40 chars before a long hex or base64 run, so we don't flag arbitrary
    // long hashes (e.g. content hashes, sourcemap ids) on their own.
    regex: /(?:api[-_]?key|AZURE[A-Z0-9_]*)["'`]?\s*[:=]\s*["'`]?([A-Fa-f0-9]{32,}|[A-Za-z0-9+/]{32,}={0,2})["'`]?/gi,
  },
];

/** Mask the middle of a matched string, keeping a few chars on each end. */
function redact(match) {
  if (match.length <= 10) return "*".repeat(match.length);
  const head = match.slice(0, 4);
  const tail = match.slice(-4);
  return `${head}${"*".repeat(Math.max(match.length - 8, 4))}${tail}`;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, files);
    } else if (st.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function main() {
  let distStat;
  try {
    distStat = statSync(DIST_DIR);
  } catch {
    console.error(`dist/ directory not found at ${DIST_DIR}. Run "npm run build" first.`);
    process.exit(1);
    return;
  }
  if (!distStat.isDirectory()) {
    console.error(`${DIST_DIR} exists but is not a directory.`);
    process.exit(1);
    return;
  }

  const files = walk(DIST_DIR);
  // Known-public library defaults that are safe to ship (not our secrets).
  // Firebase client API keys are gated by security rules, not secrecy; this one
  // is Excalidraw's bundled default for its public oss-collab server.
  const ALLOWLIST = [
    "AIzaSyAd15pYlMci_xIp9ko6wkEsDzAAA0Dn0RU", // @excalidraw/excalidraw bundled Firebase config
  ];

  const findings = [];

  for (const file of files) {
    let content;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      // Skip binary/unreadable files (images, fonts, etc.)
      continue;
    }

    for (const { name, regex } of PATTERNS) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (ALLOWLIST.some((allowed) => match[0].includes(allowed))) {
          if (match[0].length === 0) regex.lastIndex++;
          continue;
        }
        findings.push({
          file: relative(process.cwd(), file),
          pattern: name,
          snippet: redact(match[0]),
        });
        // Guard against zero-length match infinite loops.
        if (match[0].length === 0) regex.lastIndex++;
      }
    }
  }

  if (findings.length > 0) {
    console.error(`Found ${findings.length} potential secret(s) in dist/:\n`);
    for (const f of findings) {
      console.error(`  [${f.pattern}] ${f.file}\n    ${f.snippet}\n`);
    }
    process.exit(1);
    return;
  }

  console.log("no secrets found in dist/");
  process.exit(0);
}

main();
