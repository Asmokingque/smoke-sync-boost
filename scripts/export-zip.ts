import { spawnSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// One-click export script for Anderson’s Smoking Que.
// Run: npm run export:zip
// Generates a downloadable zip of the website source, excluding build artifacts,
// dependencies, secrets, and workspace-specific files.

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

const OUTPUT_DIR = existsSync("/mnt/documents")
  ? "/mnt/documents"
  : resolve(PROJECT_ROOT, "dist");

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const OUTPUT_PATH = resolve(OUTPUT_DIR, "asmokingque-website.zip");

const EXCLUSIONS = [
  "node_modules/*",
  ".git",
  ".git/*",
  ".workspace/*",
  ".agents/*",
  ".claude/*",
  "dist/*",
  "build/*",
  "*.tsbuildinfo",
  "bun.lockb",
  ".env",
  ".env.development",
  ".env.local",
  ".DS_Store",
  "*.DS_Store",
  "Thumbs.db",
];

console.log(`Exporting website source from ${PROJECT_ROOT}...`);
console.log(`Output: ${OUTPUT_PATH}`);

const result = spawnSync(
  "zip",
  ["-r", OUTPUT_PATH, ".", "-x", ...EXCLUSIONS],
  { cwd: PROJECT_ROOT, stdio: "inherit" }
);

if (result.status !== 0) {
  console.error("Export failed.");
  process.exit(result.status ?? 1);
}

const stats = statSync(OUTPUT_PATH);
console.log(`\nExport complete: ${OUTPUT_PATH}`);
console.log(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
