#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const examplePath = path.join(root, "wrangler.production.jsonc.example");
const outputPath = path.join(root, "wrangler.production.jsonc");

const d1DatabaseId = process.env.D1_DATABASE_ID?.trim();
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();

if (!d1DatabaseId) {
  if (fs.existsSync(outputPath)) {
    console.log("Using existing wrangler.production.jsonc");
    process.exit(0);
  }

  console.error(
    [
      "Missing production Wrangler config.",
      "",
      "Option A — create a local file (recommended for manual deploy):",
      "  cp wrangler.production.jsonc.example wrangler.production.jsonc",
      "  # edit account_id and database_id, then npm run deploy",
      "",
      "Option B — generate from environment variables (recommended for CI):",
      "  export D1_DATABASE_ID=<uuid from: wrangler d1 create ternssh>",
      "  export CLOUDFLARE_ACCOUNT_ID=<optional, your Cloudflare account id>",
      "  npm run deploy",
    ].join("\n"),
  );
  process.exit(1);
}

let content = fs.readFileSync(examplePath, "utf8");
content = content.replaceAll("__D1_DATABASE_ID__", d1DatabaseId);

if (accountId) {
  content = content.replaceAll("__CLOUDFLARE_ACCOUNT_ID__", accountId);
} else {
  content = content.replace(/^\s*"account_id": "__CLOUDFLARE_ACCOUNT_ID__",\n/m, "");
}

fs.writeFileSync(outputPath, content);
console.log(`Wrote ${path.relative(root, outputPath)}`);
